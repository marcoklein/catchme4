import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { SprintActionRules } from "../actions/SprintAction";

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

export class Texture extends Schema {
  @type("string") key: string;
  @type("string") frameKey?: string;
  @type("int8") frameIndex?: number;

  constructor(key: string, frame?: string | number) {
    super();
    this.key = key;
    if (frame)
      if (typeof frame === "string") this.frameKey = frame;
      else this.frameIndex = frame;
  }
}
export const TILE_LAYER_GROUND = 10;
export const TILE_LAYER_FOREGROUND = 110;

export class Tile extends Schema {
  @type("string") type = "";
  @type(Texture) texture: Texture;
  @type(Position) position = new Position();
  @type("boolean") walkable = true;
  @type("int8") layer = TILE_LAYER_GROUND;

  constructor(texture: Texture) {
    super();
    this.texture = texture;
  }
}

export class TileMap extends Schema {
  @type({ map: Tile }) tiles = new MapSchema<Tile>();
  @type(Dimension) mapSize = new Dimension();
  @type("number") tileSize = 64;

  getTileAt(x: number, y: number) {
    return this.tiles.get(`${x};${y}`);
  }
}

// export class BodyEffect extends Schema {
//   @type("number") duration: number = 0;
// }

// export class SpeedEffect extends BodyEffect {
//   @type("number") speed: number = 1.5;
// }

export class BodySchema extends Schema {
  @type("string") id: string;
  @type(Position) position: Position = new Position();
  @type("number") speed: number = 0.1;
  @type(Position) moveDirection: Position = new Position();
  @type("number") radius: number = 1;
  @type("boolean") isCatcher: boolean = false;

  @type("number") energy: number = 100;
  @type("number") maxEnergy: number = 100;
  wantsToSprint: boolean = false;
  @type("boolean") isSprinting: boolean = false;
  @type("number") sprintDuration: number = 0;

  constructor(id: string) {
    super();
    this.id = id;
  }
}

export class GameRules extends Schema {
  @type(SprintActionRules) sprintActionRules = new SprintActionRules();
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: BodySchema }) bodies = new MapSchema<BodySchema>();
  @type(TileMap) tileMap = new TileMap();
  @type(GameRules) gameRules = new GameRules();

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