import * as THREE from "three";
import { AirParticle, Color, Particle, ParticleType } from "./particle";

interface World {
  setParticle(x: number, y: number, particle: Particle): void;
  getParticle(x: number, y: number): Particle;
}

class Chunk {
  world: World;
  width: number;
  height: number;
  position: THREE.Vector2;
  data: Uint8Array;
  particles: Particle[];
  texture: THREE.DataTexture;

  constructor(world: World, scene: THREE.Scene, width: number, height: number, x: number, y: number) {
    this.world = world;
    this.width = width;
    this.height = height;
    this.position = new THREE.Vector2(x, y);

    const size = width * height;
    this.data = new Uint8Array(4 * size); // 4 channels: Red, Green, Blue, Alpha
    this.particles = new Array(width * height);

    // Create the DataTexture from the pixel data
    this.texture = new THREE.DataTexture(this.data, this.width, this.height, THREE.RGBAFormat);
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.needsUpdate = true;

    const chunkScale = 1.0;
    const material = new THREE.MeshBasicMaterial({ map: this.texture });
    const geometry = new THREE.PlaneGeometry(chunkScale, chunkScale, 1, 1);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x + 0.5, y + 0.5, 0);
    scene.add(cube);

    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.setParticleLocal(i, j, new AirParticle());
      }
    }
  }

  setPixel(x: number, y: number, color: Color): void {
    const index = (y * this.width + x) * 4;
    this.data[index] = color.r * 255;
    this.data[index + 1] = color.g * 255;
    this.data[index + 2] = color.b * 255;
    this.data[index + 3] = color.a * 255;
    this.texture.needsUpdate = true;
  }

  setParticleLocal(x: number, y: number, particle: Particle): void {
    this.particles[y * this.width + x] = particle;
    this.setPixel(x, y, particle.getColor());
  }

  setParticle(world: World, x: number, y: number, particle: Particle): void {
    if (!this.isInBounds(x, y)) {
      const worldPos = this.toWorldPosition(x, y);
      world.setParticle(worldPos.x, worldPos.y, particle);
    } else {
      this.setParticleLocal(x, y, particle);
    }
  }

  getParticleLocal(x: number, y: number): Particle {
    const particle = this.particles[y * this.width + x];
    if (!particle) throw new Error(`Particle at ${x}, ${y} is undefined`);
    return particle;
  }

  getParticle(world: World, x: number, y: number): Particle {
    if (!this.isInBounds(x, y)) {
      const worldPos = this.toWorldPosition(x, y);
      return world.getParticle(worldPos.x, worldPos.y);
    }
    return this.getParticleLocal(x, y);
  }

  toWorldPosition(x: number, y: number): { x: number; y: number } {
    return {
      x: x + this.position.x * this.width,
      y: y + this.position.y * this.height,
    };
  }

  update(): void {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const particle = this.getParticle(this.world, x, y);
        particle.update();

        if (particle.dead) {
          this.setParticle(this.world, x, y, new AirParticle());
        }

        if (particle.type === ParticleType.Sand) {
          this.moveRule(particle, x, y, 0, -1) ||
            this.decide(
              () => this.moveRule(particle, x, y, -1, -1),
              () => this.moveRule(particle, x, y, 1, -1),
              0.5
            );
        } else if (particle.type === ParticleType.Water) {
          this.moveRule(particle, x, y, 0, -1) ||
            this.moveRule(particle, x, y, -1, -1) ||
            this.moveRule(particle, x, y, 1, -1) ||
            this.decide(
              () => this.moveRule(particle, x, y, -1, 0),
              () => this.moveRule(particle, x, y, 1, 0),
              0.5
            );
        }
      }
    }

    for (let x = 0; x < this.width; x++) {
      for (let y = this.height; y >= 0; y--) {
        const particle = this.getParticle(this.world, x, y);

        if (particle.type === ParticleType.Fire) {
          particle.update();

          if (particle.dead) {
            this.setParticle(this.world, x, y, new AirParticle());
          }

          this.moveRule(particle, x, y, 0, 1) ||
            this.moveRule(particle, x, y, -1, 1) ||
            this.moveRule(particle, x, y, 1, 1) ||
            this.decide(
              () => this.moveRule(particle, x, y, -1, 0),
              () => this.moveRule(particle, x, y, 1, 0),
              0.5
            );
        }
      }
    }
  }

  decide(funcA: () => boolean, funcB: () => boolean, chance: number): boolean {
    return Math.random() < chance ? funcA() : funcB();
  }

  densityRule(world: World, x: number, y: number, dx: number, dy: number): boolean {
    const particle = this.getParticle(world, x, y);
    const otherParticle = this.getParticle(world, x + dx, y + dy);

    if (!particle.affectedByDensity || !otherParticle.affectedByDensity) return false;

    if (particle.density > otherParticle.density) {
      this.swapParticles(world, x, y, x + dx, y + dy);
      return true;
    }
    return false;
  }

  moveRule(particle: Particle, x: number, y: number, dx: number, dy: number): boolean {
    if (this.getParticle(this.world, x + dx, y + dy).canMoveThrough(particle)) {
      this.swapParticles(this.world, x, y, x + dx, y + dy);
      return true;
    }
    return false;
  }

  swapParticles(world: World, x1: number, y1: number, x2: number, y2: number): void {
    const temp = this.getParticle(world, x1, y1);
    this.setParticle(world, x1, y1, this.getParticle(world, x2, y2));
    this.setParticle(world, x2, y2, temp);
  }

  isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

export default Chunk;
