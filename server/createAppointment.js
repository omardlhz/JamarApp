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
		  		"locationEmailAddress": appointmentData.Location
		  	}
		  }
		}

		if(appointmentData.Attendees.length > 0){

			options.form.attendees = buildAttendees(appointmentData.Attendees);
		}

		var exec = Async.runSync(function(done){

			request.post(options, Meteor.bindEnvironment(function(error, response, body){

				console.log(response);
				done(null, true);
			}));
		});
	}
});

function buildAttendees(attendees){

	var attendArray = [];

	for(var i = 0; i < attendees.length; i++){

		attendArray.push({
			"emailAddress": { "address": attendees[i] + "@" + Meteor.settings.COMPANY_DOMAIN },
			"type": "required"
		});
	}

	return attendArray;
}