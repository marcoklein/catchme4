import { Events } from "matter-js";
import { Level } from "../Level";
import { LevelController } from "../LevelController";

export class UpdatePhysicalBodyPosition implements LevelController {
  attachToLevel(level: Level) {
    Events.on(level.engine, "afterUpdate", () => {
      for (const [bodySchema, matterBody] of level.schemaToMatterBodyMap) {
        bodySchema.position.x = matterBody.position.x;
        bodySchema.position.y = matterBody.position.y;
      }
    });
  }
}
