/**
 * ALERTA: NO ESTÁ ACTUALMENTE EN USO.
 * 
 * nombre de archivo: listEvents.js
 * descripción: Busca las reuniones de una sala en específico.
 * 				surge a partir del error encontrado el 06/01/17
 * 				referente a los eventos no apareciendo.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 * creado en: 06/01/17
 */

//ALERTA: Solo utilizar cuando no hay protocolo SSL.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var EWS = require("node-ews");

Meteor.methods({
	'listEvents': function(userId, encKey, roomName, calRange){

		console.log(calRange);

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

			var ewsFunction = 'FindItem';

			var ewsArgs = {
				"attributes": {
					"Traversal" : "Shallow"
				},
				"ItemShape": {
					"BaseShape": "AllProperties"
				},
				"CalendarView": {
					"attributes":{
						"StartDate": calRange.start.toISOString(),
						"EndDate": calRange.end.toISOString()
					}
				},
				"ParentFolderIds":{
					"DistinguishedFolderId":{
						"attributes":{
							"Id": "calendar"
						},
						"Mailbox":{
							"EmailAddress": roomName + "@mueblesjamar.com.co"
						}
					}
				}
			}

			// Hacer petición a servidor EWS.
			ews.run(ewsFunction, ewsArgs, ewsSoapHeader).then(result => {

			    done(null, result);
			}).catch(err => {

				done(err.stack);
			});
		});

		if(!exec.error){

			console.log(exec.result.ResponseMessages.FindItemResponseMessage.RootFolder.Items);


			return true;
		}
		else{

			console.log(exec.err);

			return false;
		}
	}
});
