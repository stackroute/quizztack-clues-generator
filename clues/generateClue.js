var async = require("async");
var request = require('request');
var nlp = require('nlp_compromise');

module.exports = function(searchId,similarSubject,description, callback) {
  searchUri='https://kgsearch.googleapis.com/v1/entities:search?query='+similarSubject+'&key=AIzaSyBIqOeykX5B6xGKC7xsZWmS86P81Zr12DY&indent=True';
  request(searchUri, function (error, response, body)
  {
    if (!error && response.statusCode == 200)
    {
      let cluesJson=JSON.parse(response.body);
      let oneElement=true;
      async.each(cluesJson.itemListElement, function(item, callback1){
        wikipediaUri='https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles='+item.result.name;
        request(wikipediaUri, function (error, response, body)
        {
          if (!error && response.statusCode == 200)
          {
            let clues=JSON.parse(response.body);
            if(clues.query.pages!=undefined&&clues.query!=undefined){
            async.each(clues.query.pages, function(index,callback2) {
              if(item.result.hasOwnProperty('detailedDescription') && item.result.description === description&&oneElement===true) {
                item.result.detailedDescription.articleBody=index.extract
                var clue=item.result.detailedDescription.articleBody;
                var sentences=[],clueArr=[];
                var jeopardyClues=[];
                var des = item.result.description;
                var name = item.result.name;
                var nameArray = name.split(' ');
                var nameArr=[];
                var nameLength = nameArray.length;
                for(names in nameArray)
                {
                  if(nameArray[names].length>2)
                   nameArr.push(nameArray[names]);
                }
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
                          const isUpperCase = (string) => /^[A-Z]*$/.test(string)
                          var wordsCheck=terms.str.split(' ');
                          if(wordsCheck.length>=3&&isUpperCase(terms.str[0])){
                          sentences.push(terms.str);
                        }
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
                  if(!item.result.image){
                    item.result.image = { contentUrl: "http://res.cloudinary.com/deaxb0msww/image/upload/v1481087596/Image-Not-Available_tcpeee.jpg" }
                  }
                  if(sentences.length>4)
                  {
                    clueArr=sentences;
                    result=clueArr;
                    item.result.detailedDescription.articleBody=result;
                    oneElement=false;
                    callback(null,item.result);
                  }else {
                    oneElement=true;
                    callback(null, false);
                  }
                }else {
                  oneElement=true;
                  callback(null, false);
                }
              }else {
                  oneElement=true;
                  callback(null, false);
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
            }else{
              callback(null, false);
            }
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
  }
