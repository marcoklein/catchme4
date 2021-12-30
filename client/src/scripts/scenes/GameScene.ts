import { GameObjects } from "phaser";
import { createLogger } from "../logger";
import { Network } from "../network/Network";
import { PingHandler } from "../network/PingHandler";
import LevelScene from "./LevelScene";
const log = createLogger("gamescene");

export default class GameScene extends Phaser.Scene {
  levelScene: LevelScene;
  network: Network;
  pingHandler: PingHandler;
  private pingText: GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  async create() {
    this.network = new Network();

    const room = await this.network.connect();
    this.pingHandler = new PingHandler();
    this.pingHandler.attachToRoom(this.network.room);

    this.pingText = this.add.text(0, 0, "", {
      color: "white",
      fontSize: "14px",
    });
    this.pingText.setOrigin(0, 1);

    room.state.listen("level", (value, prevValue) => {
      console.log(
        "state change for level: creating LevelScene",
        value,
        prevValue
      );
      if (prevValue) {
        log("destroying old scene");
        this.scene.stop("LevelScene");
      }
      if (value) {
        this.scene.start("LevelScene", { network: this.network });
      }
    });
  }

  update() {
    if (this.pingHandler) this.pingHandler.update(this);
  }

  updatePing(ping: number, connectionText: string) {
    if (!this.pingText) return;
    this.pingText.setText(`Ping: ${ping} (${connectionText})`);
    this.pingText.setPosition(0, this.cameras.main.height);
  }
}
