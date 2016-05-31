var wtf_wikipedia = require("wtf_wikipedia")
//fetch wikipedia markup from api..
wtf_wikipedia.from_api("%D8%AC%D9%88%D8%A7%D8%AF_%D9%81%DA%A9%D9%88%D8%B1%DB%8C", "fawiki", function(markup){
  var obj= wtf_wikipedia.parse(markup)
	console.log(obj);
	//    // {text:[...], infobox:{}, categories:[...], images:[] }
      var mayor= obj.infobox.leader_name
//        // "John Tory"
        })
