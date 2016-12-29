const redis = require('redis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

console.log('redisHost:',redisHost);
console.log('redisPort:',redisPort);
const client = redis.createClient(redisPort, redisHost);

const generateClue = require('./clues/generateClue');

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
		console.log('reply:', reply);
		generateClue(reply.subject, reply.description, (err, clues) => {
			if(err) { console.log('ERR:', err); }
			const data = {
				subject: reply.subject,
				clues: clues,
				category: reply.category
			}
			const outputList = 'cluesGenOutputQueue_' + reply.searchId;
			console.log('outputList:', outputList);
			client.lpush(outputList, JSON.stringify(data), (err) => {
				if(err) { console.log('ERR:', err); return; }
				console.log('Pushed:', data);
				getMessage();
			});
		});
	});
}