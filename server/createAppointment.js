/**
 * nombre de archivo: createAppointment.js
 * descripción: Encargado de crear reuniones en una sala.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */

 //ALERTA: Solo utilizar cuando no hay protocolo SSL.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
var request = require('request');
var getToken = require("./getToken");
var Future = Npm.require('fibers/future');

Meteor.methods({
	'createAppointment': function(usuario, appointmentData){

		var url = 'https://graph.microsoft.com/v1.0/users/' + usuario + "@" + Meteor.settings.COMPANY_DOMAIN + '/calendar/events';

		
		var options = {
		  url: url,
		  headers: {
		    'Authorization': "Bearer " + getToken.getToken(usuario)
		  },
		  json: {
		  	"Subject": appointmentData.Subject,
		  	"Start": {
		  		"DateTime": appointmentData.Start,
		  		"TimeZone": "SA Pacific Standard Time"
		  	},
		  	"End": {
		  		"DateTime": appointmentData.End,
		  		"TimeZone": "SA Pacific Standard Time"
		  	},
		  	"Location": {
		  		"displayName": appointmentData.Location,
		  		"locationEmailAddress": String(appointmentData.Location)
		  	}
		  }
		}


		var exec = Async.runSync(function(done){

			if(appointmentData.Attendees.length >= 0){

				options.json.Attendees = buildAttendees(appointmentData.Attendees, appointmentData.Location);
			}

			request.post(options, Meteor.bindEnvironment(function(error, response, body){

				done(null, true);
			}));
		});

		if(exec.result == true){

			return true;
		}
		else{

			return false;
		}
	}
});

function buildAttendees(attendees, room){

	var attendArray = [];

	for(var i = 0; i < attendees.length; i++){

		attendArray.push({
			"emailAddress": { "address": attendees[i] + "@" + Meteor.settings.COMPANY_DOMAIN },
			"type": "required"
		});
	}

	attendArray.push({
		"emailAddress": { "address": room},
		"type": "Resource"
	});

	return attendArray;
}