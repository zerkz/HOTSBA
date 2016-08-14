//library of functions pertaining to actual hotsMPH functionaility.
let PlayerModel = nodeRequire(__dirname + '/models/player.js');
let HeroImages = nodeRequire(__dirname + '/models/hero_images.js');
let heroesImageMap;
const numHeroes = 5;
const playerDetailsClass = "player-details-table";

const {app, shell} = nodeRequire('electron').remote;
$('#versionHeader').text("v" + app.getVersion());
const partial = { "hero_input_container" : templates["hero_input_container"] };
$('#enemiesContainer').append(templates["enemy_team_container"].render({
    "header-text-class" : "red",
    "playerDetailsClass" : playerDetailsClass
  },partial));

$('#alliesContainer').append(templates["my_team_container"].render({
  "header-text-class" : "blue",
  "playerDetailsClass" : playerDetailsClass
}, partial));

//click listeners..
$('#clearButton').click(clearAllHeroCollections);
$('#enemiesTab').click(showEnemiesTabSection);
$('#alliesTab').click(showAlliesTabSection);
newHeroesCheck();
//open links externally by default
$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});


function newHeroesCheck() {
  Materialize.toast('Checking for new heroes..', 4000, 'rounded');
  HeroImages.checkIfHeroesNeedDownloaded().spread(function (message, updatedHeroesJSON) {
      heroesImageMap = updatedHeroesJSON;
      Materialize.toast(message, 4000, 'rounded');
    }).catch(function (error) {
      Materialize.toast(error + ". Please restart the HOTSBA",8000,'rounded');
    });
}

function clearAllHeroCollections() {
  $('.' + playerDetailsClass).replaceWith($('<div class="' + playerDetailsClass + '"></div>'));
  $('.player-text-input').val('');
}

function showEnemiesTabSection() {
  $("#enemiesTab").addClass('active');
  $("#alliesTab").removeClass('active');
  $('#enemiesContainer').removeClass('hide');
  $('#alliesContainer').addClass('hide');
}

function showAlliesTabSection() {
  $("#alliesTab").addClass('active');
  $("#enemiesTab").removeClass('active');
  $('#alliesContainer').removeClass('hide');
  $('#enemiesContainer').addClass('hide');
}

function upsertPlayerDetails(name, element, teamColor) {
  if (!name) {
    return;
  }
  PlayerModel.getDetailsForPlayer(name)
    .then(function (details) {
      let topHeroes = details.heroes;
      topHeroes = topHeroes.map(function (topHero) {
        let filteredHero = heroesImageMap.filter(hero => hero.PrimaryName == topHero.name);
        if (!filteredHero.length) {
          throw "PrimaryName in HeroesJSON didn't map to scrapped hero name";
        } else {
          topHero.imageName = filteredHero[0].ImageURL;
          topHero.winPercentColor = getColorForWinPercentage(topHero.winPercent);
          return topHero;
        }
      });
      let rankings = filterRankings(details.rankings);
      let heroesTable = templates['player_details_table'].render({
        "heroes" : topHeroes,
        "rankings" : rankings,
        "badgeColor" : teamColor
      });
      $(element).replaceWith(heroesTable);
  });
}
const hiddenRankings = ["QM", "UD", "Unknown"];

function getColorForWinPercentage(winPercent) {
  winPercent = Number.parseFloat(winPercent);
  if (winPercent >= 70.0){return 'red-text darken-4-text';}
  if (winPercent >= 55.0) {return 'orange-text darken-4-text';}
  if (winPercent >= 50.0) {return 'orange-text';}
  if (winPercent >= 45.0) {return 'lime-text';}
  if (winPercent >= 40.0) {return 'green-text';}
  if (winPercent < 40.0) {return 'green-text lighten-2-text';}
}

function filterRankings(rankings) {
  //boo no es6 object iterators..
  rankings = $.map(rankings, function (ranking) { return ranking; });
  return rankings.filter(ranking => !hiddenRankings.includes(ranking.shortGameMode));
}
