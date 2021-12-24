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
export class Dimension extends Schema {
  @type("number") width: number = 0;
  @type("number") height: number = 0;
}

export class Tile extends Schema {
  @type("string") type = "";
  @type(Position) position = new Position();
  @type("boolean") walkable = true;
}

export class TileMap extends Schema {
  @type({ map: Tile }) tiles = new MapSchema<Tile>();
  @type(Dimension) mapSize = new Dimension();
  @type("number") tileSize = 64;

  getTileAt(x: number, y: number) {
    return this.tiles.get(`${x};${y}`);
  }
}

export class BodySchema extends Schema {
  @type("string") id: string;
  @type(Position) position: Position = new Position();
  @type("number") speed: number = 0.1;
  @type(Position) moveDirection: Position = new Position();
  @type("number") radius: number = 1;
  @type("boolean") isCatcher: boolean = false;

  constructor(id: string) {
    super();
    this.id = id;
  }
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: BodySchema }) bodies = new MapSchema<BodySchema>();
  @type(TileMap) tileMap = new TileMap();

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
