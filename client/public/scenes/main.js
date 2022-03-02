import { fetchAsBitmap } from "../utils.js";
import { Blob } from "../chip/index.js";
import { ethers } from "../libs/ethers-5.2.esm.min.js";
import scene from "./index.js";

async function signButtonBehavior(chip, button) {
  const hover = chip.utils.isCollision(
    {
      x: chip.mousePosition.x,
      y: chip.mousePosition.y,
      sprite: {
        height: 10,
        width: 10,
      },
    },
    button
  );

  if (hover) {
    button.sprite = button.hover;
    if (chip.mousedown.has("Left") && !button.state.signing) {
      chip.mousedown.delete("Left");
      button.state.signing = true;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const success = await provider
        .send("eth_requestAccounts", [])
        .then(() => true)
        .catch((err) => {
          return false;
        });
      if (success) {
        const signer = provider.getSigner();
        scene.selector(chip, provider, signer);
      }
      button.state.signing = false;
    }
  } else {
    button.sprite = button.notHover;
  }
}

async function main(chip) {
  chip.cleanup();
  chip.scene = "main";
  const titleBitmap = await fetchAsBitmap("/assets/title.png");
  const signButtonBitmap = await fetchAsBitmap(
    "/assets/sign_with_metamask.png"
  );
  const signButtonHoverBitmap = await fetchAsBitmap(
    "/assets/sign_with_metamask_hover.png"
  );
  const backgroundBitmap = await fetchAsBitmap("/assets/background.png");
  const title = new Blob("title", titleBitmap);
  const signButton = new Blob("signIn", signButtonBitmap, {
    signing: false,
  }).addBehavior(signButtonBehavior);
  signButton.notHover = signButtonBitmap;
  signButton.hover = signButtonHoverBitmap;
  const background = new Blob("background", backgroundBitmap);

  chip.spawn(background, 0, 0);
  chip.spawn(title, 300 - title.sprite.width / 2, 50);
  chip.spawn(signButton, 300 - signButton.sprite.width / 2, 330);
}

export default main;
