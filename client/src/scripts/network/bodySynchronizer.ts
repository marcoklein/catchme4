import { BodySchema } from "../generated/BodySchema";
import { DEPTH } from "../globals";
import { createLogger } from "../logger";
import BodySprite from "../objects/Body";
import GameScene from "../scenes/GameScene";
const log = createLogger("client:body-synchronizer");

export function bodySynchronizer(scene: GameScene, body: BodySchema) {
  log("added new body with id", body.id);

  // adding new player to scene
  const bodySprite = new BodySprite(scene, 200, 200);

  body.position.listen("x", (x) => bodySprite.setX(x));
  body.position.listen("y", (y) => bodySprite.setY(y));
  body.moveDirection.onChange = () => {
    if (body.moveDirection.x !== 0 || body.moveDirection.y !== 0) {
      log("setting rotation %j", body.moveDirection);
      bodySprite.setRotation(
        new Phaser.Math.Vector2(body.moveDirection).angle()
      );
    }
  };

  let catcherEmitter: Phaser.GameObjects.Particles.ParticleEmitter | undefined;
  let particles:
    | Phaser.GameObjects.Particles.ParticleEmitterManager
    | undefined;
  const destroyParticles = () => {
    if (particles) {
      log("destroying particles");
      particles.destroy();
      particles = undefined;
      catcherEmitter = undefined;
    }
  };

  body.onRemove = () => {
    log("player", body.id, "removed");
    bodySprite.destroy();
    destroyParticles();
  };

  body.listen("isCatcher", (isCatcher) => {
    if (isCatcher) {
      if (!catcherEmitter || !particles) {
        particles = scene.add.particles("particle.red");
        catcherEmitter = particles.createEmitter({});
      }
      catcherEmitter.setScale(0.3);
      catcherEmitter.setSpeed(30);
      catcherEmitter.setLifespan(100);
      catcherEmitter.setBlendMode(Phaser.BlendModes.ADD);
      catcherEmitter.startFollow(bodySprite);
      particles.setDepth(DEPTH.backgroundEffect);
    } else if (particles) {
      destroyParticles();
    }
  });

  body.triggerAll();
}
