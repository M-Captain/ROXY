// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


contract SimpleAMM {
    IERC20 public token; 
    address public owner;
    AggregatorV3Interface internal priceFeed;


    uint256 public reserveETH;
    uint256 public reserveToken;

    constructor(address _token) {
        token = IERC20(_token); // Give KMC Token Contract Address
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);

    }

    // Add liquidity in 1 ETH : 10000 KMC ratio
    function addLiquidity(uint256 tokenAmount) external payable {
        require(msg.value * 3 == tokenAmount, "Must maintain 1:10000 ETH:KMC ratio");

        token.transferFrom(msg.sender, address(this), tokenAmount);

        reserveETH += msg.value;
        reserveToken += tokenAmount;
    }

    // Swap ETH for KMC
    function swapEthToToken() external payable {
        require(msg.value > 0, "Send ETH to swap");

        uint256 ethIn = msg.value;
        uint256 tokenOut = getOutputAmount(ethIn, reserveETH, reserveToken);

        require(tokenOut <= reserveToken, "Insufficient KMC in reserve");

        reserveETH += ethIn;
        reserveToken -= tokenOut;

        token.transfer(msg.sender, tokenOut);
    }
    // Get ETH Price
    function getETHPrice() internal  view returns  (int256) {
        (
            , 
            int256 price,
            ,
            ,
            
        ) = priceFeed.latestRoundData();
        return price;
    }
    // Get KMC Price
    function getTokenPrice() external view returns (int256) {
        int256 ethPrice = getETHPrice();
        return ethPrice / 10000;
    }

    // Get Token Amount
    function getTokenAmount(uint256 ethAmount) external view returns (uint256) {
        uint256 tokenAmount = getOutputAmount(ethAmount, reserveETH, reserveToken);
        return tokenAmount;
    }
    // Get ETH Amount
    function getETHAmount(uint256 tokenAmount) external view returns (uint256) {
        uint256 ethAmount = getOutputAmount(tokenAmount, reserveToken, reserveETH);
        return ethAmount;
    }

    // Swap KMC for ETH
    function swapTokenToEth(uint256 tokenIn) external {
        require(tokenIn > 0, "Send tokens to swap");

        uint256 ethOut = getOutputAmount(tokenIn, reserveToken, reserveETH);
        require(ethOut <= reserveETH, "Insufficient ETH in reserve");

        token.transferFrom(msg.sender, address(this), tokenIn);

        reserveToken += tokenIn;
        reserveETH -= ethOut;

        payable(msg.sender).transfer(ethOut);
    }

    // Core AMM formula for liquidity pool: x*y = k
    function getOutputAmount(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) internal pure returns (uint256) {
        uint256 inputAmountWithFee = inputAmount * 997; // 0.3% fee
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = inputReserve * 1000 + inputAmountWithFee;

        return numerator / denominator;
    }

    function getReserves() external view returns (uint256 ethReserve, uint256 tokenReserve) {
        return (reserveETH, reserveToken);
    }
}
