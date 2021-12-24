import { DEPTH } from "../globals";

export default class BodySprite extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "body.blue.1");
    scene.add.existing(this);
    this.setDepth(DEPTH.tile);
  }
}
