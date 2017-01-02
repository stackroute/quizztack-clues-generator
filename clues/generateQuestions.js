const fetchQuestions = require('./clues/fetchQuestions');
var topics=["Sports","Music","Science","History","Politics","Movies"];
const functionArray = topics.map(function(topic) {
	return fetchQuestions.bind(null, topic);
});

async.parallel(functionArray, function(err, results) {
	if(err) { /* TODO: Handle Error */console.log('ERR:',err); return; }
	console.log('res:', results);
});
