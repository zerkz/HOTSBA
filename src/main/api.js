const PlayerModel = require('../models/player');
const RegionModel = require('../models/region');
const express = require('express');

const app = express();

app.get('/player/:name/heroes', (req, res) => {
  const defaultParams = {
    limit: 5,
    region: RegionModel.REGIONS.US,
    sort: PlayerModel.HOTS_LOGS_DEFAULT_SORT,
  };
  const name = req.params.name || '';
  const params = Object.assign({}, defaultParams, req.query);
  PlayerModel.getTopPlayedHeroesByPlayerNameOrBattleTag(name, params)
  .then((heroes) => {
    res.json(heroes);
  });
});

app.get('/player/:battleTag/', (req, res) => {
  const defaultParams = {
    region: RegionModel.REGIONS.US,
  };
  const battleTag = req.params.battleTag || '';
  const params = Object.assign({}, defaultParams, req.query);
  PlayerModel.getPlayerDetailsByBattleTag(battleTag, params).then(
    (data) => {
      res.json(data);
    },
  );
});

app.listen(process.env.PORT || 8080);
