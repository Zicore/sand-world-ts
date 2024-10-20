export class ParticleType {
  static OutOfBounds = { type: -1, name: "OutOfBounds" };
  static Air = { type: 0, name: "Air" };
  static Sand = { type: 1, name: "Sand" };
  static Water = { type: 2, name: "Water" };
}

export class Particle {
  constructor(type, color) {
    this.type = type;
    this.color = color;
    this.density = 1;
    this.affectedByDensity = true;
  }

  getColor() {
    return this.color;
  }

  getStartingColor() {
    return this.color;
  }

  static is(a, b) {
    if (a === undefined || b === undefined) {
      return false;
    }
    return a.type.type === b.type.type;
  }
}

export class OutOfBoundsParticle extends Particle {
  constructor() {
    super(ParticleType.OutOfBounds, { r: 0, g: 0, b: 0, a: 0 });
    this.affectedByDensity = false;
  }

  getColor() {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  static Instance = new OutOfBoundsParticle();
}

export class AirParticle extends Particle {
  constructor() {
    super(ParticleType.Air, { r: 0, g: 0, b: 0, a: 0 });
    this.affectedByDensity = false;
  }

  getColor() {
    return { r: 0.05, g: 0.05, b: 0.05, a: 0 };
  }
}

export class SandParticle extends Particle {
  constructor() {
    super(ParticleType.Sand, { r: 0, g: 0, b: 0, a: 0 });
    this.color =  randomColorInHSLRange(48, 50, 40, 70, 50, 80);
    this.density = 2;
  }
}

export class WaterParticle extends Particle {
  constructor() {
    super(ParticleType.Water, { r: 0, g: 0, b: 0, a: 0 });
    this.color = randomColorInHSLRange(210, 210, 90, 90, 25, 25);
  }
}

export function randomColorInRange(min, max) {
  return {
    r: Math.random() * (max - min) + min,
    g: Math.random() * (max - min) + min,
    b: Math.random() * (max - min) + min,
    a: 1,
  };
}

export function randomColorInHSLRange(hueMin, hueMax, satMin, satMax, lightMin, lightMax) {
  // Generate random HSL values within the provided ranges
  const h = Math.random() * (hueMax - hueMin) + hueMin;     // Hue: 0-360 degrees
  const s = Math.random() * (satMax - satMin) + satMin;     // Saturation: 0-100%
  const l = Math.random() * (lightMax - lightMin) + lightMin; // Lightness: 0-100%

  // Convert HSL to RGB
  const rgb = hslToRgb(h / 360, s / 100, l / 100);

  // Return the RGB values
  return {
    r: rgb[0] / 255,  // Normalize to [0, 1] range
    g: rgb[1] / 255,  // Normalize to [0, 1] range
    b: rgb[2] / 255,  // Normalize to [0, 1] range
    a: 1              // Set alpha to 1 (fully opaque)
  };
}

// Helper function: Convert HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // Achromatic (gray)
  } else {
    const hue2rgb = (p, q, t) => {
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
