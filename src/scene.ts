import * as THREE from "three";
import World from "./world";
import Input from "./input";

class MyScene {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  camera: THREE.OrthographicCamera;
  world: World;
  input: Input;
  zoom: number;

  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.canvas = this.renderer.domElement;
    this.zoom = 3.0;

    const aspect = 1;
    const frustumSize = 2;

    // Create an orthographic camera with the correct aspect ratio
    this.camera = new THREE.OrthographicCamera((-frustumSize * aspect) / 2, (frustumSize * aspect) / 2, frustumSize / 2, -frustumSize / 2, -1000, 1000);

    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 5;
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    this.camera.position.z = 0;

    // Create the world
    this.world = new World(this.scene);

    // Initialize the input
    this.input = new Input(this.canvas);

    // Add resize event listener
    window.addEventListener("resize", this.handleResize);

    this.handleResize();
  }
  // Method to handle resizing
  handleResize = () => {
    const aspect = 1;
    const frustumSize = 1;

    // Update camera properties
    this.camera.left = (-frustumSize * aspect) / 2;
    this.camera.right = (frustumSize * aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = -frustumSize / 2;
    this.camera.updateProjectionMatrix();

    // Update renderer size
    // this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.setSize(256, 256);

    this.renderer.domElement.style.width = `${256 * this.zoom}px`; // Scale width
    this.renderer.domElement.style.height = `${256 * this.zoom}px`; // Scale height
  };
  // Cleanup event listeners if necessary
  dispose(): void {
    window.removeEventListener("resize", this.handleResize);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  update(): void {
    this.input.placeParticle(this.world, this.camera);
    this.input.update();
    this.world.update();
  }
}

export default MyScene;
