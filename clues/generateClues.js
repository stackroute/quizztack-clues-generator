var async = require("async");
var request = require('request');
var redis = require('redis');
const redisUrl = process.env.REDIS_URL || "localhost";
const redisPort = process.env.REDIS_PORT || "6379";
var pub = redis.createClient(redisPort, process.env.REDIS_HOSTNAME);
var dataList=redis.createClient(redisPort, process.env.REDIS_HOSTNAME);
var workqueue= redis.createClient(redisPort, process.env.REDIS_HOSTNAME);
var nlp = require('nlp_compromise');
workqueue.on("error", (err) => {
  console.log('Error:',err);
});
workqueue.on("ready", () => {
  getClues();
});
function getClues(){
  console.log('in get clues');
  workqueue.BRPOP('workQueue',0,(err, clueData) => {
    if(err) { process.exit(-1); }
    var data=JSON.parse(clueData[1]);
    value= data.workQueueData;
    description= data.selectedSubjectDescription;
    searchId=data.searchId;
    if(value!=null){
      console.log('Start Processing:',value);
      processClues(JSON.stringify(data), (err) => {
        if(err) { return workqueue.lpush('clueGeneratorWorkQueue',value); }
        console.log('Processing Complete',value);
        setTimeout(getClues);
      });
    }
  });
}
function processClues(clueData,callback){
  var data=JSON.parse(clueData);
  listValue= data.workQueueData;
  description= data.selectedSubjectDescription;
  searchId=data.searchId;
  var count=0,image={};
  searchUri='https://kgsearch.googleapis.com/v1/entities:search?query='+listValue+'&key=AIzaSyBIqOeykX5B6xGKC7xsZWmS86P81Zr12DY&indent=True';
  request(searchUri, function (error, response, body)
  {
    if (!error && response.statusCode == 200)
    {
      var cluesJson=JSON.parse(response.body);
      async.each(cluesJson.itemListElement, function(item, callback1){
        wikipediaUri='https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles='+item.result.name;
        request(wikipediaUri, function (error, response, body)
        {
          if (!error && response.statusCode == 200)
          {
            var clues=JSON.parse(response.body);
            async.each(clues.query.pages, function(index,callback2){
              if(item.result.hasOwnProperty('detailedDescription')&&item.result.description==description){
                item.result.detailedDescription.articleBody=index.extract
                var clue=item.result.detailedDescription.articleBody;
                var flag=0;
                var sentences=[],clueArr=[];
                var jeopardyClues=[];
                var des = item.result.description;
                var name = item.result.name;
                var nameArr = name.split(' ');
                var nameLength = nameArr.length;
                var splitByDot=nlp.text(clue);
                splitByDot.sentences.map(function(value){
                  var pattern = new RegExp(/((, ))/, "ig");
                  var values=value.str.split(pattern);
                  values.forEach(function(eachSentence){
                    var element = nlp.text(eachSentence).text();
                    var temp=element.trim().split(' ').length;
                    if(temp>4)
                    {
                      var checkGrammer=nlp.text(element);
                      checkGrammer.sentences.forEach(function(terms){
                        if(terms.terms[0].tag=="Noun"||terms.terms[0].tag=="Adverb"||terms.terms[0].tag=="Person")
                        {
                          sentences.push(terms.str);
                        }
                        else if(terms.terms[0].normal=="and")
                        {
                          terms.terms.forEach(function(value){
                            if((value.pos.hasOwnProperty("Verb")||value.pos.hasOwnProperty("Adjective"))&&flag==0)
                            {
                              sentences.push(terms.str);
                              flag=1;
                            }
                          })
                          flag=0;
                        }
                      })
                    }
                  })
                })
                if(sentences.length>5)
                {
                  var isPosition = sentences[0].search(/ is /i);
                  var wasPosition = sentences[0].search(/ was /i);
                  var pattern = new RegExp(/.+?(( is))/, "i");
                  var result;
                  if(isPosition==-1){
                    sentences.splice(0,2);
                  }
                  else
                  {
                    sentences[0]=sentences[0].replace(pattern, "The subject is ");
                  }
                  for(var j=0;j<sentences.length;j++)
                  {
                    for (var i = 0; i < nameArr.length; i++) {
                      var removeElement = new RegExp(nameArr[i], "ig");
                      sentences[j]=sentences[j].replace(removeElement,"Our Subject");
                    }
                  }
                  if(sentences.length>5)
                  {
                    clueArr=sentences;
                    result=clueArr;
                    item.result.detailedDescription.articleBody=result;
                  }
                  if(item.result.image){

                  }
                  else{
                    image["contentUrl"]="http://res.cloudinary.com/deaxb0msww/image/upload/v1481087596/Image-Not-Available_tcpeee.jpg";
                    item.result["image"]=image;
                  }
                  if(result!=undefined){
                    dataList.lpush(searchId,JSON.stringify({clueData:item.result}), function(error , list) {
                      console.log('Elements in the list is :',list);
                    });
                    pub.publish('publishList',JSON.stringify({clueData:item.result}));
                  }
                }
              }
              callback2(null);
            },function(err)
            {
              if(err)
              {
                console.log('Failed to process');
              }
              else {
                callback1(null);
              }
            });
          }
        });
      },function(err)
      {
        if(err)
        {
          console.log('Failed to process');
        }
        else {
          console.log('Result Sent');
        }
      });
    }
  })
  callback(null);
}