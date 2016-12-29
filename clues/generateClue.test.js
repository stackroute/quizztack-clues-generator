const generateClues = require('./generateClue');

const name = 'Sachin Tendulkar';
const description = 'Cricketer';

generateClues(name, description, (err, clues) => {
  if(err) { console.log('ERR:',err); return };
  console.log('Generation Complete:', clues);
});
