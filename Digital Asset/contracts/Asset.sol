// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

interface IDigitalAsset {
    function getDetails() external view returns(string memory name, address owner);
    function transferOwnership(address newOwner) external;
}

abstract contract AbstractAsset is IDigitalAsset{
    string name;
    address owner;

    constructor(){
        owner = msg.sender;
    }

    function getDetails() external view override returns(string memory , address ){
        return(name, owner);
    }
    function transferOwnership(address newOwner) external virtual override {
        require(msg.sender == owner,"Only owner can transfer ownership");
        owner = newOwner;
    }
}
contract ArtAsset is AbstractAsset{
    string artist;
    string describe;


    constructor(string memory _name, string memory _artist, string memory _describe) {
        name = _name;
        artist = _artist;
        describe = _describe;
    }
    function transferOwnership(address newOwner) external override{
        require(msg.sender == owner,"Only owner can transfer ownership");
        owner = newOwner;
    }
    function getInformation() public view returns(string memory, string memory, string memory, address){
        return (artist, describe, name, owner);
    }
}
contract MusicAsset is AbstractAsset{
    string author;
    string category;

    constructor(string memory _name, string memory _author, string memory _category) {
        name = _name;
        author = _author;
        category = _category;
    }
    function transferOwnership(address newOwner) external override{
        require(msg.sender == owner,"Only owner can transfer ownership");
        owner = newOwner;
    }
    function getInformation() public view returns(string memory, string memory, string memory, address){
        return (author, category, name, owner);
    }
}

contract AssetFactory {
    enum assetType {art, music}
    uint256 private assetCount;

    mapping(uint256 => address) public assets;

    function createAsset(assetType _type, string memory _name, string memory _artistOrAuthor, string memory _describeOrcategory) external{
        address newAsset;

        require(_type == assetType.art || _type == assetType.music , "Invalid asset type");

        if (_type == assetType.art) {
            newAsset = address(new ArtAsset(_name, _artistOrAuthor, _describeOrcategory));
        } 
        else{
            newAsset = address(new MusicAsset(_name, _artistOrAuthor, _describeOrcategory));
        }
        uint256 id = assetCount; 
        assetCount++;
        assets[id] = newAsset;

    }
    function getArt(address _artAssetAddress) external view returns (string memory, string memory, string memory, address) {
        ArtAsset artAsset = ArtAsset(_artAssetAddress);
        return artAsset.getInformation();
    }

    function getMusic(address _musicAssetAddress) external view returns (string memory, string memory, string memory, address) {
        MusicAsset musicAsset = MusicAsset(_musicAssetAddress);
        return musicAsset.getInformation();
    }
}
