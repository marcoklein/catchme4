import { Engine, Body, World, Bodies } from "matter-js";
import { createLogger } from "../../logger";
import { BodyFactory } from "../BodyFactory";
import { GameRoom } from "../GameRoom";
import { HandleDirectionMessage } from "../messages/HandleDirectionMessage";
import { HandlePingMessage } from "../HandlePingMessage";
import { BodySchema, GameLevelSchema, Player } from "../schema/GameState";
import { SprintAction } from "./actions/SprintAction";
import { CreatePhysicsController } from "./controllers/CreatePhysics";
import { CreateTileMap } from "./controllers/CreateTileMap";
import { UpdateBodyMoveDirection } from "./controllers/UpdateBodyMoveDirection";
import { UpdatePhysicalBodyPosition } from "./controllers/UpdatePhysicalBodyPosition";
import { LevelController } from "./LevelController";
import { LevelEvents } from "./LevelEvents";
import { CatchTimerRule } from "./rules/CatchTimerRule";
import { InitialCatcherGameRule } from "./rules/InitialCatcherGameRule";
import { TotalGameTimeRule } from "./rules/TotalGameTimeRule";
const log = createLogger("level");

export type FinishGameReason = "totalTime";

export class Level {
  engine!: Engine;
  schemaToMatterBodyMap = new Map<BodySchema, Body>();
  matterBodyToSchemaBodyMap = new Map<Body, BodySchema>();
  bodyFactory = new BodyFactory();
  room: GameRoom;
  controllers: LevelController[] = [];
  events = new LevelEvents();
  state!: GameLevelSchema;

  constructor(room: GameRoom) {
    this.room = room;
    this.changeLevel();
  }

  private changeLevel() {
    this.state = this.room.state.level;
    this.schemaToMatterBodyMap = new Map();
    this.matterBodyToSchemaBodyMap = new Map();
    this.bodyFactory = new BodyFactory();
    this.controllers = [
      new CreatePhysicsController(),
      new CreateTileMap(),
      new UpdateBodyMoveDirection(),
      new UpdatePhysicalBodyPosition(),

      new HandleDirectionMessage(),

      new InitialCatcherGameRule(),
      new CatchTimerRule(),
      new TotalGameTimeRule(),

      new SprintAction(),
    ];

    this.engine = Engine.create({
      gravity: { x: 0, y: 0 },
    });

    this.controllers.forEach((controller) =>
      controller.attachToLevel?.call(controller, this, this.state)
    );

    this.room.state.players.forEach((player) => {});
    this.room.gameEvents.on("playerJoined", ({ player }) =>
      this.addPlayerBody(player)
    );
    log("Initialized level");
  }

  /**
   * Called when a new client joins the game.
   * Adds a body for the given player.
   *
   * @param player
   */
  addPlayerBody(player: Player) {
    const body = this.bodyFactory.createPlayerBody();
    player.bodyId = body.id;
    this.state.bodies.set(body.id, body);
    const matterBody = Bodies.circle(
      body.position.x,
      body.position.y,
      body.radius
    );
    World.add(this.engine.world, matterBody);
    this.schemaToMatterBodyMap.set(body, matterBody);
    this.matterBodyToSchemaBodyMap.set(matterBody, body);
    this.events.emit("newPlayer", { player, body });
  }

  removePlayerBody(player: Player) {
    const body = this.state.bodies.get(player.bodyId);
    if (body) {
      log("destroying body with id %s", body?.id);
      this.state.bodies.delete(body.id);
      const matterBody = this.schemaToMatterBodyMap.get(body);
      if (matterBody) {
        World.remove(this.engine.world, matterBody);
        this.schemaToMatterBodyMap.delete(body);
        this.matterBodyToSchemaBodyMap.delete(matterBody);
      }
      player.bodyId = "";
    }
  }

  finishLevel(reason: FinishGameReason) {
    // TODO finish this game session
    log('finishing game with reason "%s"', reason);
    this.room.state.level.state = "finished";
    this.changeLevel();
  }

  update(millis: number) {
    // apply body effects
    this.room.state.level.bodies.forEach((body) =>
      this.controllers.forEach((controller) =>
        // TODO optimization: do not call update methods on all objects but filter
        // different controller methods into separate lists!
        controller.updateBody?.call(controller, this, millis, body)
      )
    );
    this.controllers.forEach((controller) =>
      controller.update?.call(controller, this, millis)
    );
    // run physics simulation
    Engine.update(this.engine, millis);
  }
}
