let request = require('request-promise');
let cheerio = require('cheerio');
let URL = require('url');
let Promise = require('bluebird');

//Purpose
//Get available game modes available for filtering on a player's games.

let reqDefaults = {
  "User-Agent" : "HOTSBA_GAME_MODES"
};

function getGameModesAndTimespans() {
  //just get benathor's profile.. its most likely going to always exist...
  return request.get("http://www.hotslogs.com/Player/Profile?PlayerID=1")
    .then(parser);
}

function parser(body) {
  return {
    gameModes : parseGameModes(body),
    timespans : parseTimespans(body)
  };
}

function parseGameModes(body) {
  var $ = cheerio.load(body);
  var gameModes = $('#ctl00_MainContent_DropDownGameMode ul.rddlList li.rddlItem');
  return gameModes.map(function (index, ele) {
    return $(ele).text();
  }).toArray();
}

function parseTimespans(body) {
  var $ = cheerio.load(body);
  var timespans = $('#ctl00_MainContent_DropDownProfileTimeSpan_DropDown ul.rddlList li.rddlItem');
  return timespans.map(function (index, ele) {
    return $(ele).text();
  }).toArray();
}

module.exports = {
  getGameModesAndTimespans : getGameModesAndTimespans
}
