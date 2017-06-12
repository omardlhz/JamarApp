/**
 * nombre de archivo: createAppointment.js
 * descripción: Encargado de crear reuniones en una sala.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */

//ALERTA: Solo utilizar cuando no hay protocolo SSL.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var EWS = require("node-ews");


Meteor.methods({
	'createAppointment': function(userId, encKey, appointmentData) {

		var user = Meteor.users.findOne(userId);

		var exec = Async.runSync(function (done){

			var ewsConfig = {
			  username: user.username,
			  password: CryptoJS.AES.decrypt(user.encPass, encKey).toString(CryptoJS.enc.Utf8),
			  host: 'https://mail.mueblesjamar.com.co/'
			};

			var ewsSoapHeader = {
			  't:RequestServerVersion': {
			    attributes: {
			      Version: "Exchange2007"
			    }
			  }
			};

			var ews = new EWS(ewsConfig);

			var ewsFunction = 'CreateItem';

			// define ews api function args
			var ewsArgs = {
			  "attributes" : {
			    "SendMeetingInvitations" : "SendToAllAndSaveCopy"
			  },
			  "Items" : {
			    "CalendarItem" : {
			      "Subject" : appointmentData.Subject,
			      "Start" : appointmentData.Start,
			      "End" : appointmentData.End
			    }
			  }
			};

			// Si la reunión tiene invitados, agregarlos al evento.
			if(appointmentData.Attendees.length > 0){

				ewsArgs.Items.CalendarItem.RequiredAttendees = {

					$xml: buildAttendees(appointmentData.Attendees)
				}
			}


			// Agregar ubicación de reunión al evento.
			ewsArgs.Items.CalendarItem.Resources = {

				"Attendee": {
			      	"Mailbox": {
			      		"EmailAddress": appointmentData.Location
			      	}
			    }
			}

			// Hacer petición a servidor EWS.
			ews.run(ewsFunction, ewsArgs, ewsSoapHeader).then(result => {

			    done(null);
			}).catch(err => {

				done(err.stack);
			});
		});

		if(!exec.error){

			return true;
		}
		else{

			console.log(exec.error);

			return false;
		}
	}
});


/**
 * Crea el objeto XML de los invitados a la reunión.
 *
 * @param      {string}  attendees  Invitados a la reunión.
 * @return     {string}  XML de invitados.
 */
function buildAttendees(attendees){

	var attendString = "";

	for(var i = 0; i < attendees.length; i++){

		attendString += "<t:Attendee>";
		attendString += "<t:Mailbox>";
		attendString += "<t:EmailAddress>";
		attendString += attendees[i] + "@mueblesjamar.com.co";
		attendString += "</t:EmailAddress>";
		attendString += "</t:Mailbox>";
		attendString += "</t:Attendee>";
	}

	return attendString;
}
