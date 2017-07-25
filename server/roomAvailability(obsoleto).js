/**
 * nombre de archivo: roomAvailability.js
 * descripción: Busca la disponibilidad de una sala
 * 				desde la más apropiada a la menos apropiada.
 * 				
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 * 
 * ALETRA: Este archivo se encuentra obsoleto.
 * Fue reemplazado por roomAvailability para Office365
 */

//ALERTA: Solo utilizar cuando no hay protocolo SSL.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var ews = Npm.require("ews-javascript-api");
var ntlmXHR = require("./ntlmXHRApi");
var ExchangeService = ews.ExchangeService;
var ExchangeVersion = ews.ExchangeVersion;
var ExchangeCredentials = ews.ExchangeCredentials;
var Uri = ews.Uri;
var CalendarView = ews.CalendarView;
var DateTime = ews.DateTime;
var WellKnownFolderName = ews.WellKnownFolderName;


Meteor.methods({
	'roomAvailabilityOLD': function(userId, encKey, rooms, startTime, endTime) {

		var user = Meteor.users.findOne(userId);

		for(var i = 0; i < rooms.length; i++){

			var exec = Async.runSync(function (done){

				var ntlmXHRApi = new ntlmXHR.ntlmXHRApi(user.username, CryptoJS.AES.decrypt(user.encPass, encKey).toString(CryptoJS.enc.Utf8));

				var exch = new ExchangeService(ExchangeVersion.Exchange2007);
				exch.XHRApi = ntlmXHRApi;
		    	exch.Credentials = new ews.ExchangeCredentials("null", "null"); // Evitar error de credenciales.
		    	exch.Url = new ews.Uri("https://mail.mueblesjamar.com.co/EWS/Exchange.asmx");

		    	var view = new CalendarView(DateTime.Parse(startTime), DateTime.Parse(endTime));

		    	exch.FindAppointments(new ews.FolderId(WellKnownFolderName.Calendar, new ews.Mailbox(rooms[i].username + "@mueblesjamar.com.co")), view).then((response) => {

		    		var items = response.Items;

		    		done(null, items.length);
		    	}, function(error){

		    		done(error);
		    	});
			});

			if(exec.result == 0){

				return rooms[i].username;
			}
		}

		return null;
	}
});
