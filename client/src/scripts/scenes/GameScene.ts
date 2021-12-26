import { NetworkSynchronizer } from "../network/client";
import { initInput } from "../input/input";
import HudScene from "./HudScene";
import { GameState } from "../generated/GameState";
import { Room } from "colyseus.js";
import { PingHandler } from "../network/PingHandler";

export default class GameScene extends Phaser.Scene {
  hudScene: HudScene;
  private room: Room<GameState>;
  private network: NetworkSynchronizer;
  private pingHandler: PingHandler;

  constructor() {
    super({ key: "GameScene" });
  }

  async create() {
    this.cameras.main.centerOn(0, 0);
    this.hudScene = this.scene.add("HudScene", HudScene, true) as HudScene;
    this.pingHandler = new PingHandler();

    this.network = new NetworkSynchronizer(this);
    this.room = await this.network.connect();
    this.pingHandler.attachToRoom(this.room);
    initInput(this, this.room);
  }

  update() {
    if (this.network.ownPlayer) {
      const playerBody = this.room.state.bodies.get(
        this.network.ownPlayer.bodyId
      );
      if (playerBody)
        this.hudScene.updateEnergy(playerBody.energy, playerBody.maxEnergy);
    }
    this.pingHandler.update(this);
  }
}
