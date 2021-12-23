import { Schema, Context, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") bodyId: string = "";

  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }
}

export class Body extends Schema {
  @type("string") id: string;
  @type("number") x: number = 0;
  @type("number") y: number = 0;

  constructor(id: string) {
    super();
    this.id = id;
  }
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Body }) bodies = new MapSchema<Body>();

  findPlayerAndBody(sessionId: string) {
    const player = this.players.get(sessionId);
    let body = undefined;
    if (!player) {
      console.error(`No player for session id ${sessionId}`);
    } else {
      body = this.bodies.get(player.bodyId);
    }
    return {
      player,
      body,
    };
  }
}
