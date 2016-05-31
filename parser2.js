var http = require("http");
var https = require("https");

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
var getJSON = function(options, onResult)
{
    console.log("rest::getJSON");

    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
        	console.log(output);
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
       console.log('error: ' + err.message);
    });

    req.end();
};

var options = {
    host: 'fa.wikipedia.org',
    port: 443,
    path: '/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&format=json&titles=%D8%A7%D8%AF_%D9%84%DB%8C_(%D8%B3%DB%8C%D8%A7%D8%B3%D8%AA%D9%85%D8%AF%D8%A7%D8%B1)',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

var call = function(status, obj){
	console.log(obj);
};

getJSON(options, call);
