let request = require('request-promise');
let cheerio = require('cheerio');
let URL = require('url');

const HOTS_LOGS = "http://www.hotslogs.com/";

function getPlayerIdByName(name) {
  return request.get(HOTS_LOGS + "PlayerSearch?Name=" + name)
  .then(function (body) {
    let $ = cheerio.load(body);
    let firstPlayer = $('table.rgMasterTable tr.rgRow').first();
    if (firstPlayer.length) {
      firstPlayer = firstPlayer.find("a[href^='/Player/Profile']");
      let playerURL = URL.parse(firstPlayer.attr("href"), true);
      return playerURL.query.PlayerID;
    } else {
      throw "Player Doesn't Exist.";
    }
  });
}

function getTopPlayedHeroesOfPlayer(name, topHeroes) {
    topHeroes = topHeroes ? topHeroes : 5;
}
