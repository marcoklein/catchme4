import { Bodies, Body, Engine, World } from "matter-js";
import { createLogger } from "../../logger";
import { BodyFactory } from "../BodyFactory";
import { GameRoom } from "../GameRoom";
import { HandleDirectionMessage } from "../messages/HandleDirectionMessage";
import {
  BodySchema,
  GameLevelSchema,
  GameLevelSchemaState,
  Player,
} from "../schema/GameState";
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

export type FinishGameReason = "totalTime" | "playerWon";

/**
 * Controls logic for a level.
 */
export class Level {
  engine!: Engine;
  schemaToMatterBodyMap = new Map<BodySchema, Body>();
  matterBodyToSchemaBodyMap = new Map<Body, BodySchema>();
  bodyFactory = new BodyFactory();
  room: GameRoom;
  controllers: LevelController[] = [];
  gameRulesDuringRunningGame: LevelController[] = [];
  events = new LevelEvents();
  state!: GameLevelSchema;
  private bodiesToRemoveInNextUpdate: BodySchema[] = [];

  constructor(room: GameRoom) {
    this.room = room;
    this.changeLevel();
  }

  private changeLevel() {
    // destroy existing level
    this.controllers.forEach((controller) => {
      if (controller.detachFromLevel) controller.detachFromLevel(this);
    });
    this.room.state.players.forEach((player) => (player.bodyId = ""));

    // start new level
    this.state = new GameLevelSchema();
    this.state.state = "warmup";
    this.events = new LevelEvents();
    this.room.state.level = this.state;
    this.schemaToMatterBodyMap = new Map();
    this.matterBodyToSchemaBodyMap = new Map();
    this.bodyFactory = new BodyFactory();
    this.bodiesToRemoveInNextUpdate = [];
    this.controllers = [
      new CreatePhysicsController(),
      new CreateTileMap(),
      new UpdateBodyMoveDirection(),
      new UpdatePhysicalBodyPosition(),

      new HandleDirectionMessage(),

      new InitialCatcherGameRule(),

      new SprintAction(),
    ];
    this.gameRulesDuringRunningGame = [
      new CatchTimerRule(),
      // new TotalGameTimeRule(),
    ];

    this.engine = Engine.create({
      gravity: { x: 0, y: 0 },
    });

    this.controllers.forEach((controller) => {
      if (controller.attachToLevel) controller.attachToLevel(this, this.state);
    });

    this.room.state.players.forEach((player) => {
      this.addPlayerBody(player);
    });
    log("Initialized level");
  }

  private changeLevelState(newState: GameLevelSchemaState) {
    log("Changing level state from %s to %s", this.state.state, newState);
    this.state.state = newState;
    if (newState === "running") {
      this.gameRulesDuringRunningGame.forEach((controller) => {
        if (controller.attachToLevel) {
          controller.attachToLevel(this, this.state);
        }
        this.controllers.push(controller);
      });
    }
  }

  startLevel() {
    this.changeLevelState("running");
  }

  /**
   * Called when a new client joins the game.
   * Adds a body for the given player.
   *
   * @param player
   */
  addPlayerBody(player: Player) {
    if (player.bodyId.length) {
      log(
        "Cannot add player body cause player %s (%s) already has bodyId %s",
        player.id,
        player.name,
        player.bodyId
      );
      return;
    }
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

    log(
      "Added new player body to level. Now there are %d bodies",
      this.state.bodies.size
    );
    if (this.state.bodies.size >= 2 && this.state.state === "warmup") {
      log("Got more than 2 players. Starting the game.");
      this.startLevel();
    }
  }

  removePlayerBodyInNextUpdate(player: Player) {
    const body = this.state.bodies.get(player.bodyId);
    if (body) this.removeBodyInNextUpdate(body);
    player.bodyId = "";
  }

  removeBodyInNextUpdate(body: BodySchema) {
    // remove a body from game
    if (body) {
      this.bodiesToRemoveInNextUpdate.push(body);
    }
  }

  finishLevel(reason: FinishGameReason) {
    // TODO finish this game session
    log('finishing game with reason "%s"', reason);
    this.room.state.level.state = "finished";
    // TODO change level after time...
    this.changeLevel();
  }

  update(millis: number) {
    this.updateRemovedBodies();
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
    this.updateRemovedBodies();

    // run physics simulation
    Engine.update(this.engine, millis);
  }

  private updateRemovedBodies() {
    this.bodiesToRemoveInNextUpdate.forEach((body) => {
      log("destroying body with id %s", body?.id);
      this.state.bodies.delete(body.id);
      const matterBody = this.schemaToMatterBodyMap.get(body);
      if (matterBody) {
        World.remove(this.engine.world, matterBody);
        this.schemaToMatterBodyMap.delete(body);
        this.matterBodyToSchemaBodyMap.delete(matterBody);
      }

      // TODO refactor this into state logic
      if (this.state.bodies.size <= 1 && this.state.state === "running") {
        this.finishLevel("playerWon");
      }
    });
    this.bodiesToRemoveInNextUpdate = [];
  }
}
