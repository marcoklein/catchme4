import { createLogger } from "../../../logger";
import { LevelController } from "../LevelController";
import { GameRoom } from "../../GameRoom";
import { GameState } from "../../schema/GameState";
import { Level } from "../Level";
const log = createLogger("totalgametimerule");

export class TotalGameTimeRule implements LevelController {
  active = false;

  attachToLevel(level: Level) {
    const gameState = level.room.state;
    const config = gameState.options;
    this.active = gameState.options.totalGameTimeMillis > 0;
    gameState.level.remainingGameTimeMillis = config.totalGameTimeMillis;
    if (this.active) {
      log(
        "total game time rule is active with game time millis of %d",
        gameState.level.remainingGameTimeMillis
      );
    }
  }

  update(level: Level, millis: number) {
    if (!this.active) return;
    level.state.remainingGameTimeMillis = Math.max(
      0,
      level.state.remainingGameTimeMillis - millis
    );
    if (
      // TODO only change if running
      // level.state.state === "running" &&
      level.state.remainingGameTimeMillis <= 0
    ) {
      level.finishLevel("totalTime");
      this.active = false;
    }
  }
}
