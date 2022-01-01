import { LevelController } from "../LevelController";
import { gameEnvironment } from "../../gameEnvironment";
import { GameRoom } from "../../GameRoom";
import { GameState } from "../../schema/GameState";
import { Level } from "../Level";

export class InitialCatcherGameRule implements LevelController {
  attachToLevel(level: Level) {
    level.events.on("newPlayer", ({ body }) => {
      body.isCatcher = false;
      let catchingPlayer = false;
      for (const [_, body] of level.state.bodies) {
        if (body.isCatcher) catchingPlayer = true;
      }
      if (!catchingPlayer) {
        body.isCatcher = true;
        // TODO create function to mark players as caught
        level.events.emit("caught", { catcher: undefined, caught: body });
        body.maxEnergy = gameEnvironment.catcherEnergy;
      }
    });
  }
}
