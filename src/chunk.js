import * as THREE from "three";
import { ParticleType, AirParticle, SandParticle } from "./particle";

class Chunk {
  constructor(scene, width, height, x, y) {
    this.position = new THREE.Vector2(x, y);
    // Create a typed array to hold pixel data (RGBA, 4 values per pixel)
    const size = width * height;

    this.width = width;
    this.height = height;

    this.data = new Uint8Array(4 * size); // 4 channels: Red, Green, Blue, Alpha
    this.particles = [width * height];

    // Create the DataTexture from the pixel data
    this.texture = new THREE.DataTexture(
      this.data,
      this.width,
      this.height,
      THREE.RGBAFormat
    );
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.needsUpdate = true; // Tell Three.js that the texture needs to be updated

    // Use the texture in a material

    const chunkScale = 1.0;

    const material = new THREE.MeshBasicMaterial({ map: this.texture });
    const geometry = new THREE.PlaneGeometry(chunkScale, chunkScale, 1, 1);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x + 0.5, y + 0.5, 0);
    scene.add(cube);

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.setParticleLocal(x, y, new AirParticle());
      }
    }
  }

  setPixel(x, y, color) {
    const index = (y * this.width + x) * 4;
    this.data[index] = color.r * 255; // Red
    this.data[index + 1] = color.g * 255; // Green
    this.data[index + 2] = color.b * 255; // Blue
    this.data[index + 3] = color.a * 255; // Alpha

    this.texture.needsUpdate = true;
  }

  setParticleLocal(x, y, particle) {
    this.particles[y * this.width + x] = particle;
    this.setPixel(x, y, particle.getColor());
  }

  setParticle(world, x, y, particle) {
    // Check if the position is out of bounds and set the particle in the world instead of local
    if (!this.isInBounds(x, y)) {
      const worldPos = this.toWorldPosition(x, y);
      world.setParticle(worldPos.x, worldPos.y, particle);
      return;
    }

    this.setParticleLocal(x, y, particle);
  }

  getParticleLocal(x, y) {
    const p =  this.particles[y * this.width + x];
    if (p === undefined) {
      throw new Error(`Particle at ${x}, ${y} is undefined`);
    }
    return p;
  }

  getParticle(world, x, y) {
    if (!this.isInBounds(x, y)) {
      const worldPos = this.toWorldPosition(x, y);
      const p =  world.getParticle(worldPos.x, worldPos.y);
      if(p === undefined) {
        throw new Error(`Particle at ${worldPos.x}, ${worldPos.y} is undefined`);
      }
      return p;
    }
    const p = this.getParticleLocal(x, y);
    if(p === undefined) {
      throw new Error(`Particle at ${x}, ${y} is undefined`);
    }
    return p;
  }

  toWorldPosition(x, y) {
    return {
      x: this.width + x + this.position.x * this.width,
      y: this.height + y + this.position.y * this.height,
    };
  }

  update(world) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const particle = this.getParticle(world, x, y);

        if (particle.type === ParticleType.Sand) {
          this.moveRule(world, x, y, 0, -1) ||
            this.moveRule(world, x, y, -1, -1) ||
            this.moveRule(world, x, y, 1, -1);
        } else if (particle.type === ParticleType.Water) {
          this.moveRule(world, x, y, 0, -1) ||
            this.moveRule(world, x, y, -1, -1) ||
            this.moveRule(world, x, y, 1, -1) ||
            this.decide(() => this.moveRule(world, x, y, -1, 0), () => this.moveRule(world, x, y, 1, 0), 0.5)
        }

        this.densityRule(world, x, y, 0, -1);
      }
    }
  }

  decide(funcA, funcB, chance) {
    if (Math.random() < chance) {
      return funcA();
    } else {
      return funcB();
    }
  }

  densityRule(world, x, y, dx, dy) {
    const particle = this.getParticle(world, x, y);
    const otherParticle = this.getParticle(world, x + dx, y + dy);

    if(!particle.affectedByDensity)
        return false;

    if(!otherParticle.affectedByDensity)
        return false;

    if (particle.density > otherParticle.density) {
      this.swapParticles(world, x, y, x + dx, y + dy);
      return true;
    }
    return false;
  }

  moveRule(world, x, y, dx, dy) {
    if (this.getParticle(world, x + dx, y + dy).type === ParticleType.Air) {
      this.swapParticles(world, x, y, x + dx, y + dy);
      return true;
    }
    return false;
  }

  swapParticles(world, x1, y1, x2, y2) {
    const temp = this.getParticle(world, x1, y1);
    this.setParticle(world, x1, y1, this.getParticle(world, x2, y2));
    this.setParticle(world, x2, y2, temp);
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }
}

export default Chunk;
