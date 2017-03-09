/**
 * nombre de archivo: events.js
 * descripción: Colección para almacenar información de un evento.
 * creado por: Omar De La Hoz
 */

Events = new Mongo.Collection('events');

Events.attachSchema( new SimpleSchema({

	_id: {
		label: 'ID del evento',
		type: String
	},
	username: {
		label: 'Usuario del Evento',
		type: String
	},
	subject: {
		label: 'Asunto del Evento',
		type: String
	},
	startTime: {
		label: 'Hora de inicio del Evento',
		type: String
	},
	endTime: {
		label: 'Hora de finalización del Evento',
		type: String
	}
}));