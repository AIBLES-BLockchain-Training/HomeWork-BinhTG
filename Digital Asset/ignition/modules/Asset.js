const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AssetModule",(m) => {
    const ArtAsset = m.contract("ArtAsset", ["ABC", "Binh", "None"]);

    const MusicAsset = m.contract("MusicAsset", ["ABC", "Binh", "None"]);

    const AssetFactory = m.contract("AssetFactory", []);

    return { ArtAsset, MusicAsset, AssetFactory};
});

// ArtAsset: 0x861A75Ee69c74Ded49F3C17477dC21e71F0F6402
// MusicAsset: 0xC7a9a59a147628fc22442Ff7585FeF64D0047b0c
// AssetFactory: 0x94C43134594D776DdDA4959F4fC1b937E49387C3