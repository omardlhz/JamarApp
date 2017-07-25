/**
 * nombre de archivo: roomCalendar.js
 * descripción: funciones de la plantilla RoomCalendar.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */

import fullcalendar from 'fullcalendar';
listeners = {};


var eventIds = {};


/**
 * Suscripción a los datos del usuario actual,
 * utilizado para visualizar el nombre completo
 * (fullName) y el usuario (username) del usuario
 * actual.
 */
Template.roomCalendar.onCreated(function(){

	Meteor.subscribe("currentUser");
	Meteor.subscribe("events");
	Meteor.subscribe("sedes");
});

Template.roomCalendar.helpers({
	'isRoom': function() {

  		var isRoom = Rooms.findOne({username: Meteor.user().username});

  		return (isRoom) ? true : false;
	},
	'sedes': function(){
		
		return Sede.find().fetch();
	}
});


Template.roomCalendar.events({
	'click #calendarButton': function(){

		$("#myModal").css("display", "block");

		// Crear el calendario en la vista.
		$('#popupCalendar').fullCalendar({
			header: {

				left:   'title',
				center: '',
				right: 'prev, today, next'
			},
				titleFormat: 'D/MM/YYYY',
				defaultView: 'basicWeek',
				timezone: 'America/Bogota'
		});

		$('#popupCalendar').fullCalendar('removeEvents', event, true);

		var events = Events.find({username: String(Meteor.user().username)}).fetch();

		for(var i = 0; i < events.length; i++){

			var event =  {

				id: events[i]._id,
				title: events[i].subject,
				start: events[i].startTime,
				end: events[i].endTime
			}

			$('#popupCalendar').fullCalendar('renderEvent', event, true);
		}
	},
	'click #addButton': function(){

		$("#addModal").css("display", "block");

	}
});


/**
 * Creación del calendario cuando la plantilla Room Calendar
 * es renderizada.
 */
Template.roomCalendar.onRendered(function() {

	document.getElementById("sideMenu").style.width = "0px";
	
	// Crear el calendario en la vista.
	$('#calendarDiv').fullCalendar({
		header: {

			left: 'title',
			center: '',
			right: 'prev, today, next'
		},
			titleFormat: 'D/MM/YYYY',
			defaultView: 'listDay',
			timezone: 'America/Bogota'
	});


	// Observa cambios en los eventos en la base de datos.
	// Si un evento del usuario actual es agregado, actualizado
	// o eliminado, esto se reflejará en la vista del usuario.
	Events.find().observe({
		added: function(document){

			// Revisar si el nuevo evento es del usuario actual.
			if(document.username === String(Meteor.user().username)){

				// Crear los listeners del evento.
				createListener(document);

				// Crear el evento.
				var event =  {

					id: document._id,
					title: document.subject,
					start: new Date(document.startTime),
					end: new Date(document.endTime)
				}

				// Agregar el evento al calendario.
				$('#calendarDiv').fullCalendar('renderEvent', event, true);
				$('#popupCalendar').fullCalendar('renderEvent', event, true);
			}
		},
		changed: function(newDocument, oldDocument){

			// Revisar si el evento actualizado es del usuario actual.
			if(newDocument.username === String(Meteor.user().username)){

				// Crear el nuevo evento.
				var event =  {

					id: newDocument._id,
					title: newDocument.subject,
					start: newDocument.startTime,
					end: newDocument.endTime
				}

				// Eliminar los viejos listeners y crear nuevos.
				removeListener(oldDocument);
				createListener(newDocument);

				// Eliminar el viejo evento del calendario y agregar el nuevo.
				$('#calendarDiv').fullCalendar('removeEvents', oldDocument._id);
				$('#calendarDiv').fullCalendar('renderEvent', event, true);

				$('#popupCalendar').fullCalendar('removeEvents', oldDocument._id);
				$('#popupCalendar').fullCalendar('renderEvent', event, true);
			}
		},
		removed: function(oldDocument) {

			// Revisar si el evento eliminado es del usuario actual.
			if(oldDocument.username === String(Meteor.user().username)){

				// Eliminar los listeners.
				removeListener(oldDocument);

				// Eliminar el evento del calendario.
				$('#calendarDiv').fullCalendar('removeEvents', oldDocument._id);
				$('#popupCalendar').fullCalendar('removeEvents', oldDocument._id);
			}
		}
	});

	// Llamado a monitor de eventos.
	callMonitor();

	// Llamado a creador de subsripción.
	//createSubscription();
});


/**
 * Llamado repetitivo a eventMonitor para monitorear los
 * eventos en el calendario del usuario.
 */
function callMonitor(){

	var username = Meteor.user().username;

	Meteor.call('monitorEvents', username, undefined, function(error, result) {

		if(result){
			
			setTimeout(function(){callMonitor()}, (0.5 * 60000));
		}
		else{

			console.log(error);
		}
	})
}

/**
 * Crea subscripción a notificaciones de EWS.
 * Si esta vence (A las 24 horas) una nueva
 * subscripción es creada.
 */
function createSubscription(){

	var userId = Meteor.user()._id;

	Meteor.call('createSub', userId, localStorage.getItem("encKey"), function(error, result){

		if(result){

			checkCreated(result);

			// Volver a crear subscripción después
			// de 1140 minutos (24 horas).
			setTimeout(function(){

				createSubscription();
			}, 1440 * 60000)
		}
	});
}


/**
 * Revisa si un evento ha sido creado cada 20 segundos.
 *
 * @param      {<type>}  subData  The sub data
 */
function checkCreated(subData){

	var userId = Meteor.user()._id;

	Meteor.call('watchSub', userId, localStorage.getItem("encKey"), subData, function(error, result){

		if(result){

			setTimeout(function() {

				checkCreated(result);
			}, 20000)
		}
	});
}


/**
 * Crea los listeners para el inicio y el final
 * del evento, esta función se encarga de cambiar
 * el color y la información de la vista.
 *
 * @param      {Events}   document  Evento para crear listeners.
 */
function createListener(document){

	var currentTime = new Date().getTime();

	var startTime = new Date(document.startTime);
	var endTime = new Date(document.endTime);

	var stringStart = startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
	var stringEnd = endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

	$(document).ready(function(){

		if(currentTime < startTime && currentTime < endTime){

			var startListener = setTimeout(
				function(){

					$("#availability").css({
						'background': 'linear-gradient(rgba(246, 19, 19, 0.45), rgba(246, 19, 19, 0.45)),\
						url(/background.jpg) no-repeat center center fixed'
					});

					$("#meetName").text("Reunión: " + document.subject);
					$("#time").text(stringStart + " - " + stringEnd);

					$("#badge").css({'background-color': 'rgba(211, 197, 9, 0.69)'});
					$("#status").text("Sala Ocupada");
					$("#status").css({'color': '#000'});
				},
				startTime - currentTime
			);

			var endListener = setTimeout(
				function(){

					$("#availability").css({
						'background': 'linear-gradient(rgba(35, 186, 18, 0.45), rgba(35, 186, 18, 0.45)),\
						url(/background.jpg) no-repeat center center fixed'
					});

					$("#meetName").text("");
					$("#time").text("");

					$("#badge").css({'background-color': 'rgba(12, 65, 6, 0.82)'});
					$("#status").text("Sala Disponible");
					$("#status").css({'color': 'white'});
				},
				endTime - currentTime
			);

			var eventListeners = {};
			eventListeners["startTime"] = startTime;
			eventListeners["startListener"] = startListener;

			eventListeners["endTime"] = endTime;
			eventListeners["endListener"] = endListener;

			listeners[document._id] = eventListeners;

		}
		else if(currentTime > startTime && currentTime < endTime){

			$("#availability").css({
				'background': 'linear-gradient(rgba(246, 19, 19, 0.45), rgba(246, 19, 19, 0.45)),\
				url(/background.jpg) no-repeat center center fixed'
			});

			$("#meetName").text("Reunión: " + document.subject);
			$("#time").text(stringStart + " - " + stringEnd);

			$("#badge").css({'background-color': 'rgba(211, 197, 9, 0.69)'});
			$("#status").text("Sala Ocupada");
			$("#status").css({'color': '#000'});

			var endListener = setTimeout(
				function(){

					$("#availability").css({
						'background': 'linear-gradient(rgba(35, 186, 18, 0.45), rgba(35, 186, 18, 0.45)),\
						url(/background.jpg) no-repeat center center fixed'
					});

					$("#meetName").text("");
					$("#time").text("");

					$("#badge").css({'background-color': 'rgba(12, 65, 6, 0.82)'});
					$("#status").text("Sala Disponible");
					$("#status").css({'color': 'white'});
				},
				endTime - currentTime
			);

			var eventListeners = {};
			eventListeners["startTime"] = startTime;

			eventListeners["endTime"] = endTime;
			eventListeners["endListener"] = endListener;

			listeners[document._id] = eventListeners;
		}
	});
}


/**
 * Elimina los listeners para el inicio y/o final
 * de un evento. Se encarga de que si un evento es
 * eliminado o modificado, sus listeners pasados
 * no tengan efecto en el navegador.
 *
 * @param      {Events}  document  Evento para eliminar listeners.
 */
function removeListener(document){

	var docListeners = listeners[document._id];
	var currentTime = new Date().getTime();

	// Revisar si hay listeners en el cliente, ya que
	// no habrán si el evento está en el pasado.
	if(docListeners){

		if(docListeners["startTime"] > currentTime){

			clearTimeout(docListeners["startListener"]);
			clearTimeout(docListeners["endListener"]);
		}
		else if(docListeners["endTime"] > currentTime){

			$("#availability").css({
				'background': 'linear-gradient(rgba(35, 186, 18, 0.45), rgba(35, 186, 18, 0.45)),\
				url(/background.jpg) no-repeat center center fixed'
			});

			$("#meetName").text("");
			$("#time").text("");
			
			$("#badge").css({'background-color': 'rgba(12, 65, 6, 0.82)'});
			$("#status").text("Sala Disponible");
			$("#status").css({'color': 'white'});

			clearTimeout(docListeners["endListener"]);
		}

		delete listeners[document._id];
	}
}
