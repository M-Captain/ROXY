// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FCT is ERC1155, Ownable {
    string public name = "FractionalisationToken";
    string public symbol = "FCT";

    address public minterContract;

    constructor(string memory uri) ERC1155(uri) {}

    function setMinterContract(address _minterContract) external onlyOwner {
        minterContract = _minterContract;
    }

    function mint(address to, uint256 id, uint256 amount, bytes memory data) public {
        require(msg.sender == minterContract, "Only the designated contract can mint");
        _mint(to, id, amount, data);
    }

} 