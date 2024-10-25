// Define interfaces for particle-related properties
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Particle {
  type: ParticleType;
  density: number;
  affectedByDensity: boolean;
  isDead() : boolean;
  getColor(): Color;
  update() : void;
  canMoveThrough(other: Particle): boolean;
}

export class ParticleClass {
  static None = { type: -1, name: "None" };
  static Air = { type: 0, name: "Air" };
  static Solid = { type: 1, name: "Solid" };
  static Liquid = { type: 2, name: "Liquid" };
  static Powder = { type: 3, name: "Powder" };
  static Gas = { type: 4, name: "Gas" };
}

export class ParticleType {
  static OutOfBounds = { type: -1, name: "OutOfBounds" };
  static Air = { type: 0, name: "Air" };
  static Sand = { type: 1, name: "Sand" };
  static Water = { type: 2, name: "Water" };
  static Wall = { type: 3, name: "Wall" };
  static Fire = { type: 4, name: "Fire" };
}

export class Particle {
  type: ParticleType;
  particleClass: { type: number; name: string };
  color: Color;
  density: number;
  affectedByDensity: boolean;

  affectedByLifetime : boolean = false;
  maxLifetime : number = 32;
  minLifetime : number = 3;
  lifetime : number = 0;

  dead : boolean = false;

  constructor(type: { type: number; name: string }, particleClass: { type: number; name: string }) {
    this.type = type;
    this.particleClass = particleClass;
    this.color = { r: 0.1, g: 0.2, b: 0.3, a: 1 };
    this.density = 1;
    this.affectedByDensity = false;

    this.lifetime = Math.random() * (this.maxLifetime - this.minLifetime) + this.minLifetime;
  }

  isDead() : boolean {
    return this.dead;
  }

  update(){

    if(this.affectedByLifetime){
      this.lifetime--;
      if(this.lifetime <= 0){
          this.lifetime = 0;
          this.dead = true;
      }
    }

    return;
  }

  canMoveThrough(other: Particle): boolean {
    return false;
  }

  getColor(): Color {
    return this.color;
  }

  getStartingColor(): Color {
    return this.color;
  }
}

export class OutOfBoundsParticle extends Particle {
  private static instance: OutOfBoundsParticle;

  private constructor() {
    super(ParticleType.OutOfBounds, ParticleClass.None);
    this.color = { r: 0, g: 0, b: 0, a: 0 };
  }

  getColor(): Color {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  static getInstance(): OutOfBoundsParticle {
    if (!OutOfBoundsParticle.instance) {
      OutOfBoundsParticle.instance = new OutOfBoundsParticle();
    }
    return OutOfBoundsParticle.instance;
  }
}

export class AirParticle extends Particle {
  constructor() {
    super(ParticleType.Air, ParticleClass.Air);
    this.color = { r: 0, g: 0, b: 0, a: 0 };
  }

  canMoveThrough(other: Particle): boolean {
    return other.particleClass !== ParticleClass.Solid;
  }

  getColor(): Color {
    return { r: 0.05, g: 0.05, b: 0.05, a: 0 };
  }
}

export class SandParticle extends Particle {
  constructor() {
    super(ParticleType.Sand, ParticleClass.Powder);
    this.color = randomColorInHSLRange(48, 50, 40, 70, 50, 80);
    this.density = 2;
    this.affectedByDensity = true;
  }

  canMoveThrough(other: Particle): boolean {
    return other.type !== this.type && other.particleClass !== ParticleClass.Solid && other.density >= this.density;
  }
}

export class WaterParticle extends Particle {
  constructor() {
    super(ParticleType.Water, ParticleClass.Liquid);
    this.color = randomColorInHSLRange(210, 210, 90, 90, 25, 25);
    this.affectedByDensity = true;
  }

  canMoveThrough(other: Particle): boolean {
    return other.type !== this.type;
  }
}

export class FireParticle extends Particle {
  constructor() {
    super(ParticleType.Fire, ParticleClass.Gas);
    this.color = randomColorInHSLRange(0, 10, 90, 100, 40, 50);
    this.affectedByDensity = true;
    this.affectedByLifetime = true;
  }

  canMoveThrough(other: Particle): boolean {
    return other.type !== this.type;
  }
}

export class WallParticle extends Particle {
  constructor() {
    super(ParticleType.Wall, ParticleClass.Solid);
    this.color = randomColorInHSLRange(0, 0, 5, 5, 25, 25);
  }
}

// Utility functions
export function randomColorInRange(min: number, max: number): Color {
  return {
    r: Math.random() * (max - min) + min,
    g: Math.random() * (max - min) + min,
    b: Math.random() * (max - min) + min,
    a: 1,
  };
}

export function randomColorInHSLRange(hueMin: number, hueMax: number, satMin: number, satMax: number, lightMin: number, lightMax: number): Color {
  const h = Math.random() * (hueMax - hueMin) + hueMin;
  const s = Math.random() * (satMax - satMin) + satMin;
  const l = Math.random() * (lightMax - lightMin) + lightMin;

  const rgb = hslToRgb(h / 360, s / 100, l / 100);

  return {
    r: rgb[0] / 255,
    g: rgb[1] / 255,
    b: rgb[2] / 255,
    a: 1,
  };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 3) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
