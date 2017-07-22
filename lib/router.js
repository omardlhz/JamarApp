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

		return (Meteor.user()) ? this.render('roomSearch') : this.render('loginForm');
	}
});


Router.route('/modoPresentacion', {
	waitOn: function(){

		return [Meteor.subscribe("currentUser"), Meteor.subscribe("rooms"), Meteor.subscribe("sedes")];
	},
	action: function(){

		return (Meteor.user()) ? this.render('roomCalendar') : Router.go('/');
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

		return (Meteor.user()) ? this.render('roomList') : Router.go('/');
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

		return (Meteor.user().isAdmin) ? this.render('adminPanel') : Router.go('/');
	}
});


Router.route('/authorize', {
	 waitOn: function(){

		return Meteor.subscribe("users");
	},
	action: function(){

		Accounts.callLoginMethod({
			methodArguments: [{auth_code: this.params.query.code}],
			userCallback: function (err, user) {

				return (err) ? Router.go('/', {error: err.reason}) : Router.go('/');
			}
		});
	}
});
