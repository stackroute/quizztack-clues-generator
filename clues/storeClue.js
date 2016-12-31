var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(process.env.NEO4j_DRIVER, neo4j.auth.basic("neo4j", "password"));
var session = driver.session();

module.exports = function(clueObject,callback) {
  var subject=clueObject.subject;
  var clueArr=clueObject.clueArray;
  var topic='Sports';
  var difficulty=200,start=0,end=0;
  var clueArrayLength=clueArr.length;
  console.log("ArrayLength"+clueArrayLength);
  console.log(clueArr);
  var lengthOfInterval=Math.round(clueArrayLength/5);
  end=lengthOfInterval;
  console.log(lengthOfInterval);

  while(clueArrayLength>0)
  {
    clueArray=clueArr.slice(start,end);
    console.log(subject);
    console.log(clueArray);
    console.log(topic);
    console.log(difficulty);
    let query="MERGE (t:topic {name:{topicChosen}})<-[:Belongs_to]-(s:subject {name:{subject}}) FOREACH (clueArray in {clue} | MERGE (s)-[:Described_by]->(c:clue{name:clue,difficulty:'600'})) return t,s"
    let params={topicChosen:topic,subject:subject,clue:clueArr,difficulty:difficulty};
    session
    .run(query,params)
    .then(function(results){
      session.close;
      driver.close;
    })
    difficulty+=200;
    start=end;
    end=end+lengthOfInterval;
    clueArrayLength=clueArrayLength-lengthOfInterval;
  }
  //callback(null,clueObject.searchId);
}
