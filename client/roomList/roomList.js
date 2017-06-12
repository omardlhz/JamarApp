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

				$("#calendarModal").css("display", "none");
				$("#eventModal").css("display", "block");

				// Actualiza la vista de evento.
				$("#eventTitle").text(calEvent.title);
				$("#eventDate").text(eventDate);
				$("#eventTime").text(startTime + "-" + endTime);
				$("#cancelEvent").attr("_id", calEvent.id);
				$("#cancelEvent").attr("changeKey", calEvent.changeKey);
			}
		});

		var userId = Meteor.user()._id;

		Meteor.call('monitorEvents', userId, localStorage.getItem("encKey"), roomName,function(error, result) {

			if(result){

				loadCalendar(roomName);
			}
		});
	},
	'click #calendarBack': function(){

		$("#calendarModal").css("display", "block");
		$("#eventModal").css("display", "none");
	},
	'click #cancelEvent': function(e){

		var eventId = $(e.currentTarget).attr("_id");
		var changeKey = $(e.currentTarget).attr("changeKey");

		console.log(eventId)
		console.log(changeKey)

		var userId = Meteor.user()._id;

		Meteor.call('removeEvent', userId, localStorage.getItem("encKey"), eventId, changeKey,function(error, result) {

			if(result){

				alert("eliminado");
			}
		});






	}
});


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

		console.log(eventx);

		$('#popupCalendar').fullCalendar('renderEvent', eventx, true);
    	
	});

	Session.set("loading", undefined);
}