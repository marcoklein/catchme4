import { Room, Client } from "colyseus";
import { environment } from "../environment";
import { createLogger } from "../logger";
import { DirectionMessage } from "./messages/DirectionMessage";
import { Body, GameState, Player } from "./schema/GameState";
const log = createLogger("gameroom");

export class MyRoom extends Room<GameState> {
  lastBodyId = 1;
  onCreate(options: any) {
    this.setState(new GameState());

    this.onMessage<DirectionMessage>("direction", (client, message) => {
      log("direction message", message, "from", client.sessionId);
    });
    this.setSimulationInterval(
      (millis) => this.update(millis),
      environment.SIMULATION_INTERVAL
    );
  }

  update(millis: number) {
    this.state.players.forEach((player) => {
      const body = this.state.bodies.get(player.bodyId);
      if (body) {
        log("changing body pos");
        const speed = 1;
        body.x += millis * speed;
      }
    });
  }

  onJoin(client: Client, options: any) {
    log(client.sessionId, "joined!");
    const player = new Player(client.sessionId, "<player name>");
    const body = new Body(`${this.lastBodyId++}`);
    player.bodyId = body.id;
    this.state.players.set(player.id, player);
    this.state.bodies.set(body.id, body);
  }

  onLeave(client: Client, consented: boolean) {
    log(client.sessionId, "left!");
    const { player, body } = this.state.findPlayerAndBody(client.sessionId);
    if (player) this.state.players.delete(player.id);
    if (body) this.state.bodies.delete(body.id);
  }

  onDispose() {
    log("room", this.roomId, "disposing...");
  }
}
