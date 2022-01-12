const request = require('request');
var fs = require('fs');
const cheerio = require('cheerio');
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function exists(arr, val,) {
  return arr.some(function(el) {
    return el.warezid === val;
  }); 
}
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
const getContent = function(url) {
  return new Promise((resolve, reject) => {
    request({
    url: url,
    method: 'GET',
    followAllRedirects: true
}, function(error, response, body) {
    if (error) {
        console.log(error);
    } else {
        //console.log(response.statusCode);
        if (response.headers['location']) {
          request(response.headers['location'], function(error, response, html) {
            resolve(html);
          });
        } else {
          resolve(body);
        }

    }
});
    })
};

(async () => {
  console.log('Starting....');
      if (fs.existsSync('films.json')) {
  //console.log('files already exist');
   global.currentList = await fs.readFileSync('films.json');
   global.currentList = JSON.parse(currentList);
} else {
    global.currentList = [];
}
let filmsH = async function(url) {
  var list = [];
  var iixix = await getContent(url);
    const $ = cheerio.load(iixix);
 await $('tr').each(function(i) {
   if ($(this).find('td').eq(0).text().trim() !== '') {
 list.push({warezid:$(this).find('td').eq(0).text(), title:$(this).find('td').eq(1).text(), link:$(this).find('td').eq(3).find('a').attr('href')});
   }
  
 });
 return list;
}
let getFinalurl = async function(urlf) {
    return new Promise(async (resolve, reject) => {
  request({ url: urlf, followRedirect: true }, function (err, res, body) {
var finalurl = body.split('window.location.href="')[1].split('"')[0];
finalurl = finalurl.replace('feurl.com/v/', 'fembed.net/v/');
resolve(finalurl);
});
});
}
let grabAPIdata = async function(mid) {
    return new Promise((resolve, reject) => {
  request({ url: 'https://cloud.team-dooo.com/Dooo/TMDB/?code=2739218a-d5b8-488d-a135-826c450ba0bd&filter=single&type=movie&id='+mid+'&id_type=TMDB&language=pt-BR'}, function (err, res, body) {
if (IsJsonString(body)) {
body = JSON.parse(body);
} else {
  body = 'notfound';
}

resolve(body);
});
});
}
let grabYTtrailer = async function(mid) {
    return new Promise((resolve, reject) => {
     // console.log('starting yt grab');
  request({ url: 'https://api.themoviedb.org/3/movie/'+mid+'/videos?api_key=1bfdbff05c2698dc917dd28c08d41096'}, function (err, res, response2) {
if (IsJsonString(response2)) {
  var imiix = response2;
response2 = JSON.parse(response2);
 var Video_Data_Json = response2.results;
 //console.log(response2);
 if (typeof Video_Data_Json != "undefined" && Video_Data_Json.length > 0) {
   if (imiix.includes('"type":"Trailer"')) {
for (var Video_Json_Content of Video_Data_Json) {
if (Video_Json_Content.type == "Trailer") {
      if (Video_Json_Content.site == "YouTube") {
        var trailler_youtube_source = "https://www.youtube.com/watch?v="+Video_Json_Content.key;
        resolve(trailler_youtube_source);
      } else {
        resolve('https://www.youtube.com/watch?v=YecyKnQUcBY'); //default yt
      }
    } 
}
   } else if (imiix.includes('"type":"Teaser"')) {
for (var Video_Json_Content of Video_Data_Json) {
if (Video_Json_Content.type == "Teaser") {
      if (Video_Json_Content.site == "YouTube") {
        var trailler_youtube_source = "https://www.youtube.com/watch?v="+Video_Json_Content.key;
        resolve(trailler_youtube_source);
      } else {
        resolve('https://www.youtube.com/watch?v=YecyKnQUcBY'); //default yt
      }
    } 
}
   } else if (imiix.includes('"type":"Clip"')) {
for (var Video_Json_Content of Video_Data_Json) {
if (Video_Json_Content.type == "Clip") {
      if (Video_Json_Content.site == "YouTube") {
        var trailler_youtube_source = "https://www.youtube.com/watch?v="+Video_Json_Content.key;
        resolve(trailler_youtube_source);
      } else {
        resolve('https://www.youtube.com/watch?v=YecyKnQUcBY'); //default yt
      }
    } 
}
   } else {
resolve('https://www.youtube.com/watch?v=YecyKnQUcBY'); //default yt
   }

 } else {
   response2 = 'https://www.youtube.com/watch?v=YecyKnQUcBY'; //default blank trailer if no trailer is found.
  resolve(response2);
 }
  
} else {
  response2 = 'https://www.youtube.com/watch?v=YecyKnQUcBY'; //default blank trailer if no trailer is found.
  resolve(response2);
}


});
});
}
let filmID2 = async function(url, callback) {

   return new Promise(async (resolve, reject) => {

    var iixix = await getContent(url);
    const $ = cheerio.load(iixix);
          var linkii = [];
  
    if ($('.selectAudioButton').length) { //if both dub and sub exist loop them.
    console.log('Multiple audio found');
 $('.selectAudioButton').each(async function(i) {
var zid = $(this).attr('data-load-hosts');
if ($('.buttonLoadHost.fembed[data-load-embed="'+zid+'"]').length) {
var finallink = await getFinalurl('https://warezcdn.com/embed/getPlay.php?id='+zid+'&sv=fembed');
if ($(this).text().includes('LEGENDADO')) {
var tiei = 'sub';
} else {
var tiei = 'dub';
}
if (finallink.includes('#caption=')) {
finallink = finallink.replace('#caption=', '?'+tiei+'#caption=');
} else {
  finallink = finallink+'?'+tiei;
}
linkii.push(finallink);

} else {
  linkii.push('notfound');
}
});
resolve(callback(linkii));
    } else {
      if ($('.buttonLoadHost.fembed').length) {

 var filmid = $('.buttonLoadHost.fembed').attr('data-load-embed');
 var finallink = await getFinalurl('https://warezcdn.com/embed/getPlay.php?id='+filmid+'&sv=fembed');
 if (finallink.includes('#caption=')) {
finallink = finallink.replace('#caption=', '?sub#caption=');
} else {
  finallink = finallink+'?sub';
}
linkii.push(finallink);
    } else {
   
 var finallink = 'notfound'; //fembed not found.
 linkii.push(finallink);
    }
     resolve(callback(linkii));
    }
 
 
  });
}
var listToloop = await filmsH('https://warezcdn.com/listing.php?type=movies'); //first get list to parse source links from later.
console.log('grabbed '+listToloop.length+' movies');
console.log('Starting source grab loop...');
var curcount = 0;
for (var i in listToloop) {
    curcount++;
  if (await exists(global.currentList, listToloop[i].warezid)) {
   // console.log("Movie source exists, won't grab again");
  } else {
      console.log('grabbing '+curcount+'/'+listToloop.length);
await filmID2(listToloop[i].link, async function(source_link) {
listToloop[i].captions = 'none';
await sleep(500);
var issz = JSON.stringify(source_link);
if (issz.includes('#caption=')) {

  var srii = issz.split('#caption=');
  var captionsurl = srii[1].split('&caption_title=Portugues"')[0];
 
  issz = issz.replace('#caption='+captionsurl+'&caption_title=Portugues', '');
  
listToloop[i].source_embeds = JSON.parse(issz);
listToloop[i].captions = captionsurl;
} else {
listToloop[i].source_embeds = source_link;

}
var imdb_dd = await grabAPIdata(listToloop[i].warezid);
listToloop[i].imdb_data = imdb_dd;
var ytTrailer = await grabYTtrailer(imdb_dd.id);
listToloop[i].yt_trailer = ytTrailer;
  global.currentList.push(listToloop[i]);
  fs.writeFileSync('films.json', JSON.stringify(global.currentList))
  if (curcount == listToloop.length) {
      console.log('Finished Grabbing Sources.');
  }
await sleep(2000); //wait 2 seconds before grabbing next source.
});

  }

}
//console.log(listToloop);

})();