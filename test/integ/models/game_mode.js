let GameModeModel = require('../../src/main/models/game_mode');

describe('GameModeModel', function() {
  let gameModesAndTimespans = null;
  before(function(done) {
    GameModeModel.getGameModesAndTimespans().then(function (modes) {
      gameModesAndTimespans =  modes;
      done();
    });
  });

  describe("#getGameModesAndTimespans", function () {
    it("should always get multiple game modes", function() {
      expect(gameModesAndTimespans.gameModes).to.have.length.above(3);
    });
    it("should always get multiple timespans", function() {
      expect(gameModesAndTimespans.timespans).to.have.length.above(3);
    });
    it("should always have the first game mode resembling 'all modes'", function () {
      expect(gameModesAndTimespans.gameModes[0].toLowerCase()).to.include("all");
    });
    it("should always have a gamemode input key", function () {
      expect(gameModesAndTimespans.gameModeInputKey).to.exist.and.not.be.empty;
    });
    it("should always have a timespan input key", function () {
      expect(gameModesAndTimespans.timeSpanInputKey).to.exist.and.not.be.empty;
    });
  });
});
