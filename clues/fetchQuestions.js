var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(process.env.NEO4j_DRIVER, neo4j.auth.basic("neo4j", "password"));
var session = driver.session();
var async = require("async");
module.exports = function(topic, callback) {
  let query="match(t:topic{topic:{topicSelected}})<-[:Belongs_to]-(s:subject) return s order by rand() limit 5"
  let params={topicSelected:topic};
  session
  .run(query,params)
  .then(function(results)
  {
    let subjectMap = {};
    let cluesArray = [];

    const generateFunctionArray = [];

    results.records.forEach(function(item) {
      item.forEach(function(value) {
        const subject = value.properties.subject;
        const subjectItem = {subject: subject, clues: [], options:[]};
        cluesArray.push(subjectItem);
        subjectMap[subject] = subjectItem;
        let queryForOptions="match(t:topic{topic:{topicSelected}})<-[:Belongs_to]-(s:subject) match(s)-[:Described_by]->(c:clue) return s order by rand()  limit 4"
        let paramsForOptions={topicSelected:topic};
        session
        .run(queryForOptions,paramsForOptions)
        .then(function(results)
        {
          results.records.forEach(function(option) {
          option.forEach(function(value) {
              const option = value.properties.subject;
              if(option!=subject&&(subjectItem.options.includes(option)===false)&&(subjectItem.options.length!=3)){
                  subjectItem.options.push(option);
              }
            });
          });
          session.close;
          driver.close;
        });
        generateFunctionArray.push(generateCluesForSubject.bind(null, subject));
      });
    });

    async.parallel(generateFunctionArray, function(err, results) {
      if(err) { /* Handle Error */; return; }
      results.forEach(function(receivedRecords){
        receivedRecords.records.map(function(obj) {
          const subjectIndex = obj.keys.indexOf('s.subject');
          const clueIndex = obj.keys.indexOf('c.clue');
          const subject = obj._fields[subjectIndex];
          const clue = obj._fields[clueIndex];

          const subjectItem = subjectMap[subject];
          if(subjectItem.clues.length!=5)
          subjectItem.clues.push(clue);
        });
      });
      session.close;
      driver.close;
      callback(null, cluesArray);
    });
  });
}

function generateCluesForSubject(subject, callback) {
  let queryForClue="match(s:subject{subject:{subject}})-[:Described_by]->(c:clue) return s.subject,c.clue"
  let paramsForClue={subject:subject};
  session
  .run(queryForClue,paramsForClue)
  .then(function(results)
  {
    session.close;
    driver.close;
    callback(null, results);
  });
}
