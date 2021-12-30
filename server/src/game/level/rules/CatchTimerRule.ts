import { Schema, type } from "@colyseus/schema";
import { createLogger } from "../../../logger";
import { LevelController } from "../LevelController";
import { GameRoom } from "../../GameRoom";
import { BodySchema, GameState } from "../../schema/GameState";
import { Level } from "../Level";
const log = createLogger("catchtimer");

export class CatchTimerRules extends Schema {
  @type("number") maxContinuousCatcherTimeMillis: number = 20000;
}

export class CatchTimerRule implements LevelController {
  config = new CatchTimerRules();

  attachToLevel(level: Level) {
    level.room.gameEvents.on("caught", ({ catcher }) => {
      if (catcher) catcher.currentCatcherTimeMillis = 0;
    });
  }

  updateBody(level: Level, millis: number, body: BodySchema) {
    if (body.isCatcher) {
      body.totalCatcherTimeMillis += millis;
      body.currentCatcherTimeMillis += millis;
    }
  }
}
