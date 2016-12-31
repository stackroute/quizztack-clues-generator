var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(process.env.NEO4j_DRIVER, neo4j.auth.basic("neo4j", "password"));
var session = driver.session();

module.exports = function(clueObject,callback) {
  var subject=clueObject.subject;
  var clueArr=clueObject.clueArray;
  var topic=clueObject.topic;
  var difficulty=200,start=0,end=0;
  var clueArrayLength=clueArr.length;
  var lengthOfInterval=Math.round(clueArrayLength/5);
  end=lengthOfInterval;
  while(clueArrayLength>0)
  {
    clueArray=clueArr.slice(start,end);
    let query="MERGE (t:topic {topic:{topicChosen}})<-[:Belongs_to]-(s:subject {subject:{subject}}) FOREACH (clueArray in {clue} | MERGE (s)-[:Described_by]->(c:clue{clue:clueArray,difficulty:{difficulty}})) return t,s"
    let params={topicChosen:topic,subject:subject,clue:clueArr,difficulty:difficulty};
    session
    .run(query,params)
    .then(function(results){
      console.log('results');
      console.log(results);
      session.close;
      driver.close;
    })
    difficulty+=200;
    start=end;
    end=end+lengthOfInterval;
    clueArrayLength=clueArrayLength-lengthOfInterval;
  }
  callback(null);
}
