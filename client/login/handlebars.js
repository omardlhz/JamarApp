/**
 * nombre de archivo: handlebars.js
 * descripción: Handlebars para facilitamiento de código.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */


Template.registerHelper( 'isRoom', () => {

  var user = Meteor.users.findOne(this.userId);
  var isRoom = Rooms.findOne({username: user.username});
  
  return false;
});