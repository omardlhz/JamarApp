/**
 * nombre de archvio: roomSearch.js
 * descripción: Busqueda de sala más apropiada para reunión.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */


// Zona horaria GMT-5 para Colombia y Panamá.
var timeZone = "-05:00";


/**
 * Eventos accionados al hacer ciertas acciones en la vista roomSearch.html
 * 
 * - click #menuButton: accionado al undir el menú hamburguesa.
 * 
 * - submit #searchForm: accionado al enviar el formulario de
 * 	 					 busqueda de sala.
 */
Template.roomSearch.events({
	'click #menuButton': function(){
		
		document.getElementById("sideMenu").style.width = "500px";
	},
	'submit #searchForm': function(e){

		e.preventDefault();

		Session.set("loading", true);

		// Nombre de reunión.
		var subject = $(event.target).find('[name=subject]').val();


		// Recibir lista de invitados y el número de personas invitadas.
		var attendees = $('#attendees').tagEditor('getTags')[0].tags;
		var numpeople = $(event.target).find('[name=numpeople]').val();
		

		// Recibir hora de inicio y de final y darle el formato requerido
		// por el API de EWS.
		var date = $(event.target).find('[name=date]').val();
		var startTime = $(event.target).find('[name=startTime]').val();
		var endTime = $(event.target).find('[name=endTime]').val();
		var formatStart = dateBuilder(date, startTime, timeZone);
		var formatEnd = dateBuilder(date, endTime, timeZone);
		

		// Recibir valores de sede y video conferencia.
		var sede = $(event.target).find('[name=sede]').val();
		var hasVideo = $(event.target).find('[name=hasVideo]').prop('checked');


		// Se hace una busqueda a las salas registradas en la aplicación.
		// Para que una sala sea una sala posible, esta debe cumplir con:
		// 
		// - Capacidad igual o superior a la especificada por el usuario.
		// - Debe estar en la sede especificada por el usuario.
		// - Debe tener o no Video Conferencia (definido por usuario).
		var query = {"$and": [{"capacity": {"$gte": Number(numpeople)}}, {"sede": sede}, {"hasVideo": hasVideo}] }
		var possibleRooms = Rooms.find(query, {sort: {capacity: 1}, fields: {username: 1}}).fetch();

		var encKey = localStorage.getItem("encKey");

		var appointmentData = {

			Subject: subject,
			Start: formatStart,
			End: formatEnd,
			Attendees: (attendees) ? attendees : undefined
		}


		// Si no existen posibles salas, botar error.
		if(possibleRooms.length == 0){

			swal("Lo sentimos", "No hay salas que cumplan con tus especificaciones.", "error");

			Session.set("loading", undefined);
		}
		else{

			Meteor.call('roomAvailability', Meteor.user().username, possibleRooms, formatStart, formatEnd, function(error, result) {

				Session.set("loading", undefined);

				if(result){

					// Agregar la sala a los datos del evento.
					appointmentData.Location = result + "@mueblesjamar.com.co";

					swal({
						title: "Sala Encontrada",
						text: "La sala <strong>" + result + "</strong> cumple con tus especificaciones, deseas crear la reunión?",
						type: "info",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Crear Reunión",
						closeOnConfirm: false,
						html: true
					}, function() {

						createAppointment(appointmentData);
					});
				}
				else{

					swal("Lo sentimos", "No hay salas que cumplan con tus especificaciones.", "error");
				}
			});
		}
	}
});


/**
 * Accionado al cargar la vista.
 * 
 * Encargado de esconder el menú hamburguesa
 * y de habilitar el seleccionador de invitados.
 */
Template.roomSearch.onRendered(function(){

	document.getElementById("sideMenu").style.width = "0px";
	$('#attendees').tagEditor({
		placeholder: "Invitados (Separar con coma)"
	});

	// Si es una sala, mostrar su propia Sede en Búsqueda de Sala.
	var isRoom = Rooms.findOne({username: Meteor.user().username});
	if(isRoom){

		$('[name=sede]').val(isRoom.sede);
	}

	$('#searchForm').validate({

		rules:{

			subject: {
				required: true
			},
			numpeople: {
				required: true,
				digits: true
			},
			date: {
				required: true,
				date: true
			},
			startTime: {
				required: true
			},
			endTime: {
				required: true,
				validDate: startTime
			},
			sede: {
				required: true
			}
		},
		messages:{
			subject:{
				required: "Por favor insertar un Nombre para la reunión."
			},
			numpeople:{
				required: "Por favor insertar Número de Personas"
			},
			date:{
				required: "Por favor insertar fecha de reunión"
			},
			startTime:{
				required: "Por favor insertar hora de inicio"
			},
			endTime:{
				required: "Por favor insertar hora de final",
				validDate: "La hora de Finalización debe ser superior a la de Incio."
			},
			sede:{
				required: "Por favor seleccionar una Sede."
			}
		},
		onkeyup: false,
		onclick: false,
		errorPlacement: function (error, element) {

        	swal("Error", error.text(),"error");
    	}
	});
});


/**
 * Helpers para JS handlebars.
 * 
 * Encargado de mostrar la pantalla de carga.
 */
Template.roomSearch.helpers({

	'loading': function() {
		
		return Session.get("loading");
	}
});


/**
 * Construye fecha en formato string que sigue
 * los requerimientos del EWS API.
 *
 * @param      {string}  date      Fecha de la Reunión
 * @param      {string}  time      Hora Inicio/Final
 * @param      {string}  timezone  Zona horaria
 * @return     {string}  Fecha en String formato EWS
 */
function dateBuilder(date, time, timezone){

	return date + "T" + time + ":00.000" + timezone;
}


/**
 * Crea evento en el servidor EWS.
 *
 * @param      {Object}  appointmentData  Datos del evento.
 */
function createAppointment(appointmentData){

	Session.set("loading", true);

	var username = Meteor.user().username;

	Meteor.call('createAppointment', username, appointmentData, function(error, result){

		Session.set("loading", undefined);

		if(result){

			swal({
				title: "¡Excelente!",
				text: "Su reunión ha sido creada.",
				type: "success",
				showCancelButton: false
			}, function() {

				var addModal = document.getElementById('addModal');

				if(addModal){

					addModal.style.display = "none";
				}
			});
		}
		else{

			swal("Lo sentimos", "Tu evento no pudo ser creado.", "error");
		}
	});
}