import { Client, Room } from "colyseus";
import { environment } from "../environment";
import { createLogger } from "../logger";
import { HandlePingMessage } from "./HandlePingMessage";
import { Level } from "./level/Level";
import { GameState, Player } from "./schema/GameState";
import { GameStateFacade } from "./schema/GameStateFacade";
const log = createLogger("gameroom");

export class GameRoom extends Room<GameState> {
  gameStateFacade?: GameStateFacade;
  level?: Level;

  onCreate(options: any) {
    console.log("here");
    log("Creating game...");
    this.createGame();
    log("Game created");
  }

  private createGame() {
    this.setState(new GameState());
    console.log("created game with state", this.state);
    this.gameStateFacade = new GameStateFacade(this.state);
    this.level = new Level(this);

    new HandlePingMessage().attachToRoom(this);

    this.setSimulationInterval(
      (millis) => this.update(millis),
      environment.SIMULATION_INTERVAL
    );
  }

  update(millis: number) {
    if (!this.level) return;
    this.level.update(millis);
  }

  addPlayer(sessionId: string, name: string = "<player name>") {
    log(sessionId, "joined!");
    const player = new Player(sessionId, name);
    this.state.players.set(player.id, player);
    this.level?.addPlayerBody(player);
  }

  onJoin(client: Client, options: any) {
    log("Client joining %s", client.sessionId);
    // TODO save name of client
    this.addPlayer(client.sessionId);
  }

  onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.level?.removePlayerBodyInNextUpdate(player);
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose() {
    log("room", this.roomId, "disposing...");
  }
}
