var request = require('request');
var wdk = require('wikidata-sdk');
module.exports = function(pId, qId, description,callback) {
  var sparql = `
  SELECT  ?variableLabel
  WHERE { ?variable wdt:${pId} wd:${qId} .
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en" .
  }
}
`
var url = wdk.sparqlQuery(sparql);
request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var subjectsJson=JSON.parse(response.body)
    subjectsJson.results.bindings.map(function(item){
      callback(null,item.variableLabel.value);
    });
  }
});

}
