// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BEP is ERC721, Ownable {
    address public minterContract;

    constructor(string memory _name, string memory _symbol) 
        ERC721(_name, _symbol)
        Ownable(msg.sender)  // Explicit owner initialization
    {}

    function setMinterContract(address _minterContract) external onlyOwner {
        minterContract = _minterContract;
    }

    function mint(address to, uint256 tokenId) public {
        require(msg.sender == minterContract, "Only minter contract can mint");
        _mint(to, tokenId);
    }
}
