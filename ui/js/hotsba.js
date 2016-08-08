//library of functions pertaining to actual hotsMPH functionaility.

let PlayerModel = nodeRequire(process.cwd() + '/models/player.js');
let HeroImages = nodeRequire(process.cwd() + '/models/hero_images.js');
let heroesImageMap;
const numHeroes = 5;


function newHeroesCheck() {
  Materialize.toast('Checking for new heroes..', 4000);
  HeroImages.checkIfHeroesNeedDownloaded().spread(function (message, updatedHeroesJSON) {
      heroesImageMap = updatedHeroesJSON;
      Materialize.toast(message, 4000, 'rounded');
    }).catch(function (error) {
      Materialize.toast(error + ". Please restart the HotsMPH",8000,'rounded');
    });
}

function clearAllHeroCollections() {
  $('.heroes-collection').replaceWith($('<div class="heroes-container"></div>'));
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

function upsertHeroesTable(name, element) {
  if (!name) {
    return;
  }
  PlayerModel.getTopPlayedHeroesByPlayerNameOrBattleTag(name, numHeroes)
    .then(function (topHeroes) {
      topHeroes = topHeroes.map(function (topHero) {
        let filteredHero = heroesImageMap.filter(hero => hero.PrimaryName == topHero.name);
        if (!filteredHero.length) {
          throw "PrimaryName in HeroesJSON didn't map to scrapped hero name";
        } else {
          topHero.imageName = filteredHero[0].ImageURL;
          return topHero;
        }
      });
      let heroesTable = templates['heroes_table'].render({
        "heroes" : topHeroes
      });
      $(element).replaceWith(heroesTable);
  });
}
