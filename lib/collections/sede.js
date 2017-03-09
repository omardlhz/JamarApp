/**
 * nombre de archivo: sede.js
 * descripcion: Colección para almacenar información de una sede.
 * creado por: Omar De La Hoz
 * 
 */


Sede = new Mongo.Collection('sede');

Sede.attachSchema( new SimpleSchema({

	name: {
		label: 'Nombre de la sede',
		type: String
	},
	country: {
		label: 'País de la sede',
		type: String
	},
	city: {
		label: 'Ciudad de la sede',
		type: String
	}
}));