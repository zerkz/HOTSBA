let playerModel = require('./models/player');
let express = require('express');
var app = express();


app.get('/player/:name/heroes', function (req, res) {
  let name = req.params.name;
  let limit = req.query.limit;
  playerModel.getTopPlayedHeroesByPlayerName(name, limit)
  .then(function (heroes) {
    res.json(heroes);
  });
});

app.listen(process.env.PORT || 8080);
