timerID=setInterval(()=> ClueGenerator(),5000)

function ClueGenerator(){
	const redis = require('redis');

	const popClient = redis.createClient(6379, process.env.REDIS_HOST);
	const pushClient = redis.createClient(6379, process.env.REDIS_HOST);
	const storeClient = redis.createClient(6379, process.env.REDIS_HOST);
	const deleteClient = redis.createClient(6379, process.env.REDIS_HOST);
	const sub = redis.createClient(6379, process.env.REDIS_HOST);
	const subDelete = redis.createClient(6379, process.env.REDIS_HOST);


	const generateClue = require('./clues/generateClue');
	const storeClue = require('./clues/storeClue');
	const async = require("async");

	pushClient.on('error', (err) => {
		if(err) { console.log('ERR:', err); return; }
	});

	pushClient.on('ready', () => {
		getMessage();
	});


	function getMessage() {
		console.log('Waiting for message');
		popClient.brpop('cluesGenInputWorkQueue', 0, (err, replyString) => {
			console.log('Received message');
			if(err) { console.log('ERR:', err); getMessage(); return; }
			if(!replyString) { getMessage(); return; }
			const reply = JSON.parse(replyString[1]);
			generateClue(reply.searchId,reply.subject,reply.description, (err, clues) => {
				if(err) { console.log('ERR:', err); }
				if(clues){
					// console.log('search id'+reply.searchId);
					// console.log('clues received');
					// console.log(clues);
					pushClient.lpush(reply.searchId, JSON.stringify({clueData:clues}), function(error , clues) {
						if(err) { console.log('ERR:', err); return; }
						else{
							console.log('Pushed:', clues);
						}
					});
					pushClient.publish(reply.searchId+'_publishList',JSON.stringify({clueData:clues}), ()=> {
						console.log('publish');
					});
				}
				getMessage();
			});
		});
	}


	sub.subscribe('publishSearchId');
	sub.on('message',function(channel,searchId_and_topic){
		var data=JSON.parse(searchId_and_topic);
		storeMessage(data.searchId,data.topic);
	});

	subDelete.subscribe('publishSearchIdToDelete');
	subDelete.on('message',function(channel,searchId){
		var data=JSON.parse(searchId);
		console.log('deletequeue',data.searchId);
		pushClient.quit();
		deleteClient.del(data.searchId);
		deleteClient.del(data.workQueue);
	});

	function storeMessage(searchId,topic) {
		storeClient.brpop(searchId, 0, (err, replyString) => {
			if(err) { console.log('ERR:', err); return; }
			if(!replyString) { return; }
			const reply = JSON.parse(replyString[1]);
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

	clearInterval(timerID);
}
