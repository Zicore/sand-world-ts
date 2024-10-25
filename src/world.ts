import * as THREE from "three";
import Chunk from "./chunk";
import { OutOfBoundsParticle, Particle } from "./particle";

class World {
  chunkWidth: number;
  chunkHeight: number;
  chunksX: number;
  chunksY: number;
  chunks: Chunk[];

  constructor(scene: THREE.Scene) {
    this.chunkWidth = 256;
    this.chunkHeight = 256;
    this.chunksX = 1;
    this.chunksY = 1;
    this.chunks = [];

    this.initialize(scene);
  }

  setChunk(x: number, y: number, chunk: Chunk): void {
    this.chunks[y * this.chunksX + x] = chunk;
  }

  getChunkByIndex(x: number, y: number): Chunk | undefined {
    return this.chunks[y * this.chunksX + x];
  }

  initialize(scene: THREE.Scene): void {
    const startX = -this.chunksX / 2;
    const startY = -this.chunksY / 2;

    for (let x = 0; x < this.chunksX; x++) {
      for (let y = 0; y < this.chunksY; y++) {
        const chunk = new Chunk(this, scene, this.chunkWidth, this.chunkHeight, startX + x, startY + y);
        this.setChunk(x, y, chunk);
        // You can initialize specific particles here if needed
        // chunk.setParticle(this, 15, 15, new SandParticle());
      }
    }
  }

  update(): void {
    for (let x = 0; x < this.chunksX; x++) {
      for (let y = 0; y < this.chunksY; y++) {
        this.getChunkByIndex(x, y)?.update();
      }
    }
  }

  getChunk(x: number, y: number): Chunk | undefined {
    const chunkX = Math.floor(x / this.chunkWidth);
    const chunkY = Math.floor(y / this.chunkHeight);
    return this.getChunkByIndex(chunkX, chunkY);
  }

  isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.chunkWidth * this.chunksX && y >= 0 && y < this.chunkHeight * this.chunksY;
  }

  getParticle(x: number, y: number): Particle {
    if (!this.isInBounds(x, y)) {
      return OutOfBoundsParticle.getInstance();
    }

    const chunk = this.getChunk(x, y);
    if (!chunk) {
      return OutOfBoundsParticle.getInstance();
    }

    return chunk.getParticleLocal(x % this.chunkWidth, y % this.chunkHeight);
  }

  setParticle(x: number, y: number, particle: Particle): void {
    if (!this.isInBounds(x, y)) {
      return;
    }

    const chunk = this.getChunk(x, y);
    if (!chunk) {
      return;
    }

    chunk.setParticle(this, x % this.chunkWidth, y % this.chunkHeight, particle);
  }

  getChunkWidth(): number {
    return this.chunkWidth;
  }

  getChunkHeight(): number {
    return this.chunkHeight;
  }
}

export default World;
