import { NetworkSynchronizer } from "../network/client";
import { initInput } from "../input/input";
import HudScene from "./HudScene";
import { GameState } from "../generated/GameState";
import { Room } from "colyseus.js";

export default class GameScene extends Phaser.Scene {
  private hudScene: HudScene;
  private room: Room<GameState>;
  private network: NetworkSynchronizer;

  constructor() {
    super({ key: "GameScene" });
  }

  async create() {
    this.cameras.main.centerOn(0, 0);
    this.hudScene = this.scene.add("HudScene", HudScene, true) as HudScene;

    this.network = new NetworkSynchronizer(this);
    this.room = await this.network.connect();
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
  }
}
