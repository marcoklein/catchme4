import { createLogger } from "../../logger";
import { GameController } from "../GameController";
import { GameRoom } from "../GameRoom";
import { GameState } from "../schema/GameState";
const log = createLogger("totalgametimerule");

export class TotalGameTimeRule implements GameController {
  active = false;

  attachToRoom(room: GameRoom, state: GameState) {
    const config = state.gameRules;
    this.active = state.gameRules.totalGameTimeMillis > 0;
    state.remainingGameTimeMillis = config.totalGameTimeMillis;
    if (this.active) {
      log(
        "total game time rule is active with game time millis of %d",
        state.remainingGameTimeMillis
      );
    }
  }

  update(room: GameRoom, millis: number) {
    if (!this.active) return;
    room.state.remainingGameTimeMillis = Math.max(
      0,
      room.state.remainingGameTimeMillis - millis
    );
    if (room.state.remainingGameTimeMillis <= 0) {
      // TODO end the game...
      room.finishGame("totalTime");
      this.active = false;
    }
  }
}
