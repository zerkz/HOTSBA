let playerModel = require('../../models/player');
let expect = require('chai').expect;

describe('PlayerModel', function() {
  describe("#getPlayerIdByName", function () {
    it("should always get my own playerId from my own player name.", function() {
      return expect(playerModel.getPlayerIdByName("zerkz")).to.eventually.equal("2377102");
    });
  });
  describe("#getTopHeroesByPlayerId", function () {
    it("should always get 5 heroes from by my own playerId.", function() {
      return expect(playerModel.getTopHeroesByPlayerId(5)(2377102)).to.eventually.have.length(5);
    });
  });
  describe("#getTopPlayedHeroesByPlayerName", function () {
    it("should always get 5 heroes from by my own player name.", function() {
      return expect(playerModel.getTopPlayedHeroesByPlayerName("zerkz", 5)).to.eventually.have.length(5);
    });
  });
});
