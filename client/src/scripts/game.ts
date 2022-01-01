import "phaser";
import GameScene from "./scenes/GameScene";
import LevelScene from "./scenes/LevelScene";
import PreloadScene from "./scenes/temppreloadScene";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#333333",
  scale: {
    parent: "phaser-game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  scene: [PreloadScene, GameScene],
};

window.addEventListener("load", () => {
  const game = new Phaser.Game(config);
});
