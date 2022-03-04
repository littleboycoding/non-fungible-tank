import scenes from "./scenes/index.js";

const particles = window.particlesJS;

const setup = async (chip) => {
  particles.load("background", "/particles/particles.json");
  scenes.main(chip);
};

export default setup;
