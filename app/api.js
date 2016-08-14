const PlayerModel = require('./models/player');
const RegionModel = require('./models/region');
const express = require('express');

const app = express();

app.get('/player/:name/heroes', function(req, res) {
  let defaultParams = {
    limit: 5,
    region: RegionModel.REGIONS.US,
    sort: PlayerModel.HOTS_LOGS_DEFAULT_SORT
  };
  let name = req.params.name || '';
  let params = Object.assign({}, defaultParams, req.query);
  PlayerModel.getTopPlayedHeroesByPlayerNameOrBattleTag(name, params)
  .then(function(heroes) {
    res.json(heroes);
  });
});

app.get('/player/:battleTag/', function(req, res) {
  let defaultParams = {
    region: RegionModel.REGIONS.US
  };
  let battleTag = req.params.battleTag|| '';
  let params = Object.assign({}, defaultParams, req.query);
  PlayerModel.getPlayerDetailsByBattleTag(battleTag, params).then(
    (data) => {
      res.json(data);
    }
  )
});

app.listen(process.env.PORT || 8080);
console.log('running api');
