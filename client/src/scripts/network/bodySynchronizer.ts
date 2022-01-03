import { BodySchema } from "../generated/BodySchema";
import { DEPTH } from "../globals";
import { createLogger } from "../logger";
import LevelScene from "../scenes/LevelScene";
import { millisToMinutesAndSeconds } from "../shared/milllis-to-minutes-and-seconds";
import { getTextureFrameKey } from "../shared/schema-utils";
const log = createLogger("client:body-synchronizer");

function updateRemainingCatcherTimeText(scene: LevelScene, millis: number) {
  if (millis < 0) {
    scene.hudScene.updateGameStatusText(undefined);
  } else {
    const { seconds, minutes } = millisToMinutesAndSeconds(millis);
    scene.hudScene.updateGameStatusText(
      `Catch somebody! ${Math.floor(minutes)}:${new String(
        Math.floor(seconds)
      ).padStart(2, "0")}`
    );
  }
}

export function bodySynchronizer(scene: LevelScene, body: BodySchema) {
  log("added new body with id", body.id);

  if (scene.network.ownPlayer?.bodyId === body.id) {
    scene.hudScene.updateGameStatusText("Have fun!");
    log("Adding body of our player!");
    const renderEnergy = () => {
      scene.hudScene.updateEnergy(body.energy, body.maxEnergy);
    };
    body.listen("maxEnergy", renderEnergy);
    body.listen("energy", renderEnergy);

    body.listen("remainingCatcherTimeMillis", (time) => {
      updateRemainingCatcherTimeText(scene, time);
    });
  }

  // adding new player to scene
  const bodySprite = scene.add.image(
    200,
    200,
    body.texture.key,
    getTextureFrameKey(body.texture)
  );
  bodySprite.setDepth(DEPTH.body);

  scene.levelListeners.push(
    body.listen("texture", (texture) => {
      log(
        "Setting body texture=%s, frame=%s",
        texture.key,
        getTextureFrameKey(texture)
      );
      bodySprite.setTexture(texture.key, getTextureFrameKey(texture));
    })
  );
  // bodySprite.setTexture(body.texture.key, getTextureFrameKey(body.texture));

  scene.levelListeners.push(
    body.position.listen("x", (x) => bodySprite.setX(x))
  );
  scene.levelListeners.push(
    body.position.listen("y", (y) => bodySprite.setY(y))
  );
  body.moveDirection.onChange = () => {
    if (body.moveDirection.x !== 0 || body.moveDirection.y !== 0) {
      log("setting rotation %j", body.moveDirection);
      bodySprite.setRotation(
        new Phaser.Math.Vector2(body.moveDirection).angle()
      );
    }
  };

  let catcherEmitter: Phaser.GameObjects.Particles.ParticleEmitter | undefined;
  let catcherParticles:
    | Phaser.GameObjects.Particles.ParticleEmitterManager
    | undefined;
  const destroyParticles = () => {
    if (catcherParticles) {
      log("destroying particles");
      catcherParticles.destroy();
      catcherParticles = undefined;
      catcherEmitter = undefined;
    }
  };

  body.onRemove = () => {
    log("player", body.id, "removed");
    bodySprite.destroy();
    destroyParticles();

    log(
      "Setting body texture=%s, frame=%s",
      body.texture.key,
      getTextureFrameKey(body.texture)
    );

    scene.particles.emitDeathExplosion(
      body.position.x,
      body.position.y,
      body.texture.key,
      getTextureFrameKey(body.texture)
    );

    if (scene.network.ownPlayer?.bodyId === body.id) {
      log("Removing body of our player!");
      scene.hudScene.updateGameStatusText("Waiting for game to finish");
      scene.hudScene.updateEnergy(undefined);
    }
  };

  scene.levelListeners.push(
    body.listen("isCatcher", (isCatcher) => {
      if (isCatcher) {
        if (!catcherEmitter || !catcherParticles) {
          catcherParticles = scene.add.particles("particle.red");
          catcherEmitter = catcherParticles.createEmitter({});
        }
        catcherEmitter.setScale(0.3);
        catcherEmitter.setSpeed(30);
        catcherEmitter.setLifespan(100);
        catcherEmitter.setBlendMode(Phaser.BlendModes.ADD);
        catcherEmitter.startFollow(bodySprite);
        catcherParticles.setDepth(DEPTH.backgroundEffect);
      } else if (catcherParticles) {
        destroyParticles();
      }
    })
  );

  body.triggerAll();
}
