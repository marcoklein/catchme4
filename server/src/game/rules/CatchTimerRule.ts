import { Schema, type } from "@colyseus/schema";
import { createLogger } from "../../logger";
import { GameController } from "../GameController";
import { GameRoom } from "../GameRoom";
import { BodySchema, GameState } from "../schema/GameState";
const log = createLogger("catchtimer");

export class CatchTimerRules extends Schema {
  @type("number") maxContinuousCatcherTimeMillis: number = 20000;
}

export class CatchTimerRule implements GameController {
  config = new CatchTimerRules();

  attachToRoom(room: GameRoom, _state: GameState) {
    room.gameEvents.on("caught", ({ catcher }) => {
      if (catcher) catcher.currentCatcherTimeMillis = 0;
    });
  }

  updateBody(_room: GameRoom, millis: number, body: BodySchema) {
    if (body.isCatcher) {
      body.totalCatcherTimeMillis += millis;
      body.currentCatcherTimeMillis += millis;
    }
  }
}
