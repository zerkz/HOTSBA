let GameModeModel = require(process.cwd() + '/app/models/game_mode');
let expect = require('chai').expect;

describe('GameModeModel', function() {
  describe("#getGameModesAndTimespans", function () {
    it("should always get multiple game modes", function() {
      return GameModeModel.getGameModesAndTimespans().then((modes) => expect(modes.gameModes).to.have.length.above(3));
    });
    it("should always get multiple timespans", function() {
      return GameModeModel.getGameModesAndTimespans().then((modes) => expect(modes.timespans).to.have.length.above(3));
    });
  });
});
