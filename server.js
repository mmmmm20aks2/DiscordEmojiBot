var Discord = require("discord.js");
var sharp=require('sharp');
var fs=require('fs');
var request=require('request');

var tokens=["USER_1_TOKEN", "USER_2_TOKEN"];

var current=0;

spawnNewClient();

function spawnNewClient(){
	var newClient=new Discord.Client();
	var token=tokens[current];

	newClient.on('ready', function(){
		current++;
		if(current<tokens.length)
			spawnNewClient();

		console.log("Client "+current+" ready.");
		console.log(newClient.user.username+" is ready");

		var emojiStore=newClient.emojis;
		var emojis=emojiStore.array();
		newClient.on("message", function(message){
			if(message.content.length>100)
				return;
			if(message.author.id==newClient.user.id){
				var msg=message.content;
				var nbOfColon=msg.split(":").length-1;

				for(var i=0;i<msg.length;i++){
					if(msg.charAt(i)==":" && (i==0 || msg.charAt(i-1)!="<")){

						var beginEmote=i;
						var endEmote=msg.indexOf(":", i+1);
						if(endEmote==-1)
							return;

						var emoteName=msg.substring(beginEmote+1, endEmote);
						console.log("Emote name : "+emoteName);
						var msgWithoutEmote=msg.replace(":"+emoteName+":", "");
						console.log("Message without emote : "+msgWithoutEmote);

						var emoji=emojiStore.find(val => val.name.toLowerCase()==emoteName.toLowerCase());
						if(emoji==null)
							return;
						fs.stat('/Emojis/'+emoteName+'.png', function(err, stat){
							if(err == null) {
						        message.channel.send(msgWithoutEmote || "", {files: ['/Emojis/'+emoteName+'.png']})
							  	  .then(function(){
							  	  	message.delete();
							  	});
						    } else if(err.code == 'ENOENT') {
						    	var emojiResizer=
									sharp()
									    .resize(30, 30)
									    .png()
									    .on('error', function(err){
									    	console.log(err);
									    });
						    	console.log("Acquiring new emoji.");

						    	console.log(emoji.url);
						    	var file=fs.createWriteStream('/Emojis/'+emoteName+'.png');
						    	var stream=request(emoji.url).on('response', function(response) {
								    console.log(response.statusCode) // 200
								    console.log(response.headers['content-type']) // 'image/png'
								  }).on('error', function(err) {
								    console.log(err);
								  }).pipe(emojiResizer).pipe(file);

						    	stream.on('close', function(){
						    		file.close();
						    		console.log("Sending the message now");
							    	message.channel.send(msgWithoutEmote || "", {files: ['/Emojis/'+emoteName+'.png']})
								  	  .then(function(){
								  	  	message.delete();
								  	}).catch(console.log);
						    	});
						    } else {
						        console.log('Some other error: ', err.code);
						    }
						});
						console.log(msgWithoutEmote.length);
					}
				}
					
			}
		});
	});

	newClient.login(token);
}
