import { createLogger } from "../../../logger";
import { Level } from "../Level";
import { LevelController } from "../LevelController";
const log = createLogger("totalgametimerule");

/**
 * Activate with this rule to set a maximum game time.
 */
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
      log("game time up! finishing game");
      level.finishLevel("totalTime");
      this.active = false;
    }
  }
}
