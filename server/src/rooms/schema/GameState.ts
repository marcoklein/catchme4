import { Schema, Context, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
