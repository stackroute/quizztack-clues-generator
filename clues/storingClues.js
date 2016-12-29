module.exports = function(clueObject,callback) {

  var subject=clueObject.subject;
  var clueArray=clueObject.clueArray;
  var topic=clueObject.topic;
  var difficulty=200,start=0,end=0;
  var clueArrayLength=clueArray.length;
  var lengthOfInterval=clueArrayLength/5;
  end=lengthOfInterval;
  for(var i=0;i<lengthOfInterval;i++)
  {

MERGE (t:topic {name:'Sports'})<-[:Belongs_to]-(s:subject {name:'yuvraj'})
FOREACH (clue in ["clue13","clue14","clue15","clue16","clue17","clue18"] |
MERGE (s)-[:Described_by]->(c:clue{name:clue,difficulty:'600'})) return t,s


         clueArray=clueArr.slice(start,end);
         console.log(clueArray);
         let query="CREATE (t:topic {topics:{topicChosen}})<-[:Belongs_to]-(s:subject {subject:{subject}}) FOREACH (clueArray in {clue} |  MERGE (s)-[:Described_by]->(c:clue{clue:clueArray,difficulty:difficulty})) return t"
         let params={subject:subjectData.name,clue:clueArray,topicChosen:topicSelected,difficulty:difficulty};
         session
            .run(query,params)
            .then(function(results){
               session.close;
               driver.close;
             })
         difficulty*=2;
         start=end;
         end=lengthOfInterval*2;
  }
}
