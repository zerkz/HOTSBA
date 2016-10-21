const {REGIONS} = require('./region');
let request = require('request-promise');
let cheerio = require('cheerio');
let URL = require('url');
let Promise = require('bluebird');

const HOTS_LOGS = "http://www.hotslogs.com/";
const HOTS_LOGS_API = "https://api.hotslogs.com/Public/";
const HOTS_LOGS_DEFAULT_SORT = '-level';

let proxy = require('electron').remote.getGlobal("config").get("proxy");;
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
  console.log(proxyURL);
  let proxyURLFormatted = URL.format(proxyURL);
  reqDefaults.proxy = proxyURLFormatted;
}
request = request.defaults(reqDefaults);

//AGGREGATORS - these wrap data calls and combine results.
function getTopHeroesForPlayer(player, params) {
  params = params || {};
  let playerId = null;
  if (isBattleTag(player)) {
    playerId = getPlayerIdByBattleTag(player.replace('#', '_'), params.region);
  } else {
    playerId = getPlayerIdByName(player);
  }
  return playerId.then(getTopHeroesByPlayerId(params.limit, params.sort));
}

function getDetailsForPlayer(player, params) {
  params = params || {};
  return getPlayerId(player, params.region || REGIONS.US)
  .then(function (id) {
    return getPlayerDetails(id,params);
  });
}

// PLAYER ID

function getPlayerId(name, region) {
  if (isBattleTag(name)) {
    return getPlayerIdByBattleTag(name, region);
  } else {
    return getPlayerIdByName(name);
  }
}
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
  region = region || REGIONS.US;
  return getHotsLogsPlayerDetailsByBattleTag(battleTag, region).then(
    (data) => {
      return parseInt(data.PlayerID);
    }
  );
}

//PLAYER DETAILS

function getPlayerDetails(player, params) {
  if (!player) {
    throw 'getPlayerDetails - player supplied is null/undefined.';
  }
  let promise = null;
  if (isBattleTag(player)) {
    promise = getHotsLogsPlayerDetailsByBattleTag(battleTag, params.region).then(
      (data) => {
        return Promise.all([Promise.resolve(data), getPlayerProfile(data.PlayerID)]);
      });
  } else {
    promise = Promise.all([getHotsLogsPlayerDetailsByPlayerId(player),getPlayerProfile(player)]);
  }
  return promise.spread((data,$) => {
    let result = {};
    result.rankings = getRankings(data);
    result.heroes = getTopHeroes($, params.limit, params.sort);
    result.roles = getRoles($);
    return result;
  })
}

function getHotsLogsPlayerDetailsByBattleTag(battleTag, region) {
  region = region || REGIONS.US;
  if (!battleTag) {
    throw "getPlayerIdByBattleTag: battleTag not specified";
  }
  return request.get({ uri : HOTS_LOGS_API + "Players/" + region + "/" + battleTag, json : true})
  .then(
    (data) => {
    if (!data|| data == "null") {
      throw "Invalid Battle Tag given.";
    }
    return data;
  });
}

function getHotsLogsPlayerDetailsByPlayerId(playerId) {
  if (!playerId) {
    throw "getHotsLogsPlayerDetailsByPlayerId: playerId not specified.";
  }
  return request.get({ uri : HOTS_LOGS_API + "Players/" + playerId, json : true}).then(
    (data) => {
    if (!data|| data == "null") {
      throw "Invalid Player Id given.";
    }
    return data;
  });
}

function getPlayerProfile(id) {
  return request.get(HOTS_LOGS + "Player/Profile?PlayerID=" + id).then(
    (body) => { return cheerio.load(body); }
  );
}

function getTopHeroesByPlayerId(limit, sort) {
  return function(id) {
    if (!id) {
      throw "getTopHeroesByPlayerId: invalid id supplied";
    }
    return getPlayerProfile(id)
    .then(
      (body) => {
        return getTopHeroes(body, limit, sort);
      }
    );
  }
}


// PARSERS
function getTopHeroes($, limit, sort) {
  limit = parseInt(limit) || 5;
  sort = sort || HOTS_LOGS_DEFAULT_SORT;
  let heroes = [];
  let $grid = $('div#heroStatistics table.rgMasterTable tr[id^="ctl00_MainContent_RadGridCharacterStatistics"]');
  let isDefaultSort = sort == HOTS_LOGS_DEFAULT_SORT;
  // if sorting by the default, scan only the number of rows requested
  // otherwise, scan all rows, then sort and limit
  $grid.slice(0, isDefaultSort ? limit : undefined).each( function (index, ele) {
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
}

function getRankings(data) {
  let rankings = data.LeaderboardRankings;
  let result = {};
  for (ranking of rankings) {
    let key = ranking.GameMode;
    ranking.shortGameMode = shortenGameModeLabel(key);
    delete ranking.GameMode;
    result[key] = ranking;
  }
  return result;
}

function getRoles($) {
  let $roles = $('div.DivProfilePlayerRoleStatistic table');
  let roles = [];
  $roles.each(
    (index, element) => {
      let role = {};
      let $e = $(element);
      let $rows = $e.find('tr');
      let $type = $rows.eq(0);
      let $gamesPlayed = $rows.eq(1);
      let $winPercent = $rows.eq(2);
      role.name = $type.find('img').attr('title');
      role.gamesPlayed = parseInt($gamesPlayed.find('td').text().replace('Games Played: ', ''));
      role.winPercent = parseFloat($winPercent.find('td').text().replace('Win Percent: ', ''));
      roles.push(role);
    }
  );
  roles.sort((a, b) => {
    return b.winPercent - a.winPercent;
  });
  return roles;
}

// SKILL or how gud we think they are..
function getHeroSkill(hero) {
  // returns a skill rating for a player x hero, normalized from 0 - 100

  // naive approach that assumes both win % and level are scaled linearly
  // and have the same relative weight.
  let winPercent = hero.winPercent / 100.0;
  let level = hero.level / 20.0;
  return (level * winPercent) * 100;
}

//UTIL

function isBattleTag(value) {
  if (!value) {
    throw ('isBattleTag: value null/undefined.')
  }
  value = value.toString();
  // support name#id or name_id format
  value = value.replace('#', '_');
  return value.indexOf('_') > 0;
}

function shortenGameModeLabel(gameMode) {
  switch(gameMode) {
    case "QuickMatch" : return "QM";
    case "HeroLeague" : return "HL";
    case "TeamLeague" : return "TL";
    case "UnrankedDraft" : return "UD";
    default: return "Unknown";
  }
}

module.exports = {
  getDetailsForPlayer: getDetailsForPlayer,
  getPlayerIdByName : getPlayerIdByName,
  getPlayerIdByBattleTag : getPlayerIdByBattleTag,
  getTopHeroesByPlayerId : getTopHeroesByPlayerId,
  getTopHeroesForPlayer : getTopHeroesForPlayer,
  HOTS_LOGS_DEFAULT_SORT: HOTS_LOGS_DEFAULT_SORT
};
