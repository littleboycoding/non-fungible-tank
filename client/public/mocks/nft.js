import faker from "https://unpkg.com/@faker-js/faker@6.0.0-alpha.7/dist/esm/index.js?module";

const Metadatas = [
  "/examples/everforest/metadata.json",
  "/examples/rocket_box/metadata.json",
  "/examples/morning_coffee/metadata.json",
  "/examples/auto_pilot/metadata.json",
  "/examples/flamethrower/metadata.json",
  "/examples/double/metadata.json",
  "/examples/giant/metadata.json",
];

/**
 * NFT Contract mockup for testing purpose.
 */
class NFT {
  balanceOf() {
    return Metadatas.length;
  }

  tokenURI(id) {
    return Metadatas[id];
  }

  tokenOfOwnerByIndex(_, index) {
    return index;
  }

  getFakeUserAddress() {
    return faker.finance.ethereumAddress();
  }

  getMockupNetworkName() {
    return "Borderland";
  }
}

export default NFT;
