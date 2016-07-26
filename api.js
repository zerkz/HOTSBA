let playerModel = require('./models/player');
let regionModel = require('./models/region');
let express = require('express');
var app = express();

app.get('/player/:name/heroes', function(req, res) {
  let defaultParams = {
    limit: 5,
    region: regionModel.REGIONS.US,
    sort: playerModel.HOTS_LOGS_DEFAULT_SORT
  };
  let name = req.params.name || '';
  let params = Object.assign({}, defaultParams, req.query);
  playerModel.getTopPlayedHeroesByPlayerNameOrBattleTag(name, params)
  .then(function(heroes) {
    res.json(heroes);
  });
});

app.listen(process.env.PORT || 8080);
console.log('running api');
