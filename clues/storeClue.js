var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(process.env.NEO4j_DRIVER, neo4j.auth.basic("neo4j", "password"));
var session = driver.session();

module.exports = function(clueObject,callback) {
  var subject=clueObject.subject;
  var clueArr=clueObject.clueArray;
  var topic=clueObject.topic;
  console.log(clueObject);
  let query="MERGE (t:topic {topic:{topicChosen}})<-[:Belongs_to]-(s:subject {subject:{subject}}) FOREACH (clueArray in {clueArr} | MERGE (s)-[:Described_by]->(c:clue{clue:clueArray})) return t,s"
  let params={topicChosen:topic,subject:subject,clueArr:clueArr};
  session
  .run(query,params)
  .then(function(results){
    session.close;
    driver.close;
  })
  callback(null);
}
