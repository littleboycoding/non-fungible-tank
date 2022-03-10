import scenes from "./scenes/index.js";

const particles = window.particlesJS;
let bgMusic = false;

const setup = async (chip) => {
  particles.load("background", "/particles/particles.json");
  const shoot = new Audio("/sfx/shoot.wav");
  const explosion = new Audio("/sfx/explosion.wav");
  const hurt = new Audio("/sfx/hitHurt.wav");
  const select = new Audio("/sfx/select.wav");
  chip.sfx = {
    explosion,
    hurt,
    select,
    shoot,
  };

  window.addEventListener("click", () => {
    if (!bgMusic) {
      const bg = new Audio("/sfx/lost_in_paradise_hackers.mp3");
      bg.loop = true;
      bg.volume = 0.1;
      bg.play();
      bgMusic = true;
    }
  });
  scenes.main(chip);
};

export default setup;
