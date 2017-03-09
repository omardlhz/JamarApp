/**
 * nombre de archivo: sidenav.js
 * descripción: Controladores para abrir y cerrar el menú lateral.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 * 
 */


/**
 * Controlador para abrir el menú lateral.
 */
Template.roomCalendar.events({
	'click #menuButton': function(){
		
		document.getElementById("sideMenu").style.width = "500px";
	}
});

Template.sidenav.helpers({
	'isRoom': function() {

  		var isRoom = Rooms.findOne({username: Meteor.user().username});

  		return (isRoom) ? true : false;
	}
});


/**
 * Controlador para cerrar el menú lateral.
 */
Template.sidenav.events({
	'click #closeButton': function(){

		document.getElementById("sideMenu").style.width = "0px";
	}
})