// index.tsx
import MyScene from "./scene";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainComponent from "./components/MainComponent";
import FPSCounter from "./components/FpsComponent";

const interval = 10; // Update interval in milliseconds
const scene = new MyScene();

let frameCount = 0;
let fps = 0;
let lastFrameTime = performance.now();

function calculateFPS(time: number): void {
  frameCount++;
  const delta = time - lastFrameTime;

  if (delta >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFrameTime = time;
  }
}

function animate(time: number): void {
  requestAnimationFrame(animate);

  calculateFPS(time);

  if (time - lastFrameTime >= interval) {
    scene.update();
  }

  scene.render();
}

animate(0);

const App = () => {
  const getCurrentFPS = () => fps;

  return (
    <div>
      <MainComponent fps={0} />
      <FPSCounter getCurrentFPS={getCurrentFPS} />
    </div>
  );
};

// Initialize React root
const appElement = document.getElementById("app");
if (appElement) {
  const root = createRoot(appElement);
  root.render(<App />);
} else {
  console.error("No element with ID 'app' found in the DOM.");
}
