const redis = require('redis');
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const client = redis.createClient(redisPort, redisHost);
const storeClient = redis.createClient(redisPort, redisHost);
const pub = redis.createClient(redisPort, redisHost);
const sub = redis.createClient(redisPort, redisHost);
const generateClue = require('./clues/generateClue');
const storeClue = require('./clues/storeClue');
var count=0;
client.on('error', (err) => {
	if(err) { console.log('ERR:', err); return; }
});

client.on('ready', () => {
	getMessage();
});

// storeClient.on('error', (err) => {
// 	if(err) { console.log('ERR:', err); return; }
// });
//
// storeClient.on('ready', () => {
// 	storeMessage();
// });

function getMessage() {
	client.brpop('cluesGenInputWorkQueue', 0, (err, replyString) => {
		if(err) { console.log('ERR:', err); return; }
		if(!replyString) { return; }
		const reply = JSON.parse(replyString[1]);
		generateClue(reply.searchId,reply.subject, reply.description, (err, clues) => {
			if(err) { console.log('ERR:', err); }
			if(clues!=false){
				console.log('search id'+reply.searchId);
				console.log('clues received')
				console.log(clues);
				client.lpush(reply.searchId, JSON.stringify({clueData:clues}), function(error , clues) {
					if(err) { console.log('ERR:', err); return; }
					else{
					console.log('Pushed:', clues);
				}
				});
				pub.publish('publishList',JSON.stringify({clueData:clues}));
				setTimeout(getMessage);
			}
			else {
				setTimeout(getMessage);
			}
		});
	});
}


sub.subscribe('publishSearchId');
sub.on('message',function(channel,searchId){
	var data=JSON.parse(searchId);
	storeMessage(data.searchId);
});


function storeMessage(searchId) {
	storeClient.brpop(searchId, 0, (err, replyString) => {
		if(err) { console.log('ERR:', err); return; }
		if(!replyString) { return; }
		const reply = JSON.parse(replyString[1]);
		const data = {
      "subject": reply.clueData.name,
      "clueArray": reply.clueData.detailedDescription.articleBody,
			"searchId":reply.searchId
    };
		storeClue(data, (err,searchId) => {
			if(err) { console.log('ERR:', err); }
			setTimeout(storeMessage(JSON.parse(searchId)));
		});
	});
}
