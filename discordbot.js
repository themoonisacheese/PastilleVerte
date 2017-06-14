/*
	PastilleVerteBot, a bot that basically has a karma system
	Written entirely by Olivier Senn, AKA Themoonisacheese.
	
	Redistribution allowed under GNU GPL License	
*/

// import the discord.js module
const Discord = require('discord.js');
var util = require('util');
var fs = require('fs');

// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

// the token is to be stored in a file called "token.txt" in the same folder as this file.
const token = fs.readFileSync('./token.txt', 'utf-8');

// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
bot.on('ready', () => {
	
	var now = new Date();
	var datestring = now.toString();
  	console.log('[' + datestring + '] I am ready!');

	bot.user.setGame('=karmahelp =karmainvite');

});



var Userdb = new Map(); //a list of all users that currently have a score registered. key is the user object, value is the score
var hasAdmin = true; //does the bot currently have an admin
var adminHandle = '<@107448106596986880>'; // and what's his discord handle. defaults to mine because reasons.


bot.on('messageReactionAdd', function(messageReaction, user){ //TODO:listen for messageReactionRemove and ajust user score accordingly. //user designates the emmiting user of the event
//console.log('found reaction: '+ messageReaction.emoji.toString());
	if(user.bot) return; //bots are a problem.
	if(user.id === messageReaction.message.author.id) return; //cant give yourself karma
	
	
	  if (messageReaction.emoji.toString()=== '👍') {//we detected an upvote //also that's a thumbs up emoji except encoding is broken but it still works

			var User = messageReaction.message.author; //store the user temporarly: optimization + this is really fucking long to type.
			var UserHandle = User.toString();
			console.log('Updoot for '+ User.username);
			
		if(!Userdb.has(UserHandle)){//we don't know the user yet. add him to the userdb and set his brand new score
			Userdb.set(UserHandle, 1);
			console.log(User.username + ' is unknown');
		}else{ //we DO know the user, just increment his score
			Userdb.set(UserHandle, Userdb.get(UserHandle) + 1); //add to the user's score	
		}
		console.log('Their score is now ' + Userdb.get(UserHandle));
		UserDBW();
	  }//endif (messageReaction.emoji.toString()=== '👍')
		  
	  else if(messageReaction.emoji.toString()=== '👎'){//we detected a downvote
			var User = messageReaction.message.author; // store the user temporarly: optimization + this is really fucking long to type.
			var UserHandle = User.toString();
		  
		  console.log('Downdoot for ' + User.username);
		if(!Userdb.has(UserHandle)){//we don't know the user yet. add him to the userdb and set his brand new score
			Userdb.set(UserHandle, -1);
			console.log(User.username + ' is unknown');
			
		}else{ //we DO know the user, just decrement his score
			Userdb.set(UserHandle, Userdb.get(UserHandle) -1); //remove from the user's score
		}	
		console.log('Their score is now ' + Userdb.get(UserHandle));  
		UserDBW();
	  }//endif(messageReaction.emoji.toString()=== '👎')
		  
	
});


bot.on('message', message => {
	if(message.content.startsWith('=karma')){

	//console.log('new message detected: '+message.content);
	var hasMessageToSend = false; //send our message at the end when we're sure of everything.
	var messageToSend = new String;//this is not optimal but i can't be bothered
	if (message.content.startsWith('=karma <@')){//console.log('detected =karma command')
		//we detected a karma query
		//find out which user's karma we want
		
		var userToFind = message.mentions.users.first();//got 'em
		
		if(userToFind !== undefined){
		
			console.log(message.author.username + ' requested karma of ' + userToFind.username);

			
			if (Userdb.has(userToFind.toString())){//hey look this user actually has a score what a surprise
				var userscore = Userdb.get(userToFind.toString());
			
			
				messageToSend = userToFind.username + '\'s karma: ' + userscore.toString();
				hasMessageToSend = true;
				console.log('it\'s ' + userscore);
			}else{//this user doesnt have a score wtf are you on about?
				messageToSend = 'I don\'t know ' + userToFind.username + ' yet.';
				hasMessageToSend = true;
				console.log('However I have no idea who they are.');
			}
		}
		
	}else if(message.content === '=karma'){ //same as above except no username needed
		//we detected a karma query
		//find out which user's karma we want
		
		var userToFind = message.author;
		
		console.log(message.author.username + ' requested his own karma');

		
		if (Userdb.has(userToFind.toString())){//hey look this user actually has a score what a surprise
			var userscore = Userdb.get(userToFind.toString());
		
		
			messageToSend = userToFind.username + '\'s karma: ' + userscore;
			hasMessageToSend = true;
			console.log('it\'s ' + userscore);
		}else{//this user doesnt have a score wtf are you on about?
			messageToSend = 'I don\'t know ' + userToFind.username + ' yet.';
			hasMessageToSend = true;
			console.log('However I have no idea who they are.');
		}
		
	}else if(message.content.startsWith('=karmareset <@')){//let's reset karma
		if(hasAdmin){
			if (message.author.toString() === adminHandle){//user is the admin, reset the karma
              
				var userToFind = message.mentions.users.first();
				
				if(userToFind !== undefined){
					console.log('Reset of ' + userToFind.username + '\'s karma has been requested');
				
					if (Userdb.has(userToFind.toString())){//same as before, find out which user we want (done by now) and reset his karma
						var userscore = Userdb.set(userToFind.toString(), 0);
					
				
						messageToSend = userToFind.username + '\'s karma has been reset';
						hasMessageToSend = true;
						console.log('Success!');
					}else{
						//that is, if they actually have some karma
						messageToSend = 'I don\'t know ' + userToFind.username + ' yet.';
						hasMessageToSend = true;
						console.log('However I have no idea who they are.');
					}
				}
			
			}else{//user is not admin, downvote him and log that
				messageToSend = 'ta kru t ki ta kru tu fé koi';
				hasMessageToSend = true;
				message.react('👎');
				console.log(message.author.username + 'tried (and failed horribly) to reset karma');
				
			}
		}else{ //bot doesnt have an admin. instruct users
			messageToSend = 'I do not have an admin yet. Use _=karmadmin_ to become and admin';
			hasMessageToSend = true;
		}

			
	}else if(message.content.startsWith('=karmadmin')){ //this is not to be used, ever. but i liked doing it so here it is.
		if(!hasAdmin){//user wants to become and admin
			adminHandle = message.author.toString();
			hasAdmin = true;
			messageToSend = 'I now obey ' + adminHandle;
			hasMessageToSend = true;
			console.log(adminHandle + ' is now my admin');
		}
	}else if(message.content.startsWith('=karmabandon')){ //this is not to be used, ever. but i liked doing it so here it is.
		if(hasAdmin){//admin wants to pursue his dreams and become a butterfly
			if(message.author.toString()=== adminHandle){
				hasAdmin = false;
				adminHandle = '';
				messageToSend = 'I no longer have an admin!';
				hasMessageToSend = true;
				console.log('I no longer have an admin');
			}else{//unless author is not actually the admin. then fuck'em
				messageToSend = 'ta kru t ki ta kru tu fé koi';
				hasMessageToSend = true;
				message.react('👎');
				console.log(message.author.username + 'tried (and failed horribly) to reset admin');
			}
		}else{//can't resign admin if there is none.
			messageToSend = 'I currently have no admin'
			hasMessageToSend = true;
		}
	}else if(message.content === '=karmahelp'){
		//display help message
		message.author.sendMessage('Here are my commands:\n\
		=karma [@user]  - See user\'s total score. If no user is provided then see your own karma\n\
		=karmacount     - Enumerates the total amount of know users across all guilds\n\
		=karmahelp      - See this helpful help message.\n\
		=karmainvite    - Get an invite link.\n\
How do I work? Simply react to messages you like or don\'t like with the :thumbsup:� or :thumbsdown: emoji. This will then increase or decrease the message author\'s karma.\n\
Message my owner @Themoonisacheese on https://discord.gg/YC9raqG if you\'re bored or have further questions');
	
	
	}else if(message.content === '=karmainvite'){
		message.author.sendMessage('https://discordapp.com/oauth2/authorize?client_id=280333535963906050&scope=bot&permissions=67439680');
		
	}else if(message.content === '=karmacount'){
		hasMessageToSend = true;
		messageToSend = 'Total users I know about: ' + Userdb.size.toString();
	}
	
	
	
	
	
	if(hasMessageToSend){
		message.channel.sendMessage(messageToSend);
		hasMessageToSend = false;
	}
}
});



	

function UserDBW(){
	fs.writeFileSync('./userDB.json', JSON.stringify(Array.from(Userdb.entries())), 'utf-8');
}

function UserDBR(){
	Userdb = new Map(JSON.parse(fs.readFileSync('./userDB.json', 'utf-8')));
	console.log(Userdb);
}

UserDBR();
// log our bot in
bot.login(token);
