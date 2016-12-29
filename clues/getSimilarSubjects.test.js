const getSimilarSubjects = require('./getSimilarSubjects');
const redis = require('redis');
const redisUrl = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const client = redis.createClient(redisPort, redisUrl);

const pID = 'P106';
const qID = 'Q12299841';
const description = 'Cricketer';
const searchId = 'abc';
const category = 'Sports';

getSimilarSubjects(pID, qID, description, (err, similarSubject) => {
	  if(err) { console.log('ERR:',err); return }
  			const data = {
  			"searchId": searchId,
			"subject": similarSubject,
			"description": description,
			"category": category
	  	};
  	client.lpush("cluesGenInputWorkQueue", JSON.stringify(data), (error, reply) => {
  		  console.log('Pushed');
  	});
});
