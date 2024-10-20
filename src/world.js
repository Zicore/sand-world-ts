// import { initialize } from "./input";
import Chunk from "./chunk";
import { SandParticle, AirParticle, OutOfBoundsParticle } from "./particle";

class World {
  constructor(scene) {
    this.chunkWidth = 64;
    this.chunkHeight = 64;

    this.chunksX = 2;
    this.chunksY = 2;
    this.chunks = [];

    this.initialize(scene);
  }

  setChunk(x, y, chunk) {
    this.chunks[y * this.chunksX + x] = chunk;
  }

  getChunkByIndex(x, y) {
    return this.chunks[y * this.chunksX + x];
  }

  initialize(scene) {
    const startX = -this.chunksX / 2;
    const startY = -this.chunksY / 2;

    for (let x = 0; x < this.chunksX; x++) {
      for (let y = 0; y < this.chunksY; y++) {
        const chunk = new Chunk(scene, this.chunkWidth, this.chunkHeight, startX + x, startY + y);
        this.setChunk(x, y, chunk);
        //chunk.setParticle(this, 15, 15, sandParticle);
      }
    }
  }

  update() {
    for (let x = 0; x < this.chunksX; x++) {
      for (let y = 0; y < this.chunksY; y++) {
        this.getChunkByIndex(x, y).update(this);
      }
    }
  }

  getChunk(x, y) {
    const chunkX = Math.floor(x / this.chunkWidth);
    const chunkY = Math.floor(y / this.chunkHeight);
    const chunk = this.getChunkByIndex(chunkX, chunkY);

    return chunk;
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.chunkWidth * this.chunksX && y >= 0 && y < this.chunkHeight * this.chunksY;
  }

  getParticle(x, y) {

    if (!this.isInBounds(x, y)) {
      return OutOfBoundsParticle.Instance;
    }

    const chunk = this.getChunk(x, y);

    if (chunk === undefined) {
      return OutOfBoundsParticle.Instance;
    }

    return chunk.getParticleLocal(x % this.chunkWidth, y % this.chunkHeight);
  }

  setParticle(x, y, particle) {

    if (!this.isInBounds(x, y)) {
      return;
    }

    const chunk = this.getChunk(x, y);

    if (chunk === undefined) {
      return;
    }

    chunk.setParticle(
      this,
      x % this.chunkWidth,
      y % this.chunkHeight,
      particle
    );
  }

  getChunkWidth() {
    return this.chunkWidth;
  }

  getChunkHeight() {
    return this.chunkHeight;
  }
}

export default World;
