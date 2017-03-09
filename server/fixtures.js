import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  
  //Usuario y clave de SMTP para correos de alerta.
  process.env.MAIL_URL = "smtp://alertajamar@gmail.com:jamar2017@smtp.gmail.com:587";

  // Crear usuario admin si no hay ningun usuario.
  if(Meteor.users.find().count() === 0){

  	var adminUser = Meteor.users.insert({

  		username: "hguzman",
  		fullName: "Henner David Guzmán",
  		isAdmin: true
  	});
  }
});
