/**
 * nombre de archvio: adminPanel.js
 * descripción: Controlador del Panel de Administrador.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */

Template.adminPanel.events({
	'click #menuButton': function(){
		
		document.getElementById("sideMenu").style.width = "500px";
	},
	'click #addRoom': function(){

		$("#rooms-modal").css("display", "block");
	},
	'click #addSede': function(){

		$("#sede-modal").css("display", "block");
	},
	'submit form': function(e){

		e.preventDefault();

		var field = $(event.target).find('[name=uName]');
		var username = $(event.target).find('[name=uName]').val();
		var userType = $(event.target).find('[name=type]').val();
		var actionType = $(event.target).find('[name=action]').val();
		var roomName = $(event.target).find('[name=user]').val();

		Meteor.call('editUsers', username, userType, actionType, function (error) {

			if(actionType === "add" && userType === "admin"){

				field.val("");
			}

			if(!error){

				if(actionType === "add" && userType === "admin"){

					swal("¡Excelente!", "El usuario " + username + " es administrador", "success");
				}
				else if(actionType === "remove" && userType === "admin"){

					swal("¡Excelente!", "El usuario " + username + " no es administrador", "success");
				}
				else if(actionType === "remove" && userType === "sede"){

					swal("¡Excelente!", "La sede " + roomName + " ha sido eliminada", "success");
				}
				else if(actionType === "remove" && userType === "room"){

					swal("¡Excelente!", "La sala " + username + " ha sido eliminada", "success");
				}
			}
			else{

				if(!username){

					swal("¡Oops!", "Por favor, escribe un usuario.", "error");
				}
				else{

					swal("¡Oops!", "Acceso Denegado.", "error");
				}
			}
		});
	},
	'submit #sedeForm': function(e){

		e.preventDefault();

		var name = $(event.target).find('[name=name]').val();
		var country = $(event.target).find('[name=country]').val();
		var city = $(event.target).find('[name=city]').val();

		Sede.insert({name: name, country: country, city: city}, function(error, _id){

			if(!error){

				$("#sede-modal").css("display", "none");
				swal("¡Excelente!", "La sede " + name + " ha sido agregada.", "success");
			}
			else{

				swal("¡Oops!", "No se pudo agregar la sede.", "error");
			}
		});
	},
	'submit #roomForm': function(e){

		e.preventDefault();

		var name = $(event.target).find('[name=user]').val();
		var admin = $(event.target).find('[name=admin]').val();
		var capacity = $(event.target).find('[name=capacity]').val();
		var sede = $(event.target).find('[name=sede]').val();
		var hasVideo = $(event.target).find('[name=hasVideo]').prop('checked');

		// Si la sala ya se registró, saldrá su nombre en el panel del administrador.
		var user = Meteor.users.findOne({username: name});
		var roomname;

		if(user){

			roomname = user.fullName;
		}
		else{

			roomname = "";
		}

		Rooms.insert({username: name, admin: admin, roomname: roomname, capacity: capacity, sede: sede, hasVideo: hasVideo}, function(error, _id){

			if(!error){

				$("#rooms-modal").css("display", "none");
				swal("¡Excelente!", "La sala " + name + " ha sido agregada.", "success");
			}
			else{

				swal("¡Oops!", "No se pudo agregar la sala.", "error");
			}
		});


	},
	'change [name="salaMasa"]': function(event, template){

		Papa.parse( event.target.files[0], {
			header: true,
			complete(results, file){

				if(results.errors.length > 0){
					return swal("¡Oops!", "Archivo inválido.", "error");
				}

				Meteor.call("subirMasa", results.data, function(error){

					if(error){

						swal("¡Oops!", error.reason, "error");
					}
					else{

						swal("¡Excelente!", "Todas las salas han sido agregadas.", "success");
					}
				});
			}
		});
	}
});


Template.adminPanel.onRendered(function(){

	document.getElementById("sideMenu").style.width = "0px";
});