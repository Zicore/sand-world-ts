import * as THREE from "three";
import World from "./world";
import Input from "./input";

class MyScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.canvas = this.renderer.domElement;

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 2; // This defines the size of the visible area at the camera's position

    // Create an orthographic camera with the correct aspect ratio
    this.camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2, // left
      (frustumSize * aspect) / 2, // right
      frustumSize / 2, // top
      -frustumSize / 2, // bottom
      -1000, // near
      1000 // far
    );

    // Position the camera slightly back
    this.camera.position.z = 5;
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    this.camera.position.z = 0;

    // Create the world
    this.world = new World(this.scene);

    // Initialize the input
    this.input = new Input(this.canvas);
  }

  getCanvas() {
    return this.canvas;
  }

  render(){
    this.renderer.render(this.scene, this.camera);
  }

  update(){
    this.input.placeParticle(this.world, this.camera); 
    this.input.update();   
    this.world.update();
  }
}

export default MyScene;