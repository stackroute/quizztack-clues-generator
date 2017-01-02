var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(process.env.NEO4j_DRIVER, neo4j.auth.basic("neo4j", "password"));
var session = driver.session();
var async = require("async");
module.exports = function(callback) {
  var topics=["Sports","Music","Science","History","Politics","Movies"]
  async.each(topics, function(topic, callback1){
    let queryForOptions="match(t:topic{topic:{topicSelected}})<-[:Belongs_to]-(s:subject) match(s)-[:Described_by]->(c:clue) return s order by rand() limit 30"
    let paramsForOptions={topicSelected:topic};
    session
    .run(queryForOptions,paramsForOptions)
    .then(function(results)
    {
      var tempArr=[];
      results.records.map(function(obj){
        obj.forEach(function(value){
          tempArr.push(value.properties.subject);
        })
      })
      session.close;
      driver.close;
      options[topic]=tempArr;
      //console.log(options);
    })
    callback1(null,options)
  },function(err){
    if(err)
    {
      console.log("Error");
    }
  });
  callback(null);
}
