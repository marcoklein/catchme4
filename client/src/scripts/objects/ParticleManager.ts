import { Scene } from "phaser";
import { DEPTH } from "../globals";
import { createLogger } from "../logger";
const log = createLogger("ParticleManager");

export class ParticleManager {
  private emitterCache: {
    [key: string]: Phaser.GameObjects.Particles.ParticleEmitterManager;
  } = {};
  private emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  emitDeathExplosion(
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    log("emit death explosion with params %j", { x, y, texture, frame });
    this.emitParticles(x, y, texture, frame);
  }

  emitParticles(
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    const particles =
      this.emitterCache[texture] ||
      this.scene.add.particles(texture, frame, {
        active: false,
      });
    particles.setDepth(DEPTH.particles);
    const emitter = particles.createEmitter({
      x,
      y,
      scale: { start: 0.7, end: 0 },
      rotate: { start: 0, end: 360 },
      lifespan: [1000, 2000],
      maxParticles: 10,
      frequency: 5,
      speed: 80,
    });
    this.scene.time.delayedCall(2000, () => {
      const index = this.emitters.indexOf(emitter);
      if (index !== -1) {
        this.emitters.splice(index, 1);
      }
    });
    this.emitters.push(emitter);
  }

  destroyParticles() {
    this.emitters.forEach((e) => e.remove());
    Object.values(this.emitterCache).forEach((e) => e.destroy());
    this.emitterCache = {};
  }
}
