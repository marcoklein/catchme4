import { Body, Vector } from "matter-js";
import { BodySchema } from "../../schema/GameState";
import { Level } from "../Level";
import { LevelController } from "../LevelController";

export class UpdateBodyMoveDirection implements LevelController {
  updateBody(level: Level, millis: number, body: BodySchema) {
    // update body forces / directions
    const matterBody = level.schemaToMatterBodyMap.get(body);
    if (!matterBody) return;
    const speed = body.speed;
    const force = Vector.mult(body.moveDirection, speed * millis * 0.002);
    Body.applyForce(matterBody, body.position, force);
    matterBody.friction = 0.9;
    matterBody.frictionAir = 0.9;
    matterBody.frictionStatic = 0.9;
  }
}
