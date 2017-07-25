/**
 * nombre de archivo: monitorEvents.js
 * descripción: Monitorea los eventos del calendario Office 365 del usuario.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com);
 *
 */

//ALERTA: Solo utilizar cuando no hay protocolo SSL.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
var request = require('request');
var getToken = require("./getToken");
var Future = Npm.require('fibers/future');


Meteor.methods({
	'monitorEvents': function(usuario, calUser){

		calUser = (calUser) ? calUser : usuario;

		var now = new Date();
		var past_time = new Date().setDate(now.getDate() - 7);
		var future_time = new Date().setDate(now.getDate() + 28);
		var url = 'https://graph.microsoft.com/v1.0/users/' + calUser + "@" + Meteor.settings.COMPANY_DOMAIN + '/calendarview'

		var options = {
		  url: url,
		  headers: {
		    'Authorization': "Bearer " + getToken.getToken(usuario),
		    'Prefer': 'outlook.timezone = "SA Pacific Standard Time"'
		  },
		  qs: {
		  	StartDateTime: new Date(past_time).toISOString(),
			EndDateTime: new Date(future_time).toISOString(),
			$top: "1000"
		  }
		}

		// ID's de eventos recibidos para usuario actual.
		var eventIds = [];

		// Caputrar el valor asincrono.
		var future = new Future();

		request(options, Meteor.bindEnvironment(function(error, response, body){


			if (!error && response.statusCode == 200) {

				var res = JSON.parse(body);

				var events = res.value;

				for(var i = 0; i < events.length; i++){

					var eventId = events[i].id;
					var subject = (events[i].subject) ? events[i].subject : "Sin Asunto";
					var startTime = events[i].start.dateTime;
					var endTime = events[i].end.dateTime;
					var changeKey = events[i].changeKey;
					
					// Si el evento ha sido cancelado, no agregar a lista
					// de eventos.
					if(subject.indexOf("Cancel") === -1){

						eventIds.push(eventId);
					}

					var doc = Events.findOne({_id: eventId});

					// Revisar si el evento ya existe en la base de datos.
					if(doc){

						// Si existe, revisar si se debe actualizar.
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
							_id: eventId,
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

				future["return"](true);
			}
			else{

				var res = JSON.parse(body);
				future.throw(new Meteor.Error(response.statusCode, res.error.message));
			}
		}));

		return future.wait();
	}
});
