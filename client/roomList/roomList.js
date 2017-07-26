/**
 * nombre de archivo: roomList.js
 * descripción: funciones de la plantilla roomList
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */


Template.roomList.onRendered(function(){

	document.getElementById("sideMenu").style.width = "0px";
});

Template.roomList.helpers({
	'loading': function(){
		return Session.get("loading");
	}
});


Template.roomList.events({
	'click #menuButton': function(){
		
		document.getElementById("sideMenu").style.width = "500px";
	},
	'click .fc-prev-button': function(){
		console.log("prev click");
	},
	'click #roomItem': function(e){

		Session.set("loading", true);

		var roomName = $(e.currentTarget).find('[name=username]').text();
		var roomAdmin = $(e.currentTarget).find('[name=admin]').text();
		var roomId = $(e.currentTarget).find('[name=id]').text();
		var changeKey = $(e.currentTarget).find('[name=changeKey]').text();

		$("#calendarModal").css("display", "block");
		$("#roomName").text(String(roomName));

		$('#popupCalendar').fullCalendar({
			header: {

				left:   'title',
				center: '',
				right: 'prev, today, next'
			},
    		editable: false,
    		selectable: true,
			titleFormat: 'D/MM/YYYY',
			defaultView: 'basicWeek',
			timezone: 'local',
			eventClick: function(calEvent, jsEvent, view){				

				// Formato de fecha de evento
				var dateFormat = {
					day: 	"2-digit",
					month:  "long",
					year: 	"numeric"
				}

				// Formato de hora de evento.
				var timeFormat = {
					hour: 	"2-digit",
					minute: "2-digit"
				}

				// Se encarga de prepar los strings de fecha, hora de inicio y hora de final.
				var eventDate = new Date(calEvent.start).toLocaleString("es-ES",dateFormat);
				var startTime = new Date(calEvent.start).toLocaleString([], timeFormat);
				var endTime = new Date(calEvent.end).toLocaleString([], timeFormat);

				// Cambia la vista de calendario a vista de evento.
				$("#calendarModal").css("display", "none");
				$("#eventModal").css("display", "block");

				// Actualiza la vista de evento.
				$("#eventTitle").text(calEvent.title);
				$("#eventDate").text(eventDate);
				$("#eventTime").text(startTime + "-" + endTime);
				$("#cancelEvent").attr("_id", calEvent.id);
				$("#cancelEvent").attr("changeKey", calEvent.changeKey);
				$("#cancelEvent").attr("roomName", roomName)

				// Verificar si se debe mostrar el botón de cancelar evento.
				// (Solo debe ser mostrado a administrador)
				var display = (Meteor.user().username === roomAdmin) ? "inline-block" : "none";
				$("#cancelEvent").css("display", display);
			}
		});

		var username = Meteor.user().username;

		Meteor.call('monitorEvents', username, roomName,function(error, result) {

			if(result){

				loadCalendar(roomName);
			}
		});
	},
	'click #calendarBack': function(){

		// Cambia de vista de evento a vista de calendario.
		$("#calendarModal").css("display", "block");
		$("#eventModal").css("display", "none");
	},
	'click #cancelEvent': function(e){

		var eventId = $(e.currentTarget).attr("_id");
		var changeKey = $(e.currentTarget).attr("changeKey");
		var roomName = $(e.currentTarget).attr("roomName");
		var username = Meteor.user().username;

		Session.set("loading", true);
		Meteor.call('removeEvent', username, eventId, roomName, function(error, result) {

			Session.set("loading", undefined);

			if(result){

				swal({
					title: "¡Excelente!",
					text: "Su reunión ha sido cancelada",
					type: "success",
					showCancelButton: false
				}, function() {

					$('#popupCalendar').fullCalendar('removeEvents');
					$(".modal").css("display", "none");
				});
			}
			else{

				swal("Lo sentimos", "Tu evento no pudo ser cancelado.", "error");
			}
		});
	}
});


/**
 * Carga todos los eventos de esta sala
 * (que se encuentran en la base de datos)
 * al calendario.
 *
 * @param      {String}  roomName  Nombre de la sala.
 */
function loadCalendar(roomName){

	var events = Events.find({username: String(roomName)}).fetch();
	events.forEach(function(event){

		var eventx =  {

			id: event._id,
			title: event.subject,
			start: event.startTime,
			end: event.endTime,
			changeKey: event.changeKey,
			allDay: false
		}

		$('#popupCalendar').fullCalendar('renderEvent', eventx, true);
    	
	});

	Session.set("loading", undefined);
}