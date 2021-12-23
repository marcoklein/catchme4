import FpsText from "../objects/FpsText";
import { connectNetworkClient } from "../network/client";
import { initInput } from "../input/input";

export default class GameScene extends Phaser.Scene {
  fpsText;

  constructor() {
    super({ key: "GameScene" });
  }

  async create() {
    this.fpsText = new FpsText(this);

    // display the Phaser.VERSION
    this.add
      .text(this.cameras.main.width - 15, 15, `Phaser v${Phaser.VERSION}`, {
        color: "#000000",
        fontSize: "24px",
      })
      .setOrigin(1, 0);
    const room = await connectNetworkClient(this);
    initInput(this, room);
  }

  update() {
    this.fpsText.update();
  }
}
