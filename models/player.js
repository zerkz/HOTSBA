let request = require('request-promise');
let cheerio = require('cheerio');
let URL = require('url');

const HOTS_LOGS = "http://www.hotslogs.com/";
request = request.defaults({
  "User-Agent" : "hotsMPH_PLAYER"
});

function getPlayerIdByName(name) {
  if (!name) {
    throw "getTopHeroesByPlayerId: invalid id supplied";
  }
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

//curried
function getTopHeroesByPlayerId(limit) {
  limit = limit ? limit : 5;
  return function(id) {
    if (!id) {
      throw "getTopHeroesByPlayerId: invalid id supplied";
    }
    return request.get(HOTS_LOGS + "Player/Profile?PlayerID=" + id)
    .then(function (body) {
      let $ = cheerio.load(body);
      let heroes = [];
      $('div#heroStatistics table.rgMasterTable tr td a[title]').slice(1,limit + 1).each( function (index, ele) {
        heroes.push($(ele).attr('title'));
      });
      return heroes;
    });
  }
}

function getTopPlayedHeroesByPlayerName(name, limit) {
  return getPlayerIdByName(name).then(getTopHeroesByPlayerId(limit));
}


module.exports = {
  getPlayerIdByName : getPlayerIdByName,
  getTopHeroesByPlayerId : getTopHeroesByPlayerId,
  getTopPlayedHeroesByPlayerName : getTopPlayedHeroesByPlayerName
};
