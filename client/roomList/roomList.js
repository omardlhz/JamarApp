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
	'click #roomItem': function(e){

		Session.set("loading", true);

		$("#myModal").css("display", "block");

		$('#popupCalendar').fullCalendar('removeEvents');

		$('#popupCalendar').fullCalendar({
			header: {

				left:   'title',
				center: '',
				right: 'prev, today, next'
			},
				titleFormat: 'D/MM/YYYY',
				defaultView: 'basicWeek',
				timezone: 'local'
		});

		
		var roomName = $(e.target).find('[name=username]').text();

		var userId = Meteor.user()._id;

		Meteor.call('monitorEvents', userId, localStorage.getItem("encKey"), roomName,function(error, result) {

			if(result){

				Session.set("loading", undefined);

				var events = Events.find({username: roomName}).fetch();

				for(var i = 0; i < events.length; i++){

					var event =  {

						id: events[i]._id,
						title: events[i].subject,
						start: events[i].startTime,
						end: events[i].endTime
					}

					$('#popupCalendar').fullCalendar('renderEvent', event, true);
				}
			}
		});
	}
});