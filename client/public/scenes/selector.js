import { fetchAsBitmap } from "../utils.js";
import { Blob, BlobText } from "../chip/index.js";
import { buttonBehavior } from "../blob/behavior.js";
import { ethers } from "../libs/ethers-5.2.esm.min.js";
import scenes from "./index.js";

const TEST_URI = "/examples/everforest/metadata.json";
const NFT_ADDRESS = "0x19b87B22110142E6334E3eDa97313AacfeD2f3F2";
let nftContract;

function deployBehavior(chip, button, address) {
  if (button.hovering && chip.mousedown.has("Left")) {
    scenes.battleground(chip, address, chip.metadata);
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function navigateBehavior(
  preview,
  name,
  description,
  spinner,
  deploy,
  back,
  next
) {
  const fn = async (chip, button, num) => {
    const hover = chip.utils.isCollision(
      {
        x: chip.mousePosition.x,
        y: chip.mousePosition.y,
        sprite: {
          height: 5,
          width: 5,
        },
      },
      button
    );
    if (hover) {
      if (chip.mousedown.has("Left")) {
        chip.tankIndex += num;
        if (chip.tankIndex >= chip.totalTank) chip.tankIndex = 0;
        if (chip.tankIndex < 0) chip.tankIndex = chip.totalTank - 1;

        // Temporary hide
        preview.destroyed = true;
        name.destroyed = true;
        description.destroyed = true;
        deploy.destroyed = true;
        back.destroyed = true;
        next.destroyed = true;
        spinner.destroyed = false;

        const tokenId = await nftContract.tokenOfOwnerByIndex(
          await nftContract.signer.getAddress(),
          chip.tankIndex
        );
        const uri = await nftContract.tokenURI(tokenId);
        const [attribute] = await Promise.all([
          fetch(uri).then((res) => res.json()),
          wait(500), // prevent flicker
        ]);
        const sprite = await fetchAsBitmap(attribute.image);
        chip.metadata = uri;
        preview.sprite = sprite;
        name.text = attribute.name;
        description.text = attribute.description;
        preview.destroyed = false;
        name.destroyed = false;
        description.destroyed = false;
        deploy.destroyed = false;
        back.destroyed = false;
        next.destroyed = false;
        spinner.destroyed = true;
      }
    }
  };

  return fn;
}

async function main(chip, provider, signer) {
  chip.cleanup();
  chip.scene = "selector";
  chip.tankIndex = 0;

  const address = TEST_URI
    ? (Math.random() * 1000).toString()
    : await signer.getAddress();
  const network = await provider.getNetwork();

  const nftAbi = await fetch("/abi/NFT.json")
    .then((res) => res.json())
    .then((json) => json.abi);
  nftContract = new ethers.Contract(NFT_ADDRESS, nftAbi, signer);

  chip.totalTank = TEST_URI
    ? 1
    : parseInt(await nftContract.balanceOf(address));

  const Owner = new BlobText(
    "owner",
    "Address " + address.slice(0, 5) + "..." + address.slice(-5)
  );
  const Network = new BlobText(
    "owner",
    "Network " + network.name[0].toUpperCase() + network.name.slice(1)
  );

  Owner.fillStyle = "white";
  Owner.textAlign = "center";
  Owner.font = "24px Roboto";
  Network.fillStyle = "grey";
  Network.textAlign = "center";
  Network.font = "18px Roboto";

  const spinner = await fetchAsBitmap("/assets/spinner.png");
  const Spinner = new Blob("spinner", spinner).addBehavior((_, spinner) => {
    spinner.angle += 2;
  });
  Spinner.origin = {
    x: 40,
    y: 40,
  };

  chip.spawn(Owner, 300, 75);
  chip.spawn(Network, 300, 125);

  if (chip.totalTank <= 0) {
    const Helper = new BlobText(
      "helper",
      "You must own at least one tank to continue."
    );
    Helper.fillStyle = "red";
    Helper.textAlign = "center";
    Helper.font = "17px Roboto";
    chip.spawn(Helper, 300, 300);
    return;
  }

  chip.spawn(Spinner, 300 - spinner.width / 2, 300 - spinner.height / 2);

  const tokenId =
    !TEST_URI &&
    (await nftContract.tokenOfOwnerByIndex(address, chip.tankIndex));
  const uri = TEST_URI || (await nftContract.tokenURI(tokenId));

  const attribute = await fetch(uri).then((res) => res.json());
  chip.metadata = uri;
  const tank = await fetchAsBitmap(attribute.image);
  const Preview = new Blob("preview", tank).addBehavior((_, tank) => {
    tank.angle += 1.5;
  });
  Preview.origin = {
    x: tank.width / 2,
    y: tank.height / 2,
  };
  const Name = new BlobText("description", attribute.name);
  const Description = new BlobText("description", attribute.description);
  Name.fillStyle = "white";
  Name.textAlign = "center";
  Name.font = "19px Roboto";
  Description.fillStyle = "white";
  Description.textAlign = "center";
  Description.font = "15px Roboto";

  const deploy = await fetchAsBitmap("/assets/deploy.png");
  const deployHover = await fetchAsBitmap("/assets/deploy_hover.png");
  const Deploy = new Blob("deploy", deploy)
    .addBehavior(buttonBehavior)
    .addBehavior((chip, button) => deployBehavior(chip, button, address, uri));
  Deploy.hovering = true;
  Deploy.notHover = deploy;
  Deploy.hover = deployHover;
  const next = await fetchAsBitmap("/assets/next.png");
  const back = await fetchAsBitmap("/assets/back.png");
  const nextHover = await fetchAsBitmap("/assets/next_hover.png");
  const backHover = await fetchAsBitmap("/assets/back_hover.png");
  const Back = new Blob("back", back);
  const Next = new Blob("next", next);
  Back.hovering = true;
  Back.hover = backHover;
  Back.notHover = back;
  Next.hovering = true;
  Next.hover = nextHover;
  Next.notHover = next;
  const navigationFn = navigateBehavior(
    Preview,
    Name,
    Description,
    Spinner,
    Deploy,
    Back,
    Next
  );
  Back.addBehavior(buttonBehavior).addBehavior((chip, button) =>
    navigationFn(chip, button, -1)
  );
  Next.addBehavior(buttonBehavior).addBehavior((chip, button) =>
    navigationFn(chip, button, 1)
  );

  Spinner.destroyed = true;
  chip.spawn(Preview, 300 - tank.width / 2, 300 - tank.height / 2);
  chip.spawn(Name, 300, 40 + 300 + tank.height / 2);
  chip.spawn(Description, 300, 70 + 300 + tank.height / 2);
  chip.spawn(Deploy, 300 - deploy.width / 2, 525 - deploy.height);

  chip.spawn(Back, 300 - 5 - back.width, 90 + 300 + tank.height / 2);
  chip.spawn(Next, 300 + 5, 90 + 300 + tank.height / 2);
}

export default main;
