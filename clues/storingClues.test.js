const storingClues = require('./storingClues');

const name = 'Sachin Tendulkar';
const topic = 'Sports';
const clueArray = ['He is a Cricketer','He is master-blaster'];

getSimilarSubjects(pID, qID, description, (err, similarSubject) => {
  if(err) { console.log('ERR:',err); return }
  console.log('Received Subject:',similarSubject);
});
