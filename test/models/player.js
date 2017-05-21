let PlayerModel = require(process.cwd() + '/app/models/player');
let GameModeModel = require(process.cwd() + '/app/models/game_mode');
let expect = require('chai').expect;

//hotslogs API requires _ instead of #.
const MY_BATTLETAG = "zerkz_1433";
const MY_PLAYER_NAME = "zerkz";
const MY_HOTSLOGS_PLAYER_ID = 2377102;

const HEROES_LIMIT = 5;

describe('PlayerModel', function() {
  describe("#getPlayerIdByName", function () {
    it("should always get my own playerId from my own player name.", function() {
      return expect(PlayerModel.getPlayerIdByName(MY_PLAYER_NAME))
        .to.eventually.equal(MY_HOTSLOGS_PLAYER_ID);
    });
    it("should always get my own playerId from my friend's player name.", function() {
      return expect(PlayerModel.getPlayerIdByName("imnasti"))
        .to.eventually.equal(1978756);
    });
  });
  describe("#getTopHeroesByPlayerId", function () {
    it("should always get 5 heroes from by my own playerId.", function() {
      return expect(PlayerModel.getTopHeroesByPlayerId(HEROES_LIMIT)(MY_HOTSLOGS_PLAYER_ID))
        .to.eventually.have.lengthOf(HEROES_LIMIT);
    });
  });
  describe("#getPlayerIdByBattleTag", function () {
    it("should always get my player ID from my own battletag..", function() {
      return expect(PlayerModel.getPlayerIdByBattleTag(MY_BATTLETAG, 1)).to.eventually.equal(parseInt(MY_HOTSLOGS_PLAYER_ID));
    });
  });
  describe("#getTopHeroesForPlayer", function () {
    it("should always get 5 heroes from by my own player name.", function() {
      return expect(PlayerModel.getTopHeroesForPlayer(MY_PLAYER_NAME, HEROES_LIMIT))
        .to.eventually.have.lengthOf(HEROES_LIMIT);
    });
    it("should always get 5 heroes from by my own player battletag.", function() {
      return expect(PlayerModel.getTopHeroesForPlayer(MY_BATTLETAG, HEROES_LIMIT))
        .to.eventually.have.lengthOf(HEROES_LIMIT);
    });
    it("should always get Tyrande as top played hero league player from my own player name."), function() {
      return expect(PlayerModel.getTopHeroesForPlayer("zerkz", { gameMode : "Hero%20League"}));
    });
  });
  describe("#getDetailsForPlayer", function () {
    it("should always get 5 heroes from my own player details", function() {
      return expect(PlayerModel.getDetailsForPlayer(MY_PLAYER_NAME, { region : 1, limit:HEROES_LIMIT}))
        .to.eventually.have.property('heroes').with.lengthOf(HEROES_LIMIT);
    });
  });

});
