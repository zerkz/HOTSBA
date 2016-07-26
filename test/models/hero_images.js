let HeroImagesModel = require('../../models/hero_images');
let expect = require('chai').expect;

const thumbImagePath = "https://hydra-media.cursecdn.com/heroesofthestorm.gamepedia.com/thumb/0/02/Gall_square_tile.png/40px-Gall_square_tile.png";
const fullImagePath = "https://hydra-media.cursecdn.com/heroesofthestorm.gamepedia.com/0/02/Gall_square_tile.png";
const fullImageFileName = "Gall_square_tile.png";

const fullImageWithURIEncoding = "https://hydra-media.cursecdn.com/heroesofthestorm.gamepedia.com/7/7f/Anub%27arak_square_tile.png";

describe('HeroImagesModel', function() {
  describe("#convertToFullImage", function () {
    it("converting a thumb nail path should result in the full image path", function() {
      return expect(HeroImagesModel.convertToFullImage(thumbImagePath))
        .to.equal(fullImagePath);
    });
  })
  describe('#parseImageFileNameFromPath', function () {
    it("a full image path should convert to the filename", function() {
    return expect(HeroImagesModel.parseImageFileNameFromPath(fullImagePath))
      .to.equal(fullImageFileName)
    });
    it("a full image path with uri encoded characters should convert to the filename uri decoded", function() {
    return expect(HeroImagesModel.parseImageFileNameFromPath(fullImageWithURIEncoding))
      .to.equal(fullImageFileName)
    });
  });
});
