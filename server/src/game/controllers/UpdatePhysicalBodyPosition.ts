import { Events } from "matter-js";
import { GameController } from "../GameController";
import { GameRoom } from "../GameRoom";

export class UpdatePhysicalBodyPosition implements GameController {
  attachToRoom(room: GameRoom) {
    Events.on(room.engine, "afterUpdate", () => {
      for (const [bodySchema, matterBody] of room.schemaToMatterBodyMap) {
        bodySchema.position.x = matterBody.position.x;
        bodySchema.position.y = matterBody.position.y;
      }
    });
  }
}
