import { fetchAsBitmap } from "../utils.js";
import { Blob, BlobText } from "../chip/index.js";
import scenes from "./index.js";

const MOCK_TOKEN = ["/examples/everforest/metadata.json"];

function getAttributeFromMetadata(metadata) {
  return fetch(metadata).then((res) => res.json());
}

function deployBehavior(chip, button, address, metadata) {
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
    if (chip.mousedown.has("Left")) {
      scenes.battleground(chip, address, metadata);
    }
  } else {
    button.sprite = button.notHover;
  }
}

async function main(chip, provider, signer) {
  chip.cleanup();
  chip.scene = "selector";
  const backgroundBitmap = await fetchAsBitmap("/assets/background.png");
  const background = new Blob("background", backgroundBitmap);

  const address = await signer.getAddress();
  const network = await provider.getNetwork();
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

  const attribute = await getAttributeFromMetadata(MOCK_TOKEN[0]);
  const tank = await fetchAsBitmap(attribute.image);
  const Preview = new Blob("preview", tank).addBehavior((chip, tank) => {
    tank.angle += 1.5;
  });
  Preview.origin = {
    x: tank.width / 2,
    y: tank.height / 2,
  };
  const Name = new BlobText("description", attribute.name + " #0");
  const Description = new BlobText("description", attribute.description);
  Name.fillStyle = "white";
  Name.textAlign = "center";
  Name.font = "19px Roboto";
  Description.fillStyle = "white";
  Description.textAlign = "center";
  Description.font = "15px Roboto";

  const deploy = await fetchAsBitmap("/assets/deploy.png");
  const deployHover = await fetchAsBitmap("/assets/deploy_hover.png");
  const Deploy = new Blob("deploy", deploy).addBehavior((chip, button) =>
    deployBehavior(chip, button, address, MOCK_TOKEN[0])
  );
  Deploy.notHover = deploy;
  Deploy.hover = deployHover;

  chip.spawn(background, 0, 0);
  chip.spawn(Owner, 300, 100);
  chip.spawn(Network, 300, 150);
  chip.spawn(Preview, 300 - tank.width / 2, 300 - tank.height / 2);
  chip.spawn(Name, 300, 40 + 300 + tank.height / 2);
  chip.spawn(Description, 300, 70 + 300 + tank.height / 2);
  chip.spawn(Deploy, 300 - deploy.width / 2, 500 - deploy.height);
}

export default main;
