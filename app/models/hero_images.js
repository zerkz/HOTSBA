//used to retrieving hero images from HOTS LOGS

let request = require('request-promise');
//we use this later on for file stream piping,
// as request-promise as high mem footprint for this.
let ogRequest = require('request');
let cheerio = require('cheerio');
let fs = require('fs-promise');
let URL = require('url');
let Promise = require('bluebird');

const remote = require('electron').remote;
let proxy;
if(remote) {
  proxy = remote.getGlobal("config").get("proxy");
}
let reqDefaults = {
  "User-Agent" : "HOTSBA_HERO_IMAGE"
};

if (proxy && proxy.host) {
  let proxyURL = URL.parse(proxy.host);
  proxyURL.port = proxy.port || 80;
  proxyURL.host = "";
  if (proxy.username && proxy.password) {
    proxyURL.auth = proxy.username + ":" + proxy.password;
  }
  let proxyURLFormatted = URL.format(proxyURL);
  reqDefaults.proxy = proxyURLFormatted;
}
request = request.defaults(reqDefaults);



const HOTS_LOGS_API_OPTS = {
  uri : "https://api.hotslogs.com/Public/Data/Heroes",
  json : true
};

//in order to not pound HOTS LOGS server,
//lets be a gentleapi and get the cloudfront hostname.
function getCloudFrontHost() {
  //about page is pretty static.
  return request.get("http://www.hotslogs.com/Info/About")
    .then(function(body) {
      let hotsLogsLogo = cheerio.load(body)(".navbar-header img[alt='HOTS Logs']");
      if (hotsLogsLogo.length == 0) {
        throw "Couldn't find logo to grab cloudfront hostname >:(";
      }
      return URL.parse(hotsLogsLogo.attr('src'), false, true).hostname;
    })
}

function getHeroesJSONFromAPI() {
  return request(HOTS_LOGS_API_OPTS);
};

function readLocalImages() {
  return fs.readdir(__dirname + "/../ui/images/heroes");
};

//bread and butter.
function checkIfHeroesNeedDownloaded() {
  return Promise.join(getCloudFrontHost(), getHeroesJSONFromAPI(), readLocalImages(),
  function (cloudFrontHost, heroesJSON, localImageFiles) {
    localImageFiles = localImageFiles.filter(image => (image.indexOf(".png") >= 0));
    //we have to subtract 1 because of .gitignore...
    if (localImageFiles.length == 0) {
      //fresh run, download all the things!
      let paths = getHeroImagePaths(heroesJSON, cloudFrontHost);
      return downloadAndDumpImages(paths).return(generateResult("All Hero Images downloaded!"));
    } else if (heroesJSON.length == localImageFiles.length) {
      //we're good to go!
      return Promise.resolve(generateResult("No New Heroes!"));
    } else if (heroesJSON.length > localImageFiles.length) {
        //new heroes released since last run? lets filter them out and grab the images
        let newHeroesJSON = heroesJSON.filter(function (hero) {
          return !localImageFiles.includes(hero.ImageURL + ".png");
        });
        return downloadAndDumpImages(getHeroImagePaths(newHeroesJSON, cloudFrontHost))
          .return(generateResult("New Heroes Added: " + newHeroesJSON.map(getHeroName).join(', ')));
    }

    function generateResult(message) {
      return [message, heroesJSON];
    }
  });
}

function getHeroName(heroJSON) {
  return heroJSON.PrimaryName;
}

function getHeroImagePaths(heroesJSON, cloudFrontHost) {
  return heroesJSON.map(function (hero) {
    return constructImageURL(hero.ImageURL, cloudFrontHost);
  });
}

function constructImageURL(imageName, cloudFrontHost) {
  let uriEncodedName = encodeURIComponent(imageName);
  let imagePath = "http://" + cloudFrontHost + "/Images/Heroes/Portraits/"  + uriEncodedName + ".png";
  return imagePath;
}

function downloadAndDumpImages(imagePaths) {
  let imagePromises = imagePaths.map(function (path) {
    //we downloading an image, no need to encode.
    let opts = {
      uri : path,
      encoding : null
    };
    return request(opts).then(function(body) {
      let fileName = parseImageFileNameFromPath(path);
      return fs.writeFile(__dirname + "/../ui/images/heroes/" + fileName, body).then(function () {
      });
    });
  });
  return Promise.all(imagePromises);
}

function parseImageFileNameFromPath (path) {
  if (!path) {
    throw "Invalid image path supplied";
  }
  return path.substring(path.lastIndexOf('/') + 1, path.length);
}

module.exports = {
  checkIfHeroesNeedDownloaded : checkIfHeroesNeedDownloaded,
  getHeroImagePaths : getHeroImagePaths,
  parseImageFileNameFromPath : parseImageFileNameFromPath
}
