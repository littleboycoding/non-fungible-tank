import { fetchAsBitmap } from "../utils.js";
import { Blob } from "../chip/index.js";
import { ethers } from "../libs/ethers-5.2.esm.min.js";
import scene from "./index.js";
import { buttonBehavior } from "../blob/behavior.js";

async function signButtonBehavior(chip, button) {
  if (button.hovering && chip.mousedown.has("Left") && !button.state.signing) {
    chip.mousedown.delete("Left");
    button.state.signing = true;
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const success = await provider
      .send("eth_requestAccounts", [])
      .then(() => true)
      .catch((_) => {
        return false;
      });
    if (success) {
      const signer = provider.getSigner();
      provider.on("network", (_, oldNetwork) => {
        if (oldNetwork) window.location.reload();
      });
      scene.selector(chip, provider, signer);
    } else {
      button.state.signing = false;
    }
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
  const title = new Blob("title", titleBitmap);
  const signButton = new Blob("signIn", signButtonBitmap, {
    signing: false,
  })
    .addBehavior(buttonBehavior)
    .addBehavior(signButtonBehavior);
  signButton.notHover = signButtonBitmap;
  signButton.hover = signButtonHoverBitmap;

  chip.spawn(title, 300 - title.sprite.width / 2, 50);
  chip.spawn(signButton, 300 - signButton.sprite.width / 2, 330);
}

export default main;
