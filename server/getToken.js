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

var request = require('request');
var Future = Npm.require('fibers/future');
var Fiber = Npm.require('fibers');
var oauth2 = require('simple-oauth2').create(credentials);

function getToken(username){

	var user = Meteor.users.findOne({"username": username});

	var tokenObject = {
		'access_token': String(user.encPass),
		'refresh_token': String(user.refreshToken),
		'expires_in': String(user.expirationDate)
	}

	var token = oauth2.accessToken.create(tokenObject);

	var expiration = new Date(parseFloat(user.expirationDate));

	if(expiration <= new Date()){

		token.refresh((error, result) => {
			
			var query = {username: username};

			Fiber(function(){

				Meteor.users.update(query, {$set: query, $set: {
					encPass: String(result.token.access_token),
					refreshToken: String(result.token.refresh_token),
					expirationDate: String(result.token.expires_at.getTime())
				}});
			}).run();

			return result.token.access_token;
		});
	}
	else{

		return token.token.access_token;
	}
}

exports.getToken = getToken;
