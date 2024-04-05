// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

interface iDigitalAsset {
    function getDetails() external view returns(string memory name, address owner);
    function transferOwnership(address newOwner) external;
}

abstract contract abstractAsset is iDigitalAsset{
    string name;
    address owner;
    constructor(){
        owner = msg.sender;
    }

    function getDetails() external view override returns(string memory , address ){
        return(name, owner);
    }
    function transferOwnership(address newOwner) external virtual override;
}

contract artAsset is abstractAsset{
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
}
contract musicAsset is abstractAsset{
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
}

contract assetFactory {
    enum assetType {art, music}
    uint256 private assetCount;


    mapping(uint256 => address) public assets;

    function createAsset(assetType _type, string memory _name, string memory _artistOrAuthor, string memory _describeOrcategory) external {
        address newAsset;
        if (_type == assetType.art) {
            newAsset = address(new artAsset(_name, _artistOrAuthor, _describeOrcategory));
        } 
        else if (_type == assetType.music) {
            newAsset = address(new musicAsset(_name, _artistOrAuthor, _describeOrcategory));
        } 
        else {
            revert("Invalid asset type");
        }

        uint256 id = assetCount; 
        assetCount++;
        assets[id] = newAsset;
    }
    

}
