import { Events } from "matter-js";
import { gameEnvironment } from "../../gameEnvironment";
import { GameRoom } from "../../GameRoom";
import { BodySchema } from "../../schema/GameState";
import { Level } from "../Level";
import { LevelController } from "../LevelController";

export class CreatePhysicsController implements LevelController {
  attachToLevel(level: Level) {
    Events.on(level.engine, "collisionStart", (e) => {
      e.pairs.forEach((pair) => {
        const bodyA = level.matterBodyToSchemaBodyMap.get(pair.bodyA);
        const bodyB = level.matterBodyToSchemaBodyMap.get(pair.bodyB);

        if (bodyA && bodyB) {
          const catchBody = (bodyA: BodySchema, bodyB: BodySchema) => {
            if (bodyA.isCatcher && !bodyB.isCatcher) {
              bodyA.isCatcher = false;
              bodyA.maxEnergy = gameEnvironment.normalEnergy;
              bodyB.isCatcher = true;
              bodyB.maxEnergy = gameEnvironment.catcherEnergy;
              level.events.emit("caught", {
                catcher: bodyA,
                caught: bodyB,
              });
              return true;
            }
            return false;
          };
          if (!catchBody(bodyA, bodyB)) catchBody(bodyB, bodyA);
        }
      });
    });
  }
}
