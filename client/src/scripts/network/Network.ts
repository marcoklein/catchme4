import { Client, Room } from "colyseus.js";
import { GameState } from "../generated/GameState";
import { Player } from "../generated/Player";
import { createLogger } from "../logger";
import LevelScene from "../scenes/LevelScene";
const log = createLogger("client");

export class Network {
  scene: LevelScene;
  room: Room<GameState>;
  ownPlayer: Player | undefined;

  constructor() {}

  async connect() {
    let serverUrl = "wss://zshwx1.colyseus.de";
    if (/localhost/.test(window.location.host)) {
      serverUrl = "ws://localhost:2567";
    }
    log("connecting to server url %s", serverUrl);
    const client = new Client(serverUrl);

    try {
      this.room = await client.joinOrCreate<GameState>("gameRoom");
    } catch (e) {
      console.error("error during room join", e);
    }
    log(this.room.sessionId, "joined", this.room.id, this.room.name);

    this.room.state.players.onAdd = (player) => {
      log("added new player with id", player.id);
      if (this.room.sessionId === player.id) {
        log("found own player with id %s", player.id);
        this.ownPlayer = player;
      }
      player.onRemove = () => {
        log("player", player.id, "removed");
      };
      player.triggerAll();
    };

    return this.room;
  }
}
