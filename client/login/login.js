/**
 * nombre de archivo: login.js
 * creador: Omar De La Hoz (omar.dlhz@hotmail.com)
 * 
 * descripción: Login del lado del cliente.
 * creado en: 03/01/17
 */


/**
 * Codigo secreto autogenerado para encriptar y decriptar
 * la contraseña del usuario. (Encriptación y decriptación
 * son hechos del lado del servidor, codigo secreto vive en
 * el lado del cliente.)
 *
 * @return     retVal  Código secreto autogenerado.
 */
function encryptCode(){

	var length = 10,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";

    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    return retVal;
}


/**
 * Funciones accionadas después de accion de usuario
 * en el formulario de login.
 */
Template.loginForm.events({

	// Accionado  luego de que se envía el formulario de login.
	'submit .form-signin': function(event, template){

		var username = template.find('#username').value;
		var password = template.find('#password').value

		localStorage.setItem("encKey", encryptCode());

		event.preventDefault();

		return Accounts.callLoginMethod({
			methodArguments: [{username: template.find('#username').value,
							  pass: template.find('#password').value,
							  encKey: localStorage.getItem("encKey")}],
			userCallback: function (err, user) {

				if (err) {

					$(template.find('.form-signin')).shake(2,5,200);
					$(template.find('.incorrect_cred')).fadeIn("slow");
				}
				else{

					template.find('#username').value = "";
          			template.find('#password').value = "";

          			// Cerrar las demás sesiones del mismo usuario para
          			// evitar conflictos con la contraseña encriptada.
          			Meteor.logoutOtherClients();
				}
			}
		});
	}
});

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

		localStorage.removeItem("encKey");
		return Meteor.logout();
	}
});


Template.roomSearch.events({
	'click #logoutButton': function(){

		localStorage.removeItem("encKey");
		return Meteor.logout();
	}
});

