import { log } from "debug";
import { Vector, Body } from "matter-js";
import { GameController } from "../GameController";
import { GameRoom } from "../GameRoom";
import { BodySchema, GameState } from "../schema/GameState";

export interface DirectionMessage {
  up: boolean;
  left: boolean;
  down: boolean;
  right: boolean;
}

export class HandleDirectionMessage implements GameController {
  attachToRoom(room: GameRoom, state: GameState) {
    room.onMessage<DirectionMessage>("direction", (client, message) => {
      log("direction message", message, "from", client.sessionId);
      const { body } = state.findPlayerAndBody(client.sessionId);
      if (body) {
        let moveX = 0;
        let moveY = 0;
        if (message.down) moveY++;
        if (message.up) moveY--;
        if (message.left) moveX--;
        if (message.right) moveX++;
        if (moveX !== 0 || moveY !== 0) {
          log("move direction %j", { moveX, moveY });
          const { x, y } = Vector.normalise(Vector.create(moveX, moveY));
          log("after direction %j", { x, y });
          body.moveDirection.x = x;
          body.moveDirection.y = y;
          log("move direction %j", body.moveDirection);
        } else {
          body.moveDirection.x = 0;
          body.moveDirection.y = 0;
        }
      }
    });
  }
}
