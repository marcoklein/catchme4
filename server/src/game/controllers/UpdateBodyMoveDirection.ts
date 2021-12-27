import { Body, Events, Vector } from "matter-js";
import { GameController } from "../GameController";
import { GameRoom } from "../GameRoom";
import { BodySchema } from "../schema/GameState";

export class UpdateBodyMoveDirection implements GameController {
  updateBody(room: GameRoom, millis: number, body: BodySchema) {
    // update body forces / directions
    const matterBody = room.schemaToMatterBodyMap.get(body);
    if (!matterBody) return;
    const speed = body.speed;
    const force = Vector.mult(body.moveDirection, speed * millis * 0.002);
    Body.applyForce(matterBody, body.position, force);
    matterBody.friction = 0.9;
    matterBody.frictionAir = 0.9;
    matterBody.frictionStatic = 0.9;
  }
}
