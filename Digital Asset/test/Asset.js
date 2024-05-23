const {
    time,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");


describe("ArtAsset", function(){
    async function setup(){
        const [owner, user1, user2] = await ethers.getSigners();

        const ArtAsset = await ethers.getContractFactory("ArtAsset");
        const artAsset = await ArtAsset.deploy("ABC", "Binh", "No");
        return {artAsset, owner, user1, user2};
    }

    it("Return the correct details", async function(){
        const {artAsset, owner, user1} = await loadFixture(setup);

        await artAsset.connect(owner).transferOwnership(user1.address);

        const [name, newOwner] = await artAsset.getDetails();

        expect(newOwner).to.equal(user1.address);
    });
    it("Revert if the sender is not the owner", async function(){
        const {artAsset, owner, user1, user2} = await loadFixture(setup);

        await expect(artAsset.connect(user1).transferOwnership(user2.address))
        .to.be.revertedWith("Only owner can transfer ownership");
    });

    it("Return the correct information", async function(){
        const {artAsset, owner, user1} = await loadFixture(setup);

        const [ artist, describe, name,  ownerAddress ] = await artAsset.getInformation();
        
        expect(artist).to.equal("Binh");
        expect(describe).to.equal("No");
        expect(name).to.equal("ABC");
        expect(ownerAddress).to.equal(owner.address);
    });  
});

describe("MusicAsset", function(){
    async function setup(){
        const [owner, user1, user2] = await ethers.getSigners();

        const MusicAsset = await ethers.getContractFactory("MusicAsset");
        const musicAsset = await MusicAsset.deploy("ABC", "Binh", "Opera");
        return {musicAsset, owner, user1, user2};
    }

    it("Return the correct details", async function(){
        const {musicAsset, owner, user1} = await loadFixture(setup);

        await musicAsset.connect(owner).transferOwnership(user1.address);

        const [name, newOwner] = await musicAsset.getDetails();

        expect(newOwner).to.equal(user1.address);
    });
    it("Revert if the sender is not the owner", async function(){
        const {musicAsset, owner, user1, user2} = await loadFixture(setup);

        await expect(musicAsset.connect(user1).transferOwnership(user2.address))
        .to.be.revertedWith("Only owner can transfer ownership");
    });

    it("Return the correct information", async function(){
        const {musicAsset, owner, user1} = await loadFixture(setup);

        const [ author, category, name,  ownerAddress ] = await musicAsset.getInformation();
        
        expect(author).to.equal("Binh");
        expect(category).to.equal("Opera");
        expect(name).to.equal("ABC");
        expect(ownerAddress).to.equal(owner.address);
    });
     
});

describe("AssetFactory", function(){
    async function setup(){
        const [owner, user1, user2] = await ethers.getSigners();

        const AssetFactory = await ethers.getContractFactory("AssetFactory");
        const assetFactory = await AssetFactory.deploy();
        return {assetFactory, owner, user1, user2};
    }
    it("Create art asset correctly", async function(){
        const {assetFactory, owner, user1} = await loadFixture(setup);

        const tx = await assetFactory.connect(owner).createAsset(0, "XYZ", "Binh", "None");
        const receipt = await tx.wait();
        
        const newAddress = await assetFactory.assets(0);

        const [artist, describe, name, ownerAddress] = await assetFactory.connect(owner).getArt(newAddress);
        
        expect(artist).to.equal("Binh");
        expect(describe).to.equal("None");
        expect(name).to.equal("XYZ");
        expect(ownerAddress).to.equal(receipt.to);
    });

    it("Create music asset correctly", async function(){
        const {assetFactory, owner, user1} = await loadFixture(setup);

        const tx = await assetFactory.connect(owner).createAsset(1, "XYZ", "Binh", "None");
        const receipt = await tx.wait();
        
        const newAddress = await assetFactory.assets(0);

        const [artist, describe, name, ownerAddress] = await assetFactory.connect(owner).getMusic(newAddress);
        
        expect(artist).to.equal("Binh");
        expect(describe).to.equal("None");
        expect(name).to.equal("XYZ");
        expect(ownerAddress).to.equal(receipt.to);
    });
    
    it("Revert if invalid asset type", async function(){
        const {assetFactory, owner, user1} = await loadFixture(setup);
        
        await expect(assetFactory.connect(owner).createAsset(2, "XYZ", "Binh", "None"))
        .to.be.revertedWith("Invalid asset type");
    });
});
