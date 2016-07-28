let RegionModel = require('./region');
let request = require('request-promise');
let cheerio = require('cheerio');
let URL = require('url');

const HOTS_LOGS = "http://www.hotslogs.com/";
const HOTS_LOGS_API = "https://api.hotslogs.com/Public/";
const HOTS_LOGS_DEFAULT_SORT = '-level';

request = request.defaults({
  "User-Agent" : "HOTSMPH_PLAYER"
});

// PlayerId
function getPlayerIdByName(name) {
  if (!name) {
    throw "getPlayerIdByName: invalid name supplied";
  }

  return request({uri : HOTS_LOGS + "PlayerSearch?Name=" + name, resolveWithFullResponse : true})
  .then(function (res) {
    let body = res.body;
    //handle redirect whenever query results in one record/player.
    let queryParams = URL.parse(res.req.path, true).query;
    if (queryParams.PlayerID) {
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
  region = region || RegionModel.REGIONS.US;
  if (!battleTag) {
    throw "getPlayerIdByBattleTag: battleTag not specified";
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

function getHeroSkill(hero) {
  // returns a skill rating for a player x hero, normalized from 0 - 100

  // naive approach that assumes both win % and level are scaled linearly
  // and have the same relative weight.
  let winPercent = hero.winPercent / 100.0;
  let level = hero.level / 20.0;
  return (level * winPercent) * 100;
}

// Heroes by Player

// curried
function getTopHeroesByPlayerId(limit, sort) {
  limit = parseInt(limit) || 5;
  sort = sort || HOTS_LOGS_DEFAULT_SORT;
  return function(id) {
    if (!id) {
      throw "getTopHeroesByPlayerId: invalid id supplied";
    }
    return request.get(HOTS_LOGS + "Player/Profile?PlayerID=" + id)
    .then(function(body) {
      let $ = cheerio.load(body);
      let heroes = [];
      let $grid = $('div#heroStatistics table.rgMasterTable tr[id^="ctl00_MainContent_RadGridCharacterStatistics"]');
      let isDefaultSort = sort == HOTS_LOGS_DEFAULT_SORT;
      // if sorting by the default, scan only the number of rows requested
      // otherwise, scan all rows, then sort and limit
      $grid.slice(1, isDefaultSort ? limit + 1 : undefined).each( function (index, ele) {
        let hero = {};
        let $ele = $(ele);
        let $tds = $ele.children('td');;
        hero.name = $ele.find("a[title]").attr('title');
        hero.level = parseInt($tds.eq(3).text());
        hero.gamesPlayed = parseInt($tds.eq(4).text());
        hero.winPercent = parseFloat($tds.eq(6).text()) || null;
        hero.skill = getHeroSkill(hero);
        heroes.push(hero);
      });
      if (!isDefaultSort) {
        let direction = 1; // ascending
        if (sort.startsWith('-')) {
          // descending
          sort = sort.substring(1);
          direction = -1;
        }
        heroes.sort((a, b) => {
          return direction * (a[sort] - b[sort]);
        });
        heroes = heroes.slice(0, limit);
      }
      return heroes;
    });
  }
}

function getTopPlayedHeroesByPlayerNameOrBattleTag(name, params) {
  let playerId = null;
  // support name#id or name_id format
  name = name.replace('#', '_');
  if (name.indexOf('_') > 0) {
    playerId = getPlayerIdByBattleTag(name, params.region);
  } else {  
    playerId = getPlayerIdByName(name);
  }
  return playerId.then(getTopHeroesByPlayerId(params.limit, params.sort));
}


module.exports = {
  getPlayerIdByName : getPlayerIdByName,
  getPlayerIdByBattleTag : getPlayerIdByBattleTag,
  getTopHeroesByPlayerId : getTopHeroesByPlayerId,
  getTopPlayedHeroesByPlayerNameOrBattleTag : getTopPlayedHeroesByPlayerNameOrBattleTag,
  HOTS_LOGS_DEFAULT_SORT: HOTS_LOGS_DEFAULT_SORT
};
