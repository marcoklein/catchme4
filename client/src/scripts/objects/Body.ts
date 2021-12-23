export default class Body extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "body.blue.1");
    scene.add.existing(this);
  }
}
