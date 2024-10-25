import { Camera, Vector2, Vector3 } from "three";
import { Particle, SandParticle, WaterParticle, AirParticle, WallParticle, FireParticle } from "./particle";
import World from "./world";

class Input {
  isMouseLeftDown: boolean;
  keysDown: Record<string, boolean>;
  keysPressed: Record<string, boolean>;
  canvas: HTMLCanvasElement;
  mousePosition: Vector2;
  mouseMoved: boolean;
  selectedParticle: Particle;

  constructor(canvas: HTMLCanvasElement) {
    this.isMouseLeftDown = false;
    this.keysDown = {};
    this.keysPressed = {};
    this.canvas = canvas;
    this.mousePosition = new Vector2();
    this.mouseMoved = false;
    this.selectedParticle = new SandParticle();

    this.initialize(canvas);
  }

  initialize(canvas: HTMLCanvasElement): void {
    document.addEventListener("keydown", (event) => {
      this.keysDown[event.key.toLowerCase()] = true;
      this.keysPressed[event.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (event) => {
      this.keysDown[event.key.toLowerCase()] = false;
    });

    canvas.addEventListener("mousemove", (event) => {
      const rect = this.canvas.getBoundingClientRect();

      // Calculate mouse position in normalized device coordinates (NDC) ranging from 0 to 1
      this.mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mousePosition.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      this.mouseMoved = true;
    });

    document.addEventListener("mousedown", () => {
      this.isMouseLeftDown = true;
    });

    document.addEventListener("mouseup", () => {
      this.isMouseLeftDown = false;
    });
  }

  placeParticle(world: World, camera: Camera, brushSize = 2): void {
    const { gridX, gridY } = this.getGridPosition(world, camera);
    if (!this.isMouseLeftDown) return;

    for (let x = -brushSize; x <= brushSize; x++) {
      for (let y = -brushSize; y <= brushSize; y++) {
        world.setParticle(gridX + x, gridY + y, this.createParticle());
      }
    }
  }

  createParticle(): Particle {
    if (this.selectedParticle instanceof SandParticle) {
      return new SandParticle();
    } else if (this.selectedParticle instanceof WaterParticle) {
      return new WaterParticle();
    } else if (this.selectedParticle instanceof AirParticle) {
      return new AirParticle();
    } else if (this.selectedParticle instanceof WallParticle) {
      return new WallParticle();
    } else if (this.selectedParticle instanceof FireParticle) {
      return new FireParticle();
    }
    throw new Error("Unknown particle type");
  }

  getGridPosition(world: World, camera: Camera): { gridX: number; gridY: number } {
    // Step 1: Create a Vector3 representing the normalized mouse position in WebGL coordinates (-1 to 1 range)
    const mouseVector = new Vector3(this.mousePosition.x, this.mousePosition.y, 0);
    mouseVector.unproject(camera);
  
    // Step 2: Offset the world coordinates to match the grid size.
    // Assuming the camera is centered around (0,0) and the grid origin is at the bottom-left corner.
    const worldX = mouseVector.x + 0.5;
    const worldY = mouseVector.y + 0.5;
  
    // Step 3: Map world coordinates to grid coordinates.
    // Use world dimensions (or any offset you need) to fit the grid scale
    const gridX = Math.floor(worldX * world.getChunkWidth());
    const gridY = Math.floor(worldY * world.getChunkHeight());
  
    return { gridX, gridY };
  }
  

  update(): void {
    if (this.keysPressed["s"]) {
      this.selectedParticle = new SandParticle();
    }

    if (this.keysPressed["w"]) {
      this.selectedParticle = new WaterParticle();
    }

    if (this.keysPressed["q"]) {
      this.selectedParticle = new WallParticle();
    }

    if (this.keysPressed["a"]) {
      this.selectedParticle = new AirParticle();
    }

    if (this.keysPressed["f"]) {
      this.selectedParticle = new FireParticle();
    }

    this.keysPressed = {};
  }
}

export default Input;
