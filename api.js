let playerModel = require('./models/player');
let express = require('express');
var app = express();


app.get('/player/:name/heroes', function (req, res) {
  let name = req.params.name || "";
  let limit = req.query.limit || 5;
  //default region to US if not supplied.
  let region = req.query.region || 1;
  playerModel.getTopPlayedHeroesByPlayerNameOrBattleTag(name, limit, region)
  .then(function (heroes) {
    res.json(heroes);
  });
});

app.listen(process.env.PORT || 8080);
console.log('running api');
