const request = require('request-promise');
const cheerio = require('cheerio');
const URL = require('url');
const Promise = require('bluebird');

// Purpose
// Get available game modes available for filtering on a player's games.

const reqDefaults = {
  'User-Agent': 'HOTSBA_GAME_MODES',
};

const TIMESPAN_PARTIAL_ID_SELECTOR = "div[id*='ProfileTimeSpan']";
const GAMEMODE_PARTIAL_ID_SELECTOR = "div[id*='DropDownGameMode']";

function getGameModesAndTimespans() {
  // just get benathor's profile.. its most likely going to always exist...
  return request.get('https://www.hotslogs.com/Player/Profile?PlayerID=1')
    .then(parser);
}

function parser(body) {
  const $ = cheerio.load(body);
  return {
    gameModes: parseGameModes($),
    timespans: parseTimespans($),
    gameModeInputKey: parseGameModeInputKey($),
    timeSpanInputKey: parseTimeSpanInputKey($),
  };
}

function parseGameModes($) {
  const gameModes = $(`${GAMEMODE_PARTIAL_ID_SELECTOR} ul.rddlList li.rddlItem`);
  return gameModes.map((index, ele) => $(ele).text()).toArray();
}

function parseTimespans($) {
  const timespans = $(`${TIMESPAN_PARTIAL_ID_SELECTOR} ul.rddlList li.rddlItem`);
  return timespans.map((index, ele) => $(ele).text()).toArray();
}

function parseGameModeInputKey($) {
  const gameModeDropdown = $(GAMEMODE_PARTIAL_ID_SELECTOR);
  return `${gameModeDropdown.attr('id')}_ClientState`;
}

function parseTimeSpanInputKey($) {
  const timeSpanDropdown = $(TIMESPAN_PARTIAL_ID_SELECTOR);
  return `${timeSpanDropdown.attr('id')}_ClientState`;
}

module.exports = {
  getGameModesAndTimespans,
};
