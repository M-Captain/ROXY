// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title PropertyManager
 * @dev Consolidated NFT property manager with Chainlink Functions for Rentcast API verification
 */
contract PropertyManager is ERC721URIStorage, Ownable, ReentrancyGuard, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    // Counter for token IDs
    uint256 private _tokenIds;

    // Chainlink Functions configuration
    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public gasLimit = 300000;
    
    // Testing mode to bypass Chainlink Functions for local testing
    bool public testingMode;

    // Property structure
    struct Property {
        string username;
        string propertyAddress;
        uint256 expectedRent;
        uint256 aiScore;
        bool verified;
        uint256 valuationUSD;
        uint256 timestamp;
        string ipfsHash;
        bool valuationFetched;
        address owner;
        uint256 lastUpdated;
    }

    // State mappings
    mapping(uint256 => Property) public properties;
    mapping(bytes32 => uint256) public requestIdToTokenId;
    mapping(string => bool) public propertyAddressExists;
    mapping(address => uint256[]) public ownerToProperties;

    // Events
    event PropertySubmitted(uint256 indexed tokenId, address indexed owner, string propertyAddress);
    event ValuationRequested(uint256 indexed tokenId, bytes32 requestId);
    event PropertyMinted(uint256 indexed tokenId, uint256 valuationUSD, uint256 aiScore);
    event ValuationUpdated(uint256 indexed tokenId, uint256 newValuation);

    // Errors
    error PropertyAlreadyExists(string propertyAddress);
    error InvalidAIScore(uint256 score);
    error InvalidPropertyData();
    error PropertyNotFound(uint256 tokenId);
    error UnauthorizedUpdate();

    constructor(
        address functionsRouter,
        bytes32 _donId,
        uint64 _subscriptionId,
        address initialOwner
    ) 
        ERC721("BedrockEstateProperty", "BEP") 
        Ownable(initialOwner) 
        FunctionsClient(functionsRouter)
    {
        donId = _donId;
        subscriptionId = _subscriptionId;
        testingMode = false;
    }

    /**
     * @dev Submit property after AI verification passes
     */
    function submitVerifiedProperty(
        string memory username,
        string memory propertyAddress,
        uint256 expectedRent,
        uint256 aiScore,
        string memory ipfsHash
    ) external nonReentrant returns (uint256) {
        // Validations
        if (aiScore < 80) revert InvalidAIScore(aiScore);
        if (bytes(username).length == 0 || bytes(propertyAddress).length == 0) {
            revert InvalidPropertyData();
        }
        if (propertyAddressExists[propertyAddress]) {
            revert PropertyAlreadyExists(propertyAddress);
        }

        // Increment token ID
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        // Create property struct
        properties[newTokenId] = Property({
            username: username,
            propertyAddress: propertyAddress,
            expectedRent: expectedRent,
            aiScore: aiScore,
            verified: true,
            valuationUSD: 0,
            timestamp: block.timestamp,
            ipfsHash: ipfsHash,
            valuationFetched: false,
            owner: msg.sender,
            lastUpdated: 0
        });

        // Mark address as existing and add to owner's properties
        propertyAddressExists[propertyAddress] = true;
        ownerToProperties[msg.sender].push(newTokenId);

        emit PropertySubmitted(newTokenId, msg.sender, propertyAddress);

        // Trigger Chainlink Functions or use mock data in testing
        if (testingMode) {
            _setMockValuation(newTokenId);
        } else {
            _requestValuation(newTokenId);
        }

        return newTokenId;
    }

    /**
     * @dev Internal function to request property valuation via Chainlink Functions
     */
    function _requestValuation(uint256 tokenId) internal {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(_getChainlinkFunctionsJS());

        // Set arguments: [propertyId, expectedOwnerName]
        string[] memory args = new string[](2);
        args[0] = properties[tokenId].propertyAddress;
        args[1] = properties[tokenId].username;
        req.setArgs(args);

        // Send request
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );

        requestIdToTokenId[requestId] = tokenId;
        emit ValuationRequested(tokenId, requestId);
    }

    /**
     * @dev Chainlink Functions callback
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        uint256 tokenId = requestIdToTokenId[requestId];
        if (tokenId == 0) return;
        if (properties[tokenId].valuationFetched) return;
        if (err.length > 0) return;

        // Check if owner name matched (response is 1)
        uint256 isMatch = 0;
        if (response.length >= 32) {
            assembly {
                isMatch := mload(add(response, 32))
            }
        }

        if (isMatch == 1) {
            // Owner name matches - mint NFT
            properties[tokenId].valuationFetched = true;
            properties[tokenId].lastUpdated = block.timestamp;
            
            // Generate deterministic valuation based on expected rent
            uint256 multiplier = 18; // 18x annual rent
            properties[tokenId].valuationUSD = properties[tokenId].expectedRent * 12 * multiplier;
            
            address propertyOwner = properties[tokenId].owner;
            _mint(propertyOwner, tokenId);
            string memory tokenUri = string(abi.encodePacked("ipfs://", properties[tokenId].ipfsHash));
            _setTokenURI(tokenId, tokenUri);
            
            emit PropertyMinted(tokenId, properties[tokenId].valuationUSD, properties[tokenId].aiScore);
        }
        // If no match, NFT is not minted
    }

    /**
     * @dev Get the embedded Chainlink Functions JavaScript code
     */
    function _getChainlinkFunctionsJS() internal pure returns (string memory) {
        return
            "// Chainlink Functions JS for Rentcast API owner verification\n"
            "const propertyId = args[0];\n"
            "const expectedOwnerName = args[1];\n"
            "const apiKey = secrets.RENTCAST_API_KEY;\n"
            "\n"
            "if (!apiKey) {\n"
            "  throw new Error('RENTCAST_API_KEY not found in secrets');\n"
            "}\n"
            "\n"
            "const url = `https://api.rentcast.io/v1/properties/${encodeURIComponent(propertyId)}`;\n"
            "\n"
            "const response = await Functions.makeHttpRequest({\n"
            "  url: url,\n"
            "  method: 'GET',\n"
            "  headers: {\n"
            "    'accept': 'application/json',\n"
            "    'X-Api-Key': apiKey\n"
            "  }\n"
            "});\n"
            "\n"
            "if (!response || response.error) {\n"
            "  throw new Error(`API request failed: ${response ? response.error : 'Unknown error'}`);\n"
            "}\n"
            "\n"
            "if (!response.data) {\n"
            "  return Functions.encodeUint256(0); // Property not found\n"
            "}\n"
            "\n"
            "// Extract owner name from response\n"
            "const ownerName = response.data.owner?.names?.[0] || '';\n"
            "\n"
            "// Compare names (case-insensitive)\n"
            "const isMatch = ownerName.toLowerCase().trim() === expectedOwnerName.toLowerCase().trim();\n"
            "\n"
            "return Functions.encodeUint256(isMatch ? 1 : 0);";
    }

    /**
     * @dev Set mock valuation for testing mode
     */
    function _setMockValuation(uint256 tokenId) internal {
        Property storage property = properties[tokenId];
        
        // Generate deterministic mock valuation
        uint256 multiplier = 18; // 18x annual rent
        uint256 mockValuation = property.expectedRent * 12 * multiplier;
        
        // Set mock data
        property.valuationUSD = mockValuation;
        property.valuationFetched = true;
        property.lastUpdated = block.timestamp;
        
        // Mint NFT immediately in testing mode
        _mint(property.owner, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", property.ipfsHash)));
        
        emit PropertyMinted(tokenId, property.valuationUSD, property.aiScore);
    }

    /**
     * @dev Enable/disable testing mode (only owner)
     */
    function setTestingMode(bool _testingMode) external onlyOwner {
        testingMode = _testingMode;
    }

    /**
     * @dev Get the Chainlink Functions JavaScript code (for debugging)
     */
    function getChainlinkFunctionsJS() external pure returns (string memory) {
        return _getChainlinkFunctionsJS();
    }

    /**
     * @dev Update property valuation
     */
    function updateValuation(uint256 tokenId) external nonReentrant {
        if (_ownerOf(tokenId) == address(0)) revert PropertyNotFound(tokenId);
        
        address tokenOwner = ownerOf(tokenId);
        if (msg.sender != tokenOwner && msg.sender != owner()) {
            revert UnauthorizedUpdate();
        }

        // Reset valuation status and request new valuation
        properties[tokenId].valuationFetched = false;
        _requestValuation(tokenId);
    }

    /**
     * @dev Get property details
     */
    function getProperty(uint256 tokenId) external view returns (Property memory) {
        if (_ownerOf(tokenId) == address(0)) revert PropertyNotFound(tokenId);
        return properties[tokenId];
    }

    /**
     * @dev Get properties owned by an address
     */
    function getPropertiesByOwner(address owner) external view returns (uint256[] memory) {
        return ownerToProperties[owner];
    }

    /**
     * @dev Get current token ID counter
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Check if property address already exists
     */
    function doesPropertyExist(string memory propertyAddress) external view returns (bool) {
        return propertyAddressExists[propertyAddress];
    }

    /**
     * @dev Update Chainlink configuration (only owner)
     */
    function updateChainlinkConfig(
        bytes32 _donId,
        uint64 _subscriptionId,
        uint32 _gasLimit
    ) external onlyOwner {
        donId = _donId;
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;
    }

    /**
     * @dev Emergency function to manually set valuation (only owner)
     */
    function setValuationManually(
        uint256 tokenId,
        uint256 valuationUSD
    ) external onlyOwner {
        if (_ownerOf(tokenId) == address(0)) revert PropertyNotFound(tokenId);
        
        properties[tokenId].valuationUSD = valuationUSD;
        properties[tokenId].valuationFetched = true;
        properties[tokenId].lastUpdated = block.timestamp;

        emit ValuationUpdated(tokenId, valuationUSD);
    }
}