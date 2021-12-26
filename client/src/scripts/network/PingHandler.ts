import { Room } from "colyseus.js";
import { environment } from "../environment";
import { GameState } from "../generated/GameState";
import { createLogger } from "../logger";
import GameScene from "../scenes/GameScene";
const log = createLogger("ping");

export class PingHandler {
  private _latestPing = -1;
  pingInterval = environment.pingIntervalInMilliseconds;

  getPing() {
    return this._latestPing;
  }

  getPingText() {
    const ping = this.getPing();
    if (ping > 300) {
      return "unplayable";
    } else if (ping > 200) {
      return "very bad";
    } else if (ping > 150) {
      return "bad";
    } else if (ping > 100) {
      return "okay";
    } else if (ping > 50) {
      return "good";
    } else if (ping > 30) {
      return "very good";
    }
    return "excellent";
  }

  update(scene: GameScene) {
    scene.hudScene.updatePing(this.getPing(), this.getPingText());
  }

  attachToRoom(room: Room<GameState>) {
    let lastPingId = 0;
    let lastPingTime = -1;
    let pingTimeout: any = undefined;
    const sendPing = () => {
      if (pingTimeout) {
        console.warn("no pong for ", this.pingInterval, "seconds");
        clearTimeout(pingTimeout);
      }
      lastPingId++;
      log("sending ping message with id %d", lastPingId);
      lastPingTime = Date.now();
      room.send("ping", lastPingId);

      pingTimeout = setTimeout(() => {
        pingTimeout = undefined;
        sendPing();
      }, this.pingInterval);
    };
    room.onMessage("pong", (pingId) => {
      if (lastPingId !== pingId) {
        console.warn("server sent an expired ping id");
        return;
      }
      this._latestPing = Date.now() - lastPingTime;
      log(
        "pong time for id %d is %d milliseconds",
        lastPingId,
        this._latestPing
      );
    });
    sendPing();
  }
}
