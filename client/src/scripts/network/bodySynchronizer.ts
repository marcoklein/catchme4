import { BodySchema } from "../generated/BodySchema";
import { Texture } from "../generated/Texture";
import { DEPTH } from "../globals";
import { createLogger } from "../logger";
import LevelScene from "../scenes/LevelScene";
import { getTextureFrameKey } from "../shared/schema-utils";
const log = createLogger("client:body-synchronizer");

export function bodySynchronizer(scene: LevelScene, body: BodySchema) {
  log("added new body with id", body.id);

  if (scene.network.ownPlayer?.bodyId === body.id) {
    log("Adding body of our player!");
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
