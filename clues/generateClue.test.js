const generateClues = require('./generateClue');

const searchId='12'
const similarSubject = 'Stuart Law';
const description = 'Cricketer';

generateClues(searchId,similarSubject, description, (err, clues) => {
  if(err) { console.log('ERR:',err); return };
  console.log('Generation Complete:', clues);
});
