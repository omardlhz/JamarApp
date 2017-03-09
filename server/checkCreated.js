/**
 * nombre de archivo: checkCreated.js
 * descripción: Revisa si algún evento fue creado.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */

//ALERTA: Solo utilizar cuando no hay protocolo SSL.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var EWS = require("node-ews");
SSR.compileTemplate('newEvent', Assets.getText('newEvent.html'));

Meteor.methods({
	'createSub': function(userId, encKey) {
		
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

			var ewsFunction = 'Subscribe';

			var ewsArgs = {

			  	"PullSubscriptionRequest" : {

			  		"FolderIds": {

				  		"DistinguishedFolderId": {

				  			"attributes": {
				  				"Id": "calendar"
				  			}
				    	}
			  		},
				  	"EventTypes": {

				  		$xml : "<t:EventType>CreatedEvent</t:EventType><t:EventType>DeletedEvent</t:EventType>"
				  	},
				  	"Timeout": "1440"
				}
			};

			ews.run(ewsFunction, ewsArgs, ewsSoapHeader).then(result => {

			    var subId = result.ResponseMessages.SubscribeResponseMessage.SubscriptionId;
			    var watermark = result.ResponseMessages.SubscribeResponseMessage.Watermark;

			    var subData = {subId: subId, watermark: watermark};

			    done(null, subData);
			}).catch(err => {

			    done(err.stack);
			});
		});

		if(!exec.err){

			return exec.result;
		}
		else{

			throw new Meteor.error('505', 'Servicio No Disponible');
		}
	},
	'watchSub': function(userId, encKey, subData) {

		var user = Meteor.users.findOne(userId);
		var room = Rooms.findOne({username: user.username});

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

			var ewsFunction = 'GetEvents';

			var ewsArgs = {

				"SubscriptionId": subData.subId,
				"Watermark": subData.watermark
			};

			// Buscar eventos.
			ews.run(ewsFunction, ewsArgs, ewsSoapHeader).then(result => {

				var newMark;

				var createdEvents = {};
				var deletedEvents = {};

				if(result){

					var notification = result.ResponseMessages.GetEventsResponseMessage.Notification;

					if(notification.StatusEvent){

						newMark = notification.StatusEvent.Watermark;
					}

					if(notification.CreatedEvent){

						var events = [];

						if(notification.CreatedEvent.constructor === Array){

							events = notification.CreatedEvent;
						}
						else{

							events.push(notification.CreatedEvent);
						}

						for(var i = 0; i < events.length; i++){

							var timestamp = events[i].TimeStamp;
							var id = events[i].ItemId.attributes.Id;
							var changeKey = events[i].ItemId.attributes.ChangeKey;

							newMark = events[i].Watermark;

							var event = {
								id: id,
								timestamp: timestamp,
								changeKey: changeKey
							}

							createdEvents[id] = event;
						}
					}
			
					if(notification.DeletedEvent){

						var events = [];

						if(notification.DeletedEvent.constructor === Array){

							events = notification.DeletedEvent;
						}
						else{

							events.push(notification.DeletedEvent);
						}

						for(var i = 0; i < events.length; i++){

							var timestamp = events[i].TimeStamp;
							var id = events[i].ItemId.attributes.Id;
							var changeKey = events[i].ItemId.attributes.ChangeKey;

							newMark = events[i].Watermark;

							var event = {
								id: id,
								timestamp: timestamp,
								changeKey: changeKey
							}

							deletedEvents[id] = event;
						}
					}

					if(notification.CreatedEvent && notification.DeletedEvent){

						for( eventId in deletedEvents){

							if(eventId in createdEvents){

								delete createdEvents[eventId];
								delete deletedEvents[eventId];
							}
						}
					}

					subData["events"] = createdEvents;
					subData.watermark = newMark;
					
					done(null, subData);
				}	
			}).catch(err => {

			    done(err.stack);
			});
		});

		if(!exec.err){

			if(Object.keys(exec.result.events).length != 0){
				
				if(room){

					for (var key in exec.result.events) {

					    if (!exec.result.events.hasOwnProperty(key)) continue;

					    var event = exec.result.events[key];

					    sendEmail(room.admin, userId, encKey, event);
					}
				}
			}

			delete exec.result["events"];

			return exec.result;
		}
		else{

			throw new Meteor.error('505', 'Servicio No Disponible');
		}
	}
});


/**
 * Envía correo electrónico a el administrador
 * de la sala cuando se ha creado un nuevo evento.
 */
function sendEmail(adminUser, userId, encKey, event){

	var user = Meteor.users.findOne(userId);

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

	var ewsFunction = 'GetItem';

	var ewsArgs = {

		"ItemShape": {
			"BaseShape": "Default",
		},
		"ItemIds":{
			"ItemId":{

				"attributes":{

					"Id": event.id,
					"ChangeKey": event.changeKey
				}
			}
		}
	};

	var exec = Async.runSync(function (done){

		ews.run(ewsFunction, ewsArgs, ewsSoapHeader).then(result => {

			var item = result.ResponseMessages.GetItemResponseMessage.Items.CalendarItem;
			var subject = item.Subject;
			var start = new Date(item.Start);
			var end = new Date(item.End);

			var date = start.getDate() + "/" + start.getMonth() + 1 + "/" + start.getFullYear();
			var time = start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
			 + " a " + end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

			var eventData = {
				logoImg: Meteor.absoluteUrl() + 'logo-jamar.png',
				subject: subject,
				roomName: user.fullName,
				date: date,
				time: time
			}

			done(null, eventData);
		});
	});

	if(!exec.err){

		Email.send({
			to: adminUser + "@mueblesjamar.com.co",
			from: "alertajamar@gmail.com",
			subject: "Nuevo Evento",
			html: SSR.render('newEvent', exec.result)
		});
	}
}