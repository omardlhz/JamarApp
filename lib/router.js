/**
 * nombre de archivo: router.js
 * descripción: Enrutador de URLs
 * creado por: Omar De La Hoz
 * 
 */


Router.configure({
	layoutTemplate: '',
	notFoundTemplate: '',
	loadingTemplate: 'loadScreen',
});


Router.route('/', {
	waitOn: function(){

		return [Meteor.subscribe("currentUser"), Meteor.subscribe("rooms"), Meteor.subscribe("sedes")];
	},
	data: function(){

		return {sedes: Sede.find().fetch()}
	},
	action: function(){

		if(Meteor.user()){

			this.render('roomSearch');
		}
		else{

			this.render('loginForm');
		}
	}
});


Router.route('/modoPresentacion', {
	waitOn: function(){

		return [Meteor.subscribe("currentUser"), Meteor.subscribe("rooms"), Meteor.subscribe("sedes")];
	},
	action: function(){

		this.render('roomCalendar');
	}
});


Router.route('/roomList', {
	waitOn: function(){

		return [Meteor.subscribe("currentUser"), Meteor.subscribe("rooms"), Meteor.subscribe("events")];
	},
	data: function(){

		return {rooms: Rooms.find().fetch()};
	},
	action: function(){

		this.render('roomList');
	}
});

Router.route('/modoAdmin', {
	waitOn: function(){

		return [Meteor.subscribe("currentUser"), Meteor.subscribe("adminUsers"), Meteor.subscribe("rooms"), Meteor.subscribe("sedes")];
	},
	data: function(){

		return {admins: Meteor.users.find({isAdmin: true}).fetch(), rooms: Rooms.find().fetch(), sedes: Sede.find().fetch()}
	},
	action: function(){

		if(Meteor.user().isAdmin){

			this.render('adminPanel');
		}
		else{
			
			Router.go('/');
		}
	}
});
