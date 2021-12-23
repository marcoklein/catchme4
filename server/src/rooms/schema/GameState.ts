import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

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

export class Position extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

export class Tile extends Schema {}

export class TileMap extends Schema {
  @type([Tile]) tiles = new ArraySchema<Tile>();
}

export class BodySchema extends Schema {
  @type("string") id: string;
  @type(Position) position: Position = new Position();
  @type("number") speed: number = 0.1;
  @type(Position) moveDirection: Position = new Position();
  @type("number") radius: number = 1;

  constructor(id: string) {
    super();
    this.id = id;
  }
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: BodySchema }) bodies = new MapSchema<BodySchema>();

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
