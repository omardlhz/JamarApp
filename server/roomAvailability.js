/**
 * nombre de archivo: roomAvailability.js
 * descripción: Busca la disponibilidad de una sala
 * 				desde la más apropiada a la menos apropiada.
 * 				
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */

//ALERTA: Solo utilizar cuando no hay protocolo SSL.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
var request = require('request');
var getToken = require("./getToken");
var Future = Npm.require('fibers/future');

Meteor.methods({
	'roomAvailability': function(usuario, rooms, startTime, endTime){

		var token = getToken.getToken(usuario);

		for(var i = 0; i < rooms.length; i++){

			console.log(rooms[i]);

			var url = 'https://graph.microsoft.com/v1.0/users/' + rooms[i].username + "@" + Meteor.settings.COMPANY_DOMAIN + '/calendarview'

			var options = {
			  url: url,
			  headers: {
			    'Authorization': "Bearer " + token,
			    'Prefer': 'outlook.timezone = "SA Pacific Standard Time"'
			  },
			  qs: {
			  	StartDateTime: startTime,
				EndDateTime: endTime,
				$top: "1"
			  }
			}

			var exec = Async.runSync(function(done){

				request(options, Meteor.bindEnvironment(function(error, response, body){

					if (!error && response.statusCode == 200) {

						var res = JSON.parse(body);
						done(null, res.value.length);
					}
					else{

						var res = JSON.parse(body);
						done(new Meteor.Error(response.statusCode, res.error.message), null);
					}
				}));
			});

			if(exec.result == 0){

				return rooms[i].username;
			}
		}

		return null;
	}
});