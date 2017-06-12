/**
 * nombre de archivo: eventMonitor.js
 * descripción: Monitorea los eventos del calendario EWS del usuario.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com);
 *
 */

//ALERTA: Solo utilizar cuando no hay protocolo SSL.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';


var ews = Npm.require("ews-javascript-api");


// Deshabilitar el logging en la consola (Habilitar para modo desarrollo)
ews.EwsLogging.DebugLogEnabled = false

var ntlmXHR = require("./ntlmXHRApi");
var ExchangeService = ews.ExchangeService;
var ExchangeVersion = ews.ExchangeVersion;
var ExchangeCredentials = ews.ExchangeCredentials;
var Uri = ews.Uri;
var CalendarView = ews.CalendarView;
var DateTime = ews.DateTime;
var WellKnownFolderName = ews.WellKnownFolderName;


Meteor.methods({

	// Monitorea si cambios en calendario de usuario.
	'monitorEvents': function(userId, encKey, usuario){

		var user = Meteor.users.findOne(userId);


		// Usuario para el cual se buscará el calendario.
		// Si el parametro usuario no está definido, calUser
		// es el usario actualmente registrado.
		var calUser = (usuario) ? usuario : user.username;

		// Hacer llamado a EWS para recopilar los eventos de la semana del usuario.
		var exec = Async.runSync(function (done){

			var ntlmXHRApi = new ntlmXHR.ntlmXHRApi(user.username, CryptoJS.AES.decrypt(user.encPass, encKey).toString(CryptoJS.enc.Utf8));

			var exch = new ExchangeService(ExchangeVersion.Exchange2007);
			exch.XHRApi = ntlmXHRApi;
	    	exch.Credentials = new ews.ExchangeCredentials("null", "null"); // Evitar error de credenciales.
	    	exch.Url = new ews.Uri("https://mail.mueblesjamar.com.co/EWS/Exchange.asmx");

	    	var view = new CalendarView(DateTime.Now.Add(-1, "week"), DateTime.Now.Add(4, "week"));

	    	exch.FindAppointments(new ews.FolderId(WellKnownFolderName.Calendar, new ews.Mailbox(calUser + "@mueblesjamar.com.co")), view).then((response) => {

	    		done(null, response.Items);
	    	}, function (err) {

	    		done(err);
	    	});
		});

		// Agregar eventos recopilados a la base de datos.
		var add = Async.runSync(function (done){

			// ID's de eventos recibidos para usuario actual.
			var eventIds = [];

			for(var i = 0; i < exec.result.length; i++){
				
				var subject = String(exec.result[i].Subject);
				var changeKey = String(exec.result[i].Id.ChangeKey);
				var startTime = String(exec.result[i].Start);
				var endTime = String(exec.result[i].End);

				var doc = Events.findOne({_id: exec.result[i].Id.UniqueId});

				// Si el evento ha sido cancelado, no agregar a lista
				// de eventos.
				if(subject.indexOf("Cancel") === -1){

					eventIds.push(exec.result[i].Id.UniqueId);
				}

				// Revisar si el evento ya existe en la base de datos.
				if(doc){

					//  Si existe, revisar si se debe actualizar.
					if(doc.subject != subject || doc.startTime != startTime || doc.endTime != endTime || doc.changeKey != changeKey){

						Events.update(
							{_id: doc._id},
							{$set:
								{
									username: calUser,
									subject: subject,
									startTime: startTime,
									endTime: endTime,
									changeKey: changeKey
								}
							}
						);
					}
				}
				else{

					Events.insert({
						_id: exec.result[i].Id.UniqueId,
						username: calUser,
						subject: subject,
						startTime: startTime,
						endTime: endTime
					});
				}
			}

			// Eliminar todos los otros eventos de este usuario
			// que existen en MongoDB y ya no están en EWS.
			Events.remove({$and: [{username: {$eq: calUser}}, {_id: {$nin: eventIds}}]});

			done(null);
		});

		return true;
	}
});
