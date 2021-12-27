import { Events } from "matter-js";
import { gameEnvironment } from "../gameEnvironment";
import { GameRoom } from "../GameRoom";
import { BodySchema } from "../schema/GameState";
import { GameController } from "../GameController";

export class CreatePhysicsController implements GameController {
  attachToRoom(room: GameRoom) {
    Events.on(room.engine, "collisionStart", (e) => {
      e.pairs.forEach((pair) => {
        const bodyA = room.matterBodyToSchemaBodyMap.get(pair.bodyA);
        const bodyB = room.matterBodyToSchemaBodyMap.get(pair.bodyB);

        if (bodyA && bodyB) {
          const catchBody = (bodyA: BodySchema, bodyB: BodySchema) => {
            if (bodyA.isCatcher && !bodyB.isCatcher) {
              bodyA.isCatcher = false;
              bodyA.maxEnergy = gameEnvironment.normalEnergy;
              bodyB.isCatcher = true;
              bodyB.maxEnergy = gameEnvironment.catcherEnergy;
              room.gameEvents.emit("caught", { catcher: bodyA, caught: bodyB });
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
