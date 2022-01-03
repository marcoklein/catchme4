import { gameEnvironment } from "../../gameEnvironment";
import { Level } from "../Level";
import { LevelController } from "../LevelController";

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
