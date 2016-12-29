const redis = require('redis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

const client = redis.createClient(redisPort, redisHost);

client.on('error', (err) => {
	if(err) { console.log('ERR:', err); return; }
});

client.on('ready', () => {
	getMessage();
});

function getMessage() {
	client.brpop('provisionerWorkQueue', 0, (err, reply) => {
		if(err) { console.log('ERR:', err); return; }
		console.log('reply:', reply);
		client.quit();
	});
}