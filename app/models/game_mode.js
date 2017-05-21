let request = require('request-promise');
let cheerio = require('cheerio');
let URL = require('url');
let Promise = require('bluebird');

//Purpose
//Get available game modes available for filtering on a player's games.

const reqDefaults = {
  "User-Agent" : "HOTSBA_GAME_MODES"
};

const TIMESPAN_PARTIAL_ID_SELECTOR = "div[id*='ProfileTimeSpan']";
const GAMEMODE_PARTIAL_ID_SELECTOR = "div[id*='DropDownGameMode']";

function getGameModesAndTimespans() {
  //just get benathor's profile.. its most likely going to always exist...
  return request.get("https://www.hotslogs.com/Player/Profile?PlayerID=1")
    .then(parser);
}

function parser(body) {
  var $ = cheerio.load(body);
  return {
    gameModes : parseGameModes($),
    timespans : parseTimespans($),
    gameModeInputKey : parseGameModeInputKey($),
    timeSpanInputKey : parseTimeSpanInputKey($)
  };
}

function parseGameModes($) {
  var gameModes = $(GAMEMODE_PARTIAL_ID_SELECTOR + ' ul.rddlList li.rddlItem');
  return gameModes.map(function (index, ele) {
    return $(ele).text();
  }).toArray();
}

function parseTimespans($) {
  var timespans = $(TIMESPAN_PARTIAL_ID_SELECTOR + ' ul.rddlList li.rddlItem');
  return timespans.map(function (index, ele) {
    return $(ele).text();
  }).toArray();
}

function parseGameModeInputKey($) {
  var gameModeDropdown = $(GAMEMODE_PARTIAL_ID_SELECTOR);
  return gameModeDropdown.attr('id') + "_ClientState";
}

function parseTimeSpanInputKey($) {
  var timeSpanDropdown = $(TIMESPAN_PARTIAL_ID_SELECTOR);
  return timeSpanDropdown.attr('id') + "_ClientState";
}

module.exports = {
  getGameModesAndTimespans : getGameModesAndTimespans
}
