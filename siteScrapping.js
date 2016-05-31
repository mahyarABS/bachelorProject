var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");
var parse_infobox = require("/home/mahyar/pro/Project/node_modules/wtf_wikipedia/src/parse/parse_infobox.js");
var host = "http://mappings.dbpedia.org/server/mappings/en/pages/";
var events = require('events');
var eventEmitter = new events.EventEmitter();
var wikipedia_infobox_parser = require("wtf_wikipedia");
var mysql = require("mysql");
var mappings = new Object; 
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "$mah12abas@",
  database: "dbpedia"
});

request({
  uri: host,
}, function(error, response, body) {
  var $ = cheerio.load(body);
  $("a").each(function() {
    var link = $(this);

    var text = link.text();
    var href = link.attr("href");
   	parseMapping(host+href);
  });
});

function getPersionURL(en_url){
   	request({
    	uri: en_url,
  	}, function(error, response, body) {
		var $ = cheerio.load(body);
		var fa_url = $('.interwiki-fa a').attr('href').split('//')[1].substring(22);
		eventEmitter.emit('url_ready', fa_url);
	});
}

function parseMapping(uri){
	console.log('start...');
	var infoboxName = uri.split('%3A')[1];
	request({
    	uri: uri,
  	}, function(error, response, body) {
		var regex = new RegExp(/\{\{(.*)\s*\}\}\s*/);
		var $ = cheerio.load(body);
		var obj;
		$("text").text().split(regex).forEach(function(property){
			if(property != ""){
				var inProperty = false;
				property.split(/\s*\|\s*/).forEach(function(mapping){
					// console.log("mapping " + mapping);
					if(mapping != ""){
						attrs = mapping.split(/\s+=\s+/);
						// console.log(attrs);
						if(attrs[0] == "mapToClass"){
							// console.log("Class = " + attrs[1]);
							mappings[infoboxName] = new Object;
							obj = attrs[1];
							mappings[infoboxName]["ontologyClass"] = obj; 
							con.query('create table ' + attrs[1] + ' (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, url char(100)) COLLATE=\'utf8_unicode_ci\';',function(err, rows){
								if(!err){ 
									console.log('Data received from Db:\n');
							  		console.log(rows);
							  	}
							});
						}
						else if(attrs[0] == "PropertyMapping"){
							// console.log('property made');
							inProperty = true
						}
						else if(attrs[0] == "templateProperty" && inProperty){
							templateProperty = attrs[1];
							// console.log("template property: " + templateProperty);
						}
						else if(attrs[0] == "ontologyProperty" && inProperty){
							ontologyProperty = attrs[1].split(/\s*\}\}/)[0];
							mappings[infoboxName][templateProperty] = ontologyProperty;
							con.query('alter table ' + obj + ' add `' + ontologyProperty.split(/\s+/)[0] + '` char(100), add `' + ontologyProperty.split(/\s+/)[0]+ 'URL` char(100);',function(err, rows){
								 if(err) console.log(err);
								console.log('alter table ' + obj + ' add `' + ontologyProperty.split(/\s+/)[0] + '` char(100), add `' + ontologyProperty.split(/\s+/)[0]+ 'URL` char(100);');
							});
							// console.log("ontology property: " + ontologyProperty.split(/\s*\}\}/)[0]);	
							inProperty = false;
							//console.log(mappings[infoboxName]);
						}
					}
				});
			}
		});
		fs.writeFileSync('mappings.json', JSON.stringify(JSON.stringify(mappings))+"\n", 'utf-8'); 
	});
}

eventEmitter.on('url_ready', function(url_ready){
	console.log(url_ready); 
	wikipedia_infobox_parser.from_api(url_ready, "fawiki", function(markup){
		//console.log(markup);
	  	var obj= wikipedia_infobox_parser.parse(markup)
		console.log(obj);
	    var mayor= obj.infobox.leader_name
    })
});
 // parseMapping("http://mappings.dbpedia.org/server/mappings/en/pages/Mapping_en%3AInfobox_person");
// getPersionURL('https://en.wikipedia.org/wiki/Javad_Fakoori');
