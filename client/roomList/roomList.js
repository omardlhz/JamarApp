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

		$("#calendarModal").css("display", "block");
		$("#roomName").text(String(roomName));

		$('#popupCalendar').fullCalendar({
			header: {

				left:   'title',
				center: '',
				right: 'prev, today, next'
			},
			titleFormat: 'D/MM/YYYY',
			defaultView: 'basicWeek',
			timezone: 'local',
			cache: false,
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

				// Actualiza la vista de evento.
				$("#calendarModal").css("display", "none");
				$("#eventModal").css("display", "block");
				$("#eventTitle").text(calEvent.title);
				$("#eventDate").text(eventDate);
				$("#eventTime").text(startTime + "-" + endTime);
			}
		});
		
		var userId = Meteor.user()._id;

		Meteor.call('monitorEvents', userId, localStorage.getItem("encKey"), roomName,function(error, result) {

			if(result){

				loadCalendar(roomName);
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
			changeKey: event.changeKey
		}

		$('#popupCalendar').fullCalendar('renderEvent', eventx, true);
    	
	});

	Session.set("loading", undefined);
}