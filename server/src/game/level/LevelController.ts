import { BodySchema, GameLevelSchema } from "../schema/GameState";
import { Level } from "./Level";

export interface LevelController {
  attachToLevel?(level: Level, state: GameLevelSchema): void;
  detachFromLevel?(level: Level): void;
  updateBody?(level: Level, millis: number, body: BodySchema): void;
  update?(level: Level, millis: number): void;
}
