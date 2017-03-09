/**
 * nombre de archivo: editUsers.js
 * descripción: Encargado de editar los roles de usuario,
 * 				sala y sede.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */

Meteor.methods({
	'editUsers': function(username, userType, actionType) {

		var loggedInUser = Meteor.user();

		if(!loggedInUser.isAdmin){
			throw new Meteor.Error(403, "Acceso Denegado.");
		}

		if(actionType === "add"){

			if(userType == "admin" && username){

				Meteor.users.update({username: username}, {$set: {isAdmin: true}});
			}
			else{

				throw new Meteor.Error(403, "Escribe un usuario.");
			}
		}
		else if(actionType == "remove"){

			if(userType == "admin"){

				Meteor.users.update({username: username}, {$set: {isAdmin: false}});
			}
			else if(userType == "room"){

				Rooms.remove({username: username});
			}
			else if(userType == "sede"){

				Sede.remove({_id: username});
			}
		}
	}
});