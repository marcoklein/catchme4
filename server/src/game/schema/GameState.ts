import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { SprintActionRules } from "../level/actions/SprintAction";

export class PlayerStatisticsSchema extends Schema {}

export class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") bodyId: string = "";
  @type(PlayerStatisticsSchema) stats = new PlayerStatisticsSchema();

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

export class BodySchema extends Schema {
  @type("string") id: string;
  @type(Position) position: Position = new Position();
  @type("number") speed: number = 0.1;
  @type(Position) moveDirection: Position = new Position();
  @type("number") radius: number = 1;
  @type("boolean") isCatcher: boolean = false;
  @type("number") totalCatcherTimeMillis: number = 0;
  @type("number") currentCatcherTimeMillis: number = 0;

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

export class GameOptions extends Schema {
  @type(SprintActionRules) sprintActionRules = new SprintActionRules();
  @type("number") totalGameTimeMillis = 5000;
}

export class GameStatisticsSchema extends Schema {
  @type("number") round = 0;
  @type({ map: PlayerStatisticsSchema }) playerStatistics =
    new MapSchema<PlayerStatisticsSchema>();
}

export class GameLevelSchema extends Schema {
  @type("string") state: "warmup" | "starting" | "running" | "finished" =
    "warmup";
  @type("number") startingCountdown = 10;
  @type("number") remainingGameTimeMillis = 0;

  @type({ map: BodySchema }) bodies = new MapSchema<BodySchema>();
  @type(TileMap) tileMap = new TileMap();
}

export class GameState extends Schema {
  /**
   * Players that connect to the game.
   */
  @type({ map: Player }) players = new MapSchema<Player>();
  /**
   * Active level of the game.
   */
  @type(GameLevelSchema) level = new GameLevelSchema();
  /**
   * Options and game rules for the current game overall.
   */
  @type(GameOptions) options = new GameOptions();
  /**
   * Statistics of all games.
   */
  @type(GameStatisticsSchema) statistics: GameStatisticsSchema =
    new GameStatisticsSchema();
}
