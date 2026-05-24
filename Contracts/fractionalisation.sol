// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Fractionalisation
 * @dev Converts BEP tokens to FCT tokens based on property valuation and KMC token price
 */
contract Fractionalisation is Ownable, ReentrancyGuard {
    // Interfaces
    interface IBEP is IERC721 {
        function mint(address to, uint256 tokenId) external;
    }

    interface IFCTMinter {
        function mint(address to, uint256 id, uint256 amount, bytes memory data) external;
    }

    interface IKMC is IERC20 {
        // Standard ERC20 interface
    }

    // Contract addresses
    IBEP public bepToken;
    IFCTMinter public fctToken;
    IKMC public kmcToken;
    address public propertyDetailsContract;

    // Fractionalisation state
    mapping(uint256 => bool) public isFractionalised; // BEP tokenId => isFractionalised
    mapping(uint256 => uint256) public bepToFctTokenId; // BEP tokenId => FCT tokenId
    mapping(uint256 => uint256) public fractionalisationAmount; // BEP tokenId => FCT amount minted

    // Events
    event FractionalisationRequested(uint256 indexed bepTokenId, address indexed owner);
    event FractionalisationCompleted(uint256 indexed bepTokenId, uint256 fctTokenId, uint256 fctAmount, uint256 propertyValuation, uint256 kmcPrice);
    event KMCPriceUpdated(uint256 newPrice);

    // Errors
    error TokenNotOwned(uint256 tokenId);
    error AlreadyFractionalised(uint256 tokenId);
    error InvalidPropertyValuation();
    error InvalidKMCPrice();
    error ConversionFailed();

    constructor(
        address _bepToken,
        address _fctToken,
        address _kmcToken,
        address _propertyDetailsContract,
        address initialOwner
    ) Ownable(initialOwner) {
        bepToken = IBEP(_bepToken);
        fctToken = IFCTMinter(_fctToken);
        kmcToken = IKMC(_kmcToken);
        propertyDetailsContract = _propertyDetailsContract;
    }

    /**
     * @dev Request fractionalisation of a BEP token
     * @param bepTokenId The BEP token ID to fractionalise
     */
    function requestFractionalisation(uint256 bepTokenId) external nonReentrant {
        // Check if user owns the BEP token
        if (bepToken.ownerOf(bepTokenId) != msg.sender) {
            revert TokenNotOwned(bepTokenId);
        }

        // Check if already fractionalised
        if (isFractionalised[bepTokenId]) {
            revert AlreadyFractionalised(bepTokenId);
        }

        emit FractionalisationRequested(bepTokenId, msg.sender);
    }

    /**
     * @dev Execute fractionalisation (can be called by owner or automated system)
     * @param bepTokenId The BEP token ID to fractionalise
     * @param propertyValuation The property valuation in USD (with 18 decimals)
     * @param kmcPrice The KMC token price in USD (with 18 decimals)
     */
    function executeFractionalisation(
        uint256 bepTokenId,
        uint256 propertyValuation,
        uint256 kmcPrice
    ) external onlyOwner nonReentrant {
        // Validate inputs
        if (propertyValuation == 0) revert InvalidPropertyValuation();
        if (kmcPrice == 0) revert InvalidKMCPrice();

        // Check if already fractionalised
        if (isFractionalised[bepTokenId]) {
            revert AlreadyFractionalised(bepTokenId);
        }

        // Calculate FCT amount based on property valuation and KMC price
        uint256 fctAmount = _calculateFCTAmount(propertyValuation, kmcPrice);
        
        if (fctAmount == 0) revert ConversionFailed();

        // Generate FCT token ID (can be same as BEP token ID or different)
        uint256 fctTokenId = bepTokenId;

        // Mint FCT tokens
        address bepOwner = bepToken.ownerOf(bepTokenId);
        fctToken.mint(bepOwner, fctTokenId, fctAmount, "");

        // Update state
        isFractionalised[bepTokenId] = true;
        bepToFctTokenId[bepTokenId] = fctTokenId;
        fractionalisationAmount[bepTokenId] = fctAmount;

        emit FractionalisationCompleted(bepTokenId, fctTokenId, fctAmount, propertyValuation, kmcPrice);
    }

    /**
     * @dev Calculate FCT amount based on property valuation and KMC price
     * @param propertyValuation Property valuation in USD (18 decimals)
     * @param kmcPrice KMC token price in USD (18 decimals)
     * @return fctAmount The amount of FCT tokens to mint
     */
    function _calculateFCTAmount(uint256 propertyValuation, uint256 kmcPrice) internal pure returns (uint256) {
        // Formula: FCT Amount = Property Valuation / KMC Price
        // This gives us how many KMC tokens the property is worth
        // We then mint that many FCT tokens (1:1 ratio with KMC value)
        
        // Use 18 decimals for precision
        uint256 decimals = 1e18;
        
        // Calculate: (propertyValuation * decimals) / kmcPrice
        return (propertyValuation * decimals) / kmcPrice;
    }

    /**
     * @dev Get fractionalisation details for a BEP token
     * @param bepTokenId The BEP token ID
     * @return isFractionalised_ Whether the token is fractionalised
     * @return fctTokenId The corresponding FCT token ID
     * @return fctAmount The amount of FCT tokens minted
     */
    function getFractionalisationDetails(uint256 bepTokenId) external view returns (
        bool isFractionalised_,
        uint256 fctTokenId,
        uint256 fctAmount
    ) {
        isFractionalised_ = isFractionalised[bepTokenId];
        fctTokenId = bepToFctTokenId[bepTokenId];
        fctAmount = fractionalisationAmount[bepTokenId];
    }

    /**
     * @dev Calculate FCT amount for a given property valuation and KMC price (view function)
     * @param propertyValuation Property valuation in USD (18 decimals)
     * @param kmcPrice KMC token price in USD (18 decimals)
     * @return fctAmount The calculated FCT amount
     */
    function calculateFCTAmount(uint256 propertyValuation, uint256 kmcPrice) external pure returns (uint256) {
        return _calculateFCTAmount(propertyValuation, kmcPrice);
    }

    /**
     * @dev Batch fractionalisation for multiple BEP tokens
     * @param bepTokenIds Array of BEP token IDs
     * @param propertyValuations Array of property valuations
     * @param kmcPrice KMC token price (same for all)
     */
    function batchFractionalisation(
        uint256[] memory bepTokenIds,
        uint256[] memory propertyValuations,
        uint256 kmcPrice
    ) external onlyOwner nonReentrant {
        require(bepTokenIds.length == propertyValuations.length, "Arrays length mismatch");
        require(kmcPrice > 0, "Invalid KMC price");

        for (uint256 i = 0; i < bepTokenIds.length; i++) {
            if (!isFractionalised[bepTokenIds[i]]) {
                executeFractionalisation(bepTokenIds[i], propertyValuations[i], kmcPrice);
            }
        }
    }

    /**
     * @dev Update contract addresses (only owner)
     */
    function updateContracts(
        address _bepToken,
        address _fctToken,
        address _kmcToken,
        address _propertyDetailsContract
    ) external onlyOwner {
        if (_bepToken != address(0)) bepToken = IBEP(_bepToken);
        if (_fctToken != address(0)) fctToken = IFCTMinter(_fctToken);
        if (_kmcToken != address(0)) kmcToken = IKMC(_kmcToken);
        if (_propertyDetailsContract != address(0)) propertyDetailsContract = _propertyDetailsContract;
    }

    /**
     * @dev Emergency function to mark token as fractionalised (only owner)
     */
    function emergencyMarkFractionalised(
        uint256 bepTokenId,
        uint256 fctTokenId,
        uint256 fctAmount
    ) external onlyOwner {
        isFractionalised[bepTokenId] = true;
        bepToFctTokenId[bepTokenId] = fctTokenId;
        fractionalisationAmount[bepTokenId] = fctAmount;
    }
} 