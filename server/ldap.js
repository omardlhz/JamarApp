process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var ews = Npm.require("ews-javascript-api");
var ntlmXHR = require("./ntlmXHRApi");
var ExchangeService = ews.ExchangeService;
var ExchangeVersion = ews.ExchangeVersion;
var ExchangeCredentials = ews.ExchangeCredentials;
var ResolveNameSearchLocation = ews.ResolveNameSearchLocation;
var Uri = ews.Uri;
var LDAP = {};

ews.EwsLogging.DebugLogEnabled = true


LDAP.quickAuth = function(options) {

	var username = options.username.trim().toLowerCase().split('@')[0];
	var contactName;

	var exec = Async.runSync(function (done){

		// Chequear si los campos están vacíos.
	    if(options.username.length === 0 || options.pass.length === 0){

	      err = true;
	      done(err);
	    }
	    else{

	    	var ntlmXHRApi = new ntlmXHR.ntlmXHRApi(username,options.pass);
	    	var exch = new ExchangeService(ExchangeVersion.Exchange2016);
	    	exch.XHRApi = ntlmXHRApi;
	    	exch.Credentials = new ews.ExchangeCredentials("null", "null"); // Evitar error de credenciales.
	    	exch.Url = new ews.Uri("https://mail.mueblesjamar.com.co/EWS/Exchange.asmx");

	    	exch.ResolveName(username + "@mueblesjamar.com.co", ResolveNameSearchLocation.DirectoryOnly, true).then((response) => {

	    		var contactInfo = response.Items[0];
	    		contactName = String(contactInfo.Mailbox.name);

	    		done(null);	
	    	}, 
	    	function(err){

	    		done(err);
	    	});
	    }
	});

	if(!exec.error){

		var query = {username: username};
		
		// Encriptar la contraseña.
		var encPass = CryptoJS.AES.encrypt(options.pass, options.encKey);

		Meteor.users.upsert(query, {$set: query, $setOnInsert: {fullName: contactName, isAdmin: false} });

		// Actualizar la contraseña encriptada.
		Meteor.users.update(query, {$set: query, $set: {encPass: String(encPass)}});
	}

	return exec;
}

Accounts.registerLoginHandler('ldap', function (request) {

  var username = request.username.trim().toLowerCase().split('@')[0];
      auth = LDAP.quickAuth(request);

  if (!auth.error) {
    var user = Meteor.users.findOne({username: username});

    return {userId: user._id};
  } else {

    return {error: auth.error};
  }

});