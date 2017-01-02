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


function getMessage() {
	client.brpop('cluesGenInputWorkQueue', 0, (err, replyString) => {
		if(err) { console.log('ERR:', err); return; }
		if(!replyString) { return; }
		const reply = JSON.parse(replyString[1]);
		generateClue(reply.searchId,reply.subject, reply.description, (err, clues) => {
			if(err) { console.log('ERR:', err); }
			if(clues!=false){
				console.log('search id'+reply.searchId);
				console.log('clues received');
				console.log(clues);
				client.lpush(reply.searchId, JSON.stringify({clueData:clues}), function(error , clues) {
					if(err) { console.log('ERR:', err); return; }
					else{
					console.log('Pushed:', clues);
				}
				});
				pub.publish('publishList',JSON.stringify({clueData:clues}));
				getMessage();
			}
			else {
				getMessage();
			}
		});
	});
}


sub.subscribe('publishSearchId');
sub.on('message',function(channel,searchId_and_topic){
	var data=JSON.parse(searchId_and_topic);
	storeMessage(data.searchId,data.topic);
});


function storeMessage(searchId,topic) {
	storeClient.brpop(searchId, 0, (err, replyString) => {
		if(err) { console.log('ERR:', err); return; }
		if(!replyString) { return; }
		const reply = JSON.parse(replyString[1]);
		console.log(clue);
		const data = {
      "subject": reply.clueData.name,
      "clueArray":reply.clueData.detailedDescription.articleBody,
			"topic":topic
    };
		storeClue(data, (err) => {
			if(err) { console.log('ERR:', err); }
		});
			storeMessage(searchId,topic);
	});
}



// const fetchQuestions = require('./clues/fetchQuestions');
//
// fetchQuestions((err, clues) => {
//   if(err) { console.log('ERR:',err); return };
//   console.log('Clue:', clues);
// });
