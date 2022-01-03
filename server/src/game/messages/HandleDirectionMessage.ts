import { Vector } from "matter-js";
import { createLogger } from "../../logger";
import { Level } from "../level/Level";
import { LevelController } from "../level/LevelController";
const log = createLogger("handledirectionmessage");

export interface DirectionMessage {
  up: boolean;
  left: boolean;
  down: boolean;
  right: boolean;
}

export class HandleDirectionMessage implements LevelController {
  attachToLevel(level: Level) {
    const room = level.room;
    room.onMessage<DirectionMessage>("direction", (client, message) => {
      log("direction message", message, "from", client.sessionId);
      const { body } = room.gameStateFacade!.findPlayerAndBody(
        client.sessionId
      );
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
