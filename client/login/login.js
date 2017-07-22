/**
 * nombre de archivo: login.js
 * creador: Omar De La Hoz (omar.dlhz@hotmail.com)
 * 
 * descripción: Login del lado del cliente.
 * creado en: 03/01/17
 */


Template.loginForm.onRendered(function(){

	$('#loadOverlay').hide();

	$().smartWebBanner({
    	title: "Jamar SDS",
    	author: "Muebles Jamar",
    	url: '/',
    	titleSwap: true,
    	showFree: false,
    	useIcon: true,
    	theme: "iOS 7",
  	});

  	Meteor.call('getAuthUrl', function(error, result){

  		if(result){
  			$("#authUrl").attr("href", result);
  		}
  	});
});


Accounts.onLogin(function(){
	
	var isRoom = Rooms.findOne({username: Meteor.user().username});

	if(isRoom){

		Router.go("/modoPresentacion");
	}
});


Accounts.onLogout(function(){

	Router.go("/");
});


/**
 * Función accionada después presionar el botón
 * de cerrar sesión.
 */
Template.sidenav.events({
	'click #logoutButton': function(){

		return Meteor.logout();
	}
});


Template.roomSearch.events({
	'click #logoutButton': function(){

		return Meteor.logout();
	}
});

