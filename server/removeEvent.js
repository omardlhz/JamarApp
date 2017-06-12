/**
 * nombre de archivo: roomEvent.js
 * descripción: Funciones para eleminar evento de sala EWS.
 * creado por: Omar De La Hoz
 */


//ALERTA: Solo utilizar cuando no hay protocolo SSL.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var EWS = require("node-ews");

Meteor.methods({
	'removeEvent': function(userId, encKey, eventId, changeKey){

		var user = Meteor.users.findOne(userId);

		var exec = Async.runSync(function(done){

			var ewsConfig = {
			  username: user.username,
			  password: CryptoJS.AES.decrypt(user.encPass, encKey).toString(CryptoJS.enc.Utf8),
			  host: 'https://mail.mueblesjamar.com.co/'
			};

			var ewsSoapHeader = {
			  't:RequestServerVersion': {
			    attributes: {
			      Version: "Exchange2007_SP1"
			    }
			  }
			};

			var ews = new EWS(ewsConfig);

			var ewsFunction = 'DeleteItem';

			var ewsArgs = {
				"attributes":{
					"DeleteType":"MoveToDeletedItems",
					"SendMeetingCancellations":"SendToAllAndSaveCopy"
				},
				"ItemIds":{
					"ItemId":{
						"attributes":{
							"Id": eventId,
							"ChangeKey": changeKey
						}
					}
				}
			}

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
