const { REGIONS } = require('./region');
let request = require('request-promise');
const cheerio = require('cheerio');
const URL = require('url');
const Promise = require('bluebird');

const HOTS_LOGS = 'https://www.hotslogs.com/';
const HOTS_LOGS_API = 'https://api.hotslogs.com/Public/';
const HOTS_LOGS_DEFAULT_SORT = '-level';

const remote = require('electron').remote;
let proxy;
if (remote) {
  proxy = remote.getGlobal('config').get('proxy');
}

const reqDefaults = {
  'User-Agent': 'HOTSBA_HERO_IMAGE',
};

if (proxy && proxy.host) {
  const proxyURL = URL.parse(proxy.host);
  proxyURL.port = proxy.port || 80;
  proxyURL.host = '';
  if (proxy.username && proxy.password) {
    proxyURL.auth = `${proxy.username}:${proxy.password}`;
  }
  const proxyURLFormatted = URL.format(proxyURL);
  reqDefaults.proxy = proxyURLFormatted;
}
request = request.defaults(reqDefaults);

// AGGREGATORS - these wrap data calls and combine results.
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
  .then(id => getPlayerDetails(id, params));
}

// PLAYER ID
function getPlayerId(name, region) {
  if (isBattleTag(name)) {
    return getPlayerIdByBattleTag(name, region);
  }
  return getPlayerIdByName(name);
}
function getPlayerIdByName(name) {
  if (!name) {
    throw 'getPlayerIdByName: invalid name supplied';
  }
  return request({ uri: `${HOTS_LOGS}PlayerSearch?Name=${name}`, resolveWithFullResponse: true })
  .then((res) => {
    const body = res.body;
    // handle redirect whenever query results in one record/player.
    const queryParams = URL.parse(res.req.path, true).query;
    if (queryParams.PlayerID) {
      return queryParams.PlayerID;
    }
    const $ = cheerio.load(body);
    let firstPlayer = $('table.rgMasterTable tr.rgRow').first();
    if (firstPlayer.length) {
      firstPlayer = firstPlayer.find("a[href^='/Player/Profile']");
      const firstPlayerLink = firstPlayer.attr('href');
      const playerURL = URL.parse(firstPlayer.attr('href'), true);
      return parseInt(playerURL.query.PlayerID);
    }
    throw "Player Doesn't Exist.";
  });
}

function getPlayerIdByBattleTag(battleTag, region) {
  region = region || REGIONS.US;
  return getHotsLogsPlayerDetailsByBattleTag(battleTag, region).then(
    data => parseInt(data.PlayerID)
  );
}

// PLAYER DETAILS

function getPlayerDetails(player, params) {
  if (!player) {
    throw 'getPlayerDetails - player supplied is null/undefined.';
  }
  let promise = null;
  if (isBattleTag(player)) {
    promise = getHotsLogsPlayerDetailsByBattleTag(battleTag, params).then(
      data => Promise.all([Promise.resolve(data), getPlayerProfile(data.PlayerID, params)]));
  } else {
    promise = Promise.all([getHotsLogsPlayerDetailsByPlayerId(player), getPlayerProfile(player, params)]);
  }
  return promise.spread((data, $) => {
    const result = {};
    result.rankings = getRankings(data);
    result.heroes = getTopHeroes($, params);
    result.roles = getRoles($);
    return result;
  });
}

function getHotsLogsPlayerDetailsByBattleTag(battleTag, params) {
  region = params.region || REGIONS.US;
  if (!battleTag) {
    throw 'getPlayerIdByBattleTag: battleTag not specified';
  }
  return request.get({ uri: `${HOTS_LOGS_API}Players/${region}/${battleTag}`, json: true })
  .then(
    (data) => {
      if (!data || data == 'null') {
        throw 'Invalid Battle Tag given.';
      }
      return data;
    });
}

// API call, no heroes in this one.
function getHotsLogsPlayerDetailsByPlayerId(playerId) {
  if (!playerId) {
    throw 'getHotsLogsPlayerDetailsByPlayerId: playerId not specified.';
  }
  return request.get({ uri: `${HOTS_LOGS_API}Players/${playerId}`, json: true }).then(
    (data) => {
      if (!data || data == 'null') {
        throw 'Invalid Player Id given.';
      }
      return data;
    });
}

// Method that setups up the request/flow needed to get the desired player profile
// May HTTP request multiple times due to the shitty thing that is viewstate scrapping.
function getPlayerProfile(id, params) {
  const gameMode = params.gameMode;
  const timePeriod = params.timePeriod;
  const reqOpts = {
    uri: `${HOTS_LOGS}Player/Profile?PlayerID=${id}`,
  };
  // if (params.)
  if (gameMode) {
    delete params.gameMode;
  } else if (timePeriod) {
    delete params.timePeriod;
  }
  return request.get(reqOpts).then(
    (body) => {
      const $ = cheerio.load(body);
      if (gameMode || timePeriod) {

      }
      return $;
    }
  );
}


function getTopHeroesByPlayerId(params) {
  params = params || {};
  return function (id) {
    if (!id) {
      throw 'getTopHeroesByPlayerId: invalid id supplied';
    }
    return getPlayerProfile(id, params)
    .then(
      body => getTopHeroes(body, params)
    );
  };
}

// PARSERS
function getTopHeroes($, params) {
  let limit = params.limit || 5;
  let sort = params.sort;
  limit = parseInt(limit);
  sort = sort || HOTS_LOGS_DEFAULT_SORT;
  let heroes = [];
  const $grid = $('div#heroStatistics table.rgMasterTable tr[id^="ctl00_MainContent_RadGridCharacterStatistics"]');
  const isDefaultSort = sort == HOTS_LOGS_DEFAULT_SORT;
  // if sorting by the default, scan only the number of rows requested
  // otherwise, scan all rows, then sort and limit
  $grid.slice(0, isDefaultSort ? limit : undefined).each((index, ele) => {
    const hero = {};
    const $ele = $(ele);
    const $tds = $ele.children('td');
    hero.name = $ele.find('a[title]').attr('title');
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
    heroes.sort((a, b) => direction * (a[sort] - b[sort]));
    heroes = heroes.slice(0, limit);
  }
  return heroes;
}

function getRankings(data) {
  const rankings = data.LeaderboardRankings;
  const result = {};
  for (ranking of rankings) {
    const key = ranking.GameMode;
    ranking.shortGameMode = shortenGameModeLabel(key);
    delete ranking.GameMode;
    result[key] = ranking;
  }
  return result;
}

function getRoles($) {
  const $roles = $('div.DivProfilePlayerRoleStatistic table');
  const roles = [];
  $roles.each(
    (index, element) => {
      const role = {};
      const $e = $(element);
      const $rows = $e.find('tr');
      const $type = $rows.eq(0);
      const $gamesPlayed = $rows.eq(1);
      const $winPercent = $rows.eq(2);
      role.name = $type.find('img').attr('title');
      role.gamesPlayed = parseInt($gamesPlayed.find('td').text().replace('Games Played: ', ''));
      role.winPercent = parseFloat($winPercent.find('td').text().replace('Win Percent: ', ''));
      roles.push(role);
    }
  );
  roles.sort((a, b) => b.winPercent - a.winPercent);
  return roles;
}

// SKILL or how gud we think they are..
function getHeroSkill(hero) {
  // returns a skill rating for a player x hero, normalized from 0 - 100
  // naive approach that assumes both win % and level are scaled linearly
  // and have the same relative weight.
  const winPercent = hero.winPercent / 100.0;
  const level = hero.level / 20.0;
  return (level * winPercent) * 100;
}

// UTIL
function getViewState($form) {
  getRequiredInputValue($form, '__EVENTTARGET');
  getRequiredInputValue($form, '__EVENTARGUMENT');
  const viewStateArgs = {
    __VIEWSTATE: getRequiredInputValue($form, '__VIEWSTATE'),
    __VIEWSTATEGENERATOR: getRequiredInputValue($form, '__VIEWSTATEGENERATOR'),
    __EVENTVALIDATION: getRequiredInputValue($form, '__EVENTVALIDATION'),
  };
  return viewState;
}

function getRequiredInputValue($, id) {
  const input = $.find(`#${id}`);
  if (input.length > 0) {
    return input.val();
  }
  throw `${id} input was not found.`;
}

function isBattleTag(value) {
  if (!value) {
    throw ('isBattleTag: value null/undefined.');
  }
  value = value.toString();
  // support name#id or name_id format
  value = value.replace('#', '_');
  return value.indexOf('_') > 0;
}

function shortenGameModeLabel(gameMode) {
  switch (gameMode) {
    case 'QuickMatch' : return 'QM';
    case 'HeroLeague' : return 'HL';
    case 'TeamLeague' : return 'TL';
    case 'UnrankedDraft' : return 'UD';
    default: return 'Unknown';
  }
}

module.exports = {
  getDetailsForPlayer,
  getPlayerIdByName,
  getPlayerIdByBattleTag,
  getTopHeroesByPlayerId,
  getTopHeroesForPlayer,
  HOTS_LOGS_DEFAULT_SORT,
};
