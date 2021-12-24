import { DEPTH } from "../globals";

export default class TileImage extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, image: string) {
    super(scene, x, y, image);
    scene.add.existing(this);
    this.setDepth(DEPTH.tile);
  }
}
