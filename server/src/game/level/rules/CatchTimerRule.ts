import { Schema, type } from "@colyseus/schema";
import { createLogger } from "../../../logger";
import { BodySchema } from "../../schema/GameState";
import { Level } from "../Level";
import { LevelController } from "../LevelController";
const log = createLogger("catchtimer");

export class CatchTimerOptions extends Schema {
  @type("number") initialCatcherTimeMillis: number = 100 * 1000;
  @type("number") timeAfterCatchFactor: number = 0.95;
}

export class CatchTimerRule implements LevelController {
  config = new CatchTimerOptions();
  currentMaxCatcherTime = -1;

  attachToLevel(level: Level) {
    this.config = level.room.state.options.catchTimerRules;
    this.currentMaxCatcherTime = this.config.initialCatcherTimeMillis;
    level.state.bodies.forEach((body) => {
      if (body.isCatcher)
        body.remainingCatcherTimeMillis = this.getMaxCatcherTime();
    });
    level.events.on("caught", ({ catcher, caught }) => {
      if (caught) caught.remainingCatcherTimeMillis = this.getMaxCatcherTime();
      if (catcher) catcher.remainingCatcherTimeMillis = -1;
    });
  }

  private getMaxCatcherTime() {
    const curMax = this.currentMaxCatcherTime;
    this.currentMaxCatcherTime *= this.config.timeAfterCatchFactor;
    return curMax;
  }

  updateBody(level: Level, millis: number, body: BodySchema) {
    if (body.isCatcher) {
      body.remainingCatcherTimeMillis = Math.max(
        0,
        body.remainingCatcherTimeMillis - millis
      );
      if (body.remainingCatcherTimeMillis === 0) {
        level.removeBodyInNextUpdate(body);
      }
    }
  }
}
