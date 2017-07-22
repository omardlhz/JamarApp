Meteor.publish('events', function () {
  return Events.find();
});


Meteor.publish('sedes', function () {
  return Sede.find();
});


Meteor.publish('currentUser', function(){

	if(this.userId){

		return Meteor.users.find(
			{_id: this.userId},
			{fields: {username: 1, fullName: 1, isAdmin: 1}}
		);
	}
	else{

		this.ready();
	}
});


Meteor.publish('users', function(){

	return Meteor.users.find({},{fields: {username: 1, fullName: 1}});
});


Meteor.publish('adminUsers', function(){
	
	return Meteor.users.find({}, {fields: {username: 1, fullName: 1, isAdmin: 1}});
});


Meteor.publish('rooms', function(){
	
	return Rooms.find();
});
