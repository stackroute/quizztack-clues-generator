const getSimilarSubjects = require('./getSimilarSubjects');

const pID = 'P106';
const qID = 'Q12299841';
const description = 'Cricketer';

getSimilarSubjects(pID, qID, description, (err, similarSubject) => {
  if(err) { console.log('ERR:',err); return }
  console.log('Received Subject:',similarSubject);
});
