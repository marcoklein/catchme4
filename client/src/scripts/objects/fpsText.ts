import { DEPTH } from "../globals";

export default class GameText extends Phaser.GameObjects.Text {
  constructor(scene) {
    super(scene, 10, 10, "", { color: "black", fontSize: "28px" });
    scene.add.existing(this);
    this.setOrigin(0);
    this.setDepth(DEPTH.text);
  }

  public update() {
    this.setText(`Energy: ${Math.floor(this.scene.game.loop.actualFps)}`);
  }
}
