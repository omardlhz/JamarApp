/**
 * nombre de archivo: roomEvent.js
 * descripción: Funciones para eleminar evento de sala EWS.
 * creado por: Omar De La Hoz
 */

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
var request = require('request');
var getToken = require("./getToken");

Meteor.methods({
	'removeEvent': function(usuario, eventId, roomName){

		var url = "https://graph.microsoft.com/v1.0/users/" + roomName + "@" + Meteor.settings.COMPANY_DOMAIN + '/events/';
		
		var options = {
		  url: url + eventId,
		  headers: {
		    'Authorization': "Bearer " + getToken.getToken(usuario)
		  }
		}

		var exec = Async.runSync(function(done){

			request.del(options, Meteor.bindEnvironment(function(error, response, body){

				if (!error && response.statusCode === 204){
					
			  		done(null, true);
			  	}
			  	else{
			  		
			  		done(new Meteor.Error(405, "Error al Eliminar."), null);
			  	}
			}));
		});

		if(exec.result){

			return exec.result;
		}
		else{

			return exec.error;
		}
	}
});