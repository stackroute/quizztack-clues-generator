var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(process.env.NEO4j_DRIVER, neo4j.auth.basic("neo4j", "password"));
var session = driver.session();
var async = require("async");
module.exports = function(callback) {
  var topics=["Sports","Music","Science","History","Politics","Movies"],options={};
  async.each(topics, function(topic, callback1){
    var clues={};
      let query="match(t:topic{topic:{topicSelected}})<-[:Belongs_to]-(s:subject) return s order by rand() limit 5"
      let params={topicSelected:topic};
      session
      .run(query,params)
      .then(function(results)
      {
        var subjectArray={};
        results.records.map(function(obj){
          obj.forEach(function(value){
            let queryForClue="match(s:subject{subject:{subject}})-[:Described_by]->(c:clue) return s,c"
            let paramsForClue={subject:value.properties.subject};
            session
            .run(queryForClue,paramsForClue)
            .then(function(results)
            {
            results.records.map(function(obj){
                var tempArray=[];
              obj.forEach(function(value){
                tempArray.push(value.properties);
              })
              console.log('temp arr');
              console.log(tempArray);
            })
            session.close;
            driver.close;
          })
          })
        })
        session.close;
        driver.close;
      })


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
      console.log(options);
    })
    //callback1(null,options);
  },function(err,options){
    if(err)
    {
      console.log("Error");
    }else{
      console.log('in else');
      console.log(options)
    }
  });
//callback(null,clues,options);
}
