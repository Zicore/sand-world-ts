import * as THREE from "three";
import { SandParticle, WaterParticle } from "./particle.js";

class Input {
  constructor(canvas) {
    this.isMouseLeftDown = false;
    this.keysDown = {};
    this.keysPressed = {};
    this.canvas = canvas;
    this.mousePosition = new THREE.Vector2();
    this.mouseMoved = false;
    this.selectedParticle = new SandParticle();

    this.mousePositionDiv = document.getElementById("mousePosition");

    this.initialize(canvas);
  }

  initialize(canvas) {
    // Event-Listener für Tastaturereignisse hinzufügen
    document.addEventListener("keydown", (event) => {
      this.keysDown[event.key.toLowerCase()] = true; // Verwenden Sie Kleinbuchstaben für die Schlüsselverfolgung
      this.keysPressed[event.key.toLowerCase()] = true;
      console.log(`Key down: ${event.key}`);
    });

    document.addEventListener("keyup", (event) => {
      this.keysDown[event.key.toLowerCase()] = false; // Verwenden Sie Kleinbuchstaben für die Schlüsselverfolgung
      console.log(`Key up: ${event.key}`);
    });

    canvas.addEventListener("mousemove", (event) => {
      this.mousePosition.x = event.clientX / window.innerWidth;
      this.mousePosition.y = -(event.clientY / window.innerHeight);
      this.mouseMoved = true; // Flag to check if the mouse moved

      this.mousePositionDiv.innerHTML = `Mouse: (${this.mousePosition.x.toFixed(
        2
      )}, ${this.mousePosition.y.toFixed(2)}) LeftDown: ${
        this.isMouseLeftDown
      }`;
    });

    canvas.addEventListener("mousedown", (event) => {
      this.isMouseLeftDown = true;
    });

    canvas.addEventListener("mouseup", (event) => {
      this.isMouseLeftDown = false;
    });
  }

  placeParticle(world, camera, brushSize = 2) {
    const { gridX, gridY } = this.getGridPosition(world, camera);
    const particle = world.getParticle(gridX, gridY);
    const chunk = world.getChunk(gridX, gridY);

    if (chunk !== undefined) {
      document.getElementById(
        "gridPosition"
      ).innerHTML = `Grid: (${gridX}, ${gridY}), Chunk: (${chunk.position.x}, ${chunk.position.y})`;
    }

    if (particle !== undefined) {
      document.getElementById(
        "particle"
      ).innerHTML = `Particle: ${particle.type.name}`;
    }

    if (!this.isMouseLeftDown) return;



    for (let x = -brushSize; x <= brushSize; x++) {
      //world.setParticle(gridX, gridY, new WaterParticle());
      for (let y = -brushSize; y <= brushSize; y++) {
        world.setParticle(gridX + x, gridY + y, this.selectedParticle);
      }
    }
  }

  getGridPosition(world, camera) {
    const mouseVector = new THREE.Vector3(
      this.mousePosition.x * 2 - 1,
      this.mousePosition.y * 2 + 1,
      0
    );
    mouseVector.unproject(camera);

    const unitScale = 1; // The size of your cube is 1 unit

    const localX = mouseVector.x + unitScale / unitScale; // Normalize X to [0, 1] within the cube
    const localY = mouseVector.y + unitScale / unitScale; // Normalize Y to [0, 1] within the cube

    // Calculate the grid position
    const gridX = Math.floor(localX * world.getChunkWidth());
    const gridY = Math.floor(localY * world.getChunkHeight());

    return { gridX, gridY };
  }

  update() {
    if(this.keysPressed['s']) {
      this.selectedParticle = new SandParticle();
    }

    if(this.keysPressed['w']) {
      this.selectedParticle = new WaterParticle();
    }

    // Überprüfen des Tastaturzustands
    // if (keysDown['arrowup'] || keysDown['w']) {
    //     cube.position.y += 0.1;
    // }
    // if (keysDown['arrowdown'] || keysDown['s']) {
    //     cube.position.y -= 0.1;
    // }
    // if (keysDown['arrowleft'] || keysDown['a']) {
    //     cube.position.x -= 0.1;
    // }
    // if (keysDown['arrowright'] || keysDown['d']) {
    //     cube.position.x += 0.1;
    // }

    // Reset the keysPressedThisFrame object
    this.keysPressed = {};
  }
}

export default Input;
