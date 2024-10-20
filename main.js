
import * as THREE from "three";
import MyScene from "./src/scene";

let lastTime = 0;
const interval = 10; // 100 ms

const scene = new MyScene();

function animate(time) {
  // updateInput();
  requestAnimationFrame(animate);

  if (time - lastTime >= interval) {
    lastTime = time;
    scene.update();
  }

  // renderer.render(scene, camera);
  
  scene.render();
}
var xSpeed = 0.0001;
var ySpeed = 0.0001;

animate();
