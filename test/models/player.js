let playerModel = require('../../models/player');
let regionModel = require('../../models/region');
let expect = require('chai').expect;

//hotslogs API requires _ instead of #.
const MY_BATTLETAG = "zerkz_1433";
const MY_PLAYER_NAME = "zerkz";
const MY_HOTSLOGS_PLAYER_ID = 2377102;

const HEROES_LIMIT = 5;
const QUERY_PARAMS = {
  limit: HEROES_LIMIT,
  sort: playerModel.HOTS_LOGS_DEFAULT_SORT,
  region: regionModel.REGIONS.US
};

describe('PlayerModel', function() {
  describe("#getPlayerIdByName", function () {
    it("should always get my own playerId from my own player name.", function() {
      return expect(playerModel.getPlayerIdByName(MY_PLAYER_NAME))
        .to.eventually.equal(MY_HOTSLOGS_PLAYER_ID);
    });
    it("should always get my friend's playerId from my friend's player name.", function() {
      return expect(playerModel.getPlayerIdByName("imnasti"))
        .to.eventually.equal('1978756');
    });
  });
  describe("#getTopHeroesByPlayerId", function () {
    it("should always get 5 heroes from my own playerId.", function() {
      return expect(playerModel.getTopHeroesByPlayerId(QUERY_PARAMS.limit, QUERY_PARAMS.sort)(MY_HOTSLOGS_PLAYER_ID))
        .to.eventually.have.length(HEROES_LIMIT);
    });
  });
  describe("#getPlayerIdByBattleTag", function () {
    it("should always get my player ID from my own battletag.", function() {
      return expect(playerModel.getPlayerIdByBattleTag(MY_BATTLETAG, regionModel.REGIONS.US)).to.eventually.equal(parseInt(MY_HOTSLOGS_PLAYER_ID));
    });
  });
  describe("#getTopPlayedHeroesByPlayerNameOrBattleTag", function () {
    it("should always get 5 heroes from my own player name.", function() {
      return expect(playerModel.getTopPlayedHeroesByPlayerNameOrBattleTag(MY_PLAYER_NAME, QUERY_PARAMS))
        .to.eventually.have.length(HEROES_LIMIT);
    });
    it("should always get 5 heroes from my own player battletag.", function() {
      return expect(playerModel.getTopPlayedHeroesByPlayerNameOrBattleTag(MY_BATTLETAG, QUERY_PARAMS))
        .to.eventually.have.length(HEROES_LIMIT);
    });
  });
});
