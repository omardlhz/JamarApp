
Rooms = new Mongo.Collection('rooms');

Rooms.attachSchema( new SimpleSchema({

	username: {
		label: 'Usuario de la sala',
		type: String
	},
	roomname: {
		label: 'Nombre de la sala',
		type: String,
		optional: true
	},
	capacity: {
		label: 'Capacidad de la sala',
		type: Number
	},
	admin: {
		label: 'Usuario del administrador de la sala',
		type: String
	},
	hasVideo: {
		label: 'Disponibilidad de Video Conferencia',
		type: Boolean
	},
	sede:{
		label: 'Sede de la Sala',
		type: String
	}
}));

/**
 * Agregar salas masivamente a través de archivo CSV.
 */
Meteor.methods({
	'subirMasa': function(salas) {

		var sedes = Sede.find().map(function(sede){ return sede.name});

		for(var i = 0; i < salas.length; i++){

			var sala = salas[i];
			var exists = Rooms.findOne({username: sala.Usuario});

			console.log(sala);

			if(!exists){

				if(sedes.indexOf(sala.Sede) == -1)
					throw new Meteor.Error(404, "La sede " + sala.Sede + " no existe.");

				Rooms.insert({
					username: sala.Usuario,
					admin: sala.Administrador,
					capacity: sala.Capacidad,
					sede: sala.Sede,
					hasVideo: (sala.Conferencia === "TRUE") 
				},
				function(error){

					throw new Meteor.Error(500, "La sala " + sala.Usuario + " no pudo ser agregada.");

				});
			}
		}
	}
});