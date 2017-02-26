let GameModeModel = require(process.cwd() + '/app/models/game_mode');
let expect = require('chai').expect;



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
  });
});
