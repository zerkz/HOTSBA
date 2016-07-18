let request = require('request-promise');
let cheerio = require('cheerio');
let URL = require('url');

const HOTS_LOGS = "http://www.hotslogs.com/";
const HOTS_LOGS_API = "https://api.hotslogs.com/Public/"
request = request.defaults({
  "User-Agent" : "hotsMPH_PLAYER"
});

//PlayerId
function getPlayerIdByName(name) {
  if (!name) {
    throw "getPlayerIdByName: invalid id supplied";
  }

  return request( {uri : HOTS_LOGS + "PlayerSearch?Name=" + name, resolveWithFullResponse : true})
  .then(function (res) {
    let body = res.body;
    //handle redirect whenever query results in one record/player.
    let queryParams = URL.parse(res.req.path, true).query;
    if(queryParams.PlayerID) {
      return queryParams.PlayerID;
    }
    let $ = cheerio.load(body);
    let firstPlayer = $('table.rgMasterTable tr.rgRow').first();
    if (firstPlayer.length) {
      firstPlayer = firstPlayer.find("a[href^='/Player/Profile']");
      let firstPlayerLink = firstPlayer.attr("href");
      let playerURL = URL.parse(firstPlayer.attr("href"), true);
      return parseInt(playerURL.query.PlayerID);
    } else {
      throw "Player Doesn't Exist.";
    }
  });
}

function getPlayerIdByBattleTag(battleTag, region) {
  //default to US
  region = region || 1;
  if (!battleTag) {
    throw "getPlayerIdByBattleTag: empty battleTag supplied";
  }
  return request.get({ uri : HOTS_LOGS_API + "Players/" + region + "/" + battleTag, json : true})
  .then(function (json) {
    if (!json || json == "null") {
      throw "Invalid Battle Tag given.";
    }

    let playerId = parseInt(json.PlayerID);

    return playerId;
  });
}

//Heroes by Player

//curried
function getTopHeroesByPlayerId(limit) {
  limit = limit;
  if (!limit) {
    throw "No Limit specified.";
  }
  return function(id) {
    if (!id) {
      throw "getTopHeroesByPlayerId: invalid id supplied";
    }
    return request.get(HOTS_LOGS + "Player/Profile?PlayerID=" + id)
    .then(function (body) {
      let $ = cheerio.load(body);
      let heroes = [];
      $('div#heroStatistics table.rgMasterTable tr[id^="ctl00_MainContent_RadGridCharacterStatistics"]').slice(1,limit + 1).each( function (index, ele) {
        let hero = {};
        let $ele = $(ele);
        let $tds = $ele.children('td');;
        hero.name = $ele.find("a[title]").attr('title');
        hero.gamesPlayed = $tds.eq(4).text();
        hero.winPercent = $tds.eq(6).text();
        heroes.push(hero);
      });
      return heroes;
    });
  }
}

function getTopPlayedHeroesByPlayerNameOrBattleTag(name, limit) {
  if (name.indexOf('_') > 0) {
    return getPlayerIdByBattleTag(name).then(getTopHeroesByPlayerId(limit));
  } else {
    return getPlayerIdByName(name).then(getTopHeroesByPlayerId(limit));
  }
}


module.exports = {
  getPlayerIdByName : getPlayerIdByName,
  getPlayerIdByBattleTag : getPlayerIdByBattleTag,
  getTopHeroesByPlayerId : getTopHeroesByPlayerId,
  getTopPlayedHeroesByPlayerNameOrBattleTag : getTopPlayedHeroesByPlayerNameOrBattleTag
};
