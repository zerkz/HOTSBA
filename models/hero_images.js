//used to retrieving hero images from HOTS LOGS
let request = require('request-promise');
let cheerio = require('cheerio');
let fs = require('fs-promise');
let URL = require('url');
let Promise = require('bluebird');
let async = require('async');
request = request.defaults({
  "User-Agent" : "HOTSMPH_HERO_IMAGE"
});

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
      if (hotsLogsLogo.length) {
        throw "Couldn't find logo to grab cloudfront hostname >:("
      }
      return URL.parse(hotsLogsLogo.attr('src')).hostname;
    })
}

function checkIfImagesNeedDownloaded() {
  return async.parallel({
    cloudFrontHost : getCloudFrontHost
    heroesJSON : function {
      return request(HOTS_LOGS_API_OPTS);
  }, localImageFiles : function  {
      return fs.readdir("../ui/images/heroes");
  }}, function (err, results) {
    let heroesJSON = results.heroesJSON.toArray();
    let localImageFiles = results.localImagesFiles;
    let cloudFrontHost = results.cloudFrontHost;
    if (heroesJSON.length == localImageFiles.length) {
      //we're good to go!
      return Promise.resolve("No New Heroes!");
    } else {
      if(heroesJSON.length > localImageFiles.length) {
        //new heroes released since last run? lets filter them out and grab the images
        let newHeroesJSON = heroesJSON.filter(function (hero) {
          return !localImagesFiles.includes(hero.imageURL + ".png");
        });
        return downloadAndDumpImages(getHeroImagePaths(newHeroesJSON, cloudFrontHost))
          .return("New Heroes Added: " + newHeroesJSON.map(getHeroName).join(', '));
      } else {
        //fresh run, download all the things!
        let paths = getHeroImagePaths(heroesJSON, cloudFrontHost);
        return downloadAndDumpImages(paths).then(updateLocalHeroesJSON)
          .return("All Hero Images downloaded!");
      }
    }
  });
}

function getHeroName(heroJSON) {
  return heroJSON.PrimaryName;
}

function getHeroImagePaths(heroesJSON, cloudFrontHost) {
  return heroesJSON.map(function (hero) {
    return constructImageURL(hero.imageURL, cloudFrontHost);
  });
}

function constructImageURL(imageName, cloudFrontHost) {
  let imagePath = "http://" + cloudFrontHost + "/Images/"  + imageName + ".png";
  return imagePath;
}

function downloadAndDumpImages(imagePaths) {
  imagePaths.forEach(function (path) {
    request(path).then(function(body) {
      let fileName = parseImageFileNameFromPath(path)
      fs.writeFile("../ui/images/heroes/" + fileName, body).then(function () {
        console.log('file ' + fileName + " written");
      });
    });
  });
}

function updateLocalHeroesJSON(heroesJSON) {
  return fs.writeFile(heroesJSON, '../ui/js/heroes.json');
}

module.exports = {
  getHeroImagePaths : getHeroImagePaths,
  convertToFullImage : convertToFullImage,
  parseImageFileNameFromPath : parseImageFileNameFromPath
}
