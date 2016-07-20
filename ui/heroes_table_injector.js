let playerModel = require('./models/player.js');

function upsertHeroesTable(name, element) {
  playerModel.getTopPlayedHeroesByPlayerNameOrBattleTag(name, 5)
    .then(function (heroes) {
      console.log(heroes);
    });
}
