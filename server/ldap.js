process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var credentials = {
  client: {
    id: Meteor.settings.credentials.id,
    secret: Meteor.settings.credentials.secret,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};

// The scopes the app requires
var scopes = [ 'openid', 'User.Read','Calendars.ReadWrite.Shared', 'offline_access'];
var oauth2 = require('simple-oauth2').create(credentials);
var redirectUri = 'http://localhost:3000/authorize';
Future = Npm.require('fibers/future');
Fiber = Npm.require('fibers');
var microsoftGraph = require("@microsoft/microsoft-graph-client");
var LDAP = {};

LDAP.quickAuth = function(auth_code){

	var token;
	var future = new Future();

	oauth2.authorizationCode.getToken({

		code: auth_code,
		redirect_uri: redirectUri,
		scope: scopes.join(' ')
	},
	Meteor.bindEnvironment(function(error, result) {

		if(error){

			future.throw(new Meteor.Error(403, 'Error de Autenticación.'));
		}
		else{

			token = oauth2.accessToken.create(result);

			var client = microsoftGraph.Client.init({
				authProvider: (done) => {
					// Just return the token
					done(null, token.token.access_token);
				}
			});

			client.api('/me').get((err, res) => {

				if(err){

					future.throw(new Meteor.Error(403, 'Error de Autenticación.'));
				}
				else{

					var contactName = res.displayName;
					var email = res.userPrincipalName;
					var username = email.substring(0, email.indexOf("@"));
					var domain = email.substring(email.indexOf("@") + 1, email.length);
					var query = {username: username};

					if(domain === Meteor.settings.COMPANY_DOMAIN){

						Fiber(function(){

							Meteor.users.upsert(query, {$set: query, $setOnInsert: {fullName: contactName, isAdmin: false} });
							
							Meteor.users.update(query, {$set: query, $set: {
								encPass: String(token.token.access_token),
								refreshToken: String(token.token.refresh_token),
								expirationDate: String(token.token.expires_at.getTime())
							}});

							future["return"]({username: username});
						}).run();
					}
					else{

						future.throw(new Meteor.Error(405, 'Dominio incorrecto.'));
					}
				}
			});
		}
	}));

	return future.wait();
};


Meteor.methods({
	'getAuthUrl': function(){

		var returnVal = oauth2.authorizationCode.authorizeURL({
		    redirect_uri: redirectUri,
		    scope: scopes.join(' ')
		});

		return returnVal;
	}
});


Accounts.registerLoginHandler('ldap', function (request) {

	auth = LDAP.quickAuth(request.auth_code);

	if(!auth.error){
		
		var user = Meteor.users.findOne({username: auth.username});
		return {userId: user._id};
	}
	else{

		return {error: auth.error}
	}
});
