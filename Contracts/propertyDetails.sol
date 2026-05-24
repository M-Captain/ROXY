// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatibleInterface.sol";

// Remove the Counters import - it's deprecated in v5.0

interface IFCT {
    function mint(address to, uint256 id, uint256 amount, bytes memory data) external;
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) external;
}
interface IBEP {
    function mint(address to, uint256 id) external;
}

contract RealEstateListing is Ownable, ReentrancyGuard, FunctionsClient, AutomationCompatibleInterface {
    // Replace Counters with a simple uint256
    uint256 private _propertyIds;
    IERC20 public token; 
    IFCT public fctContract;
    IBEP public bepContract;
    using FunctionsRequest for FunctionsRequest.Request;
    
    struct Property {
        uint256 id;
        address owner;
        string location;
        string description;
        uint256 price;
        uint256 totalShares;
        uint256 availableShares;
        bool isActive;
        string metadataURI;
        uint256 createdAt;
    }
    
    struct Ownership {
        address owner;
        uint256 shares;
        uint256 purchasePrice;
        uint256 purchaseDate;
    }
    
    mapping(uint256 => Property) public properties;
    mapping(uint256 => mapping(address => Ownership)) public propertyOwnerships;
    mapping(uint256 => address[]) public propertyOwners;
    mapping(address => uint256[]) public ownerProperties;
    
    // Events remain the same...
    event PropertyListed(
        uint256 indexed propertyId,
        address indexed owner,
        string location,
        uint256 price,
        uint256 totalShares
    );
    
    event SharesPurchased(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 shares,
        uint256 price
    );
    
    event SharesSold(
        uint256 indexed propertyId,
        address indexed seller,
        uint256 shares,
        uint256 price,
        uint256 fee
    );
    
    // FIXED: Proper constructor with Ownable initialization
    constructor(address _fctContract, address _bepContract, address _token) Ownable(msg.sender) {
        fctContract = IFCT(_fctContract);
        bepContract= IBEP(_bepContract);
        token = IERC20(_token);
        _propertyIds = 0; // Initialize counter
    }
    
    
    modifier propertyExists(uint256 _propertyId) {
        require(_propertyId > 0 && _propertyId <= _propertyIds, "Property does not exist");
        _;
    }
    
    function listProperty(string memory _location, string memory _description, uint256 _price, uint256 _totalShares, string memory _metadataURI) external returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        require(_totalShares > 0, "Total shares must be greater than 0");
        require(bytes(_location).length > 0, "Location cannot be empty");
        
        // Replace Counters.increment() with simple increment
        _propertyIds++;
        uint256 newPropertyId = _propertyIds;
        
        properties[newPropertyId] = Property({
            id: newPropertyId,
            owner: msg.sender,
            location: _location,
            description: _description,
            price: _price,
            totalShares: _totalShares,
            availableShares: _totalShares,
            isActive: true,
            metadataURI: _metadataURI,
            createdAt: block.timestamp
        });
        
        // Initialize ownership
        propertyOwnerships[newPropertyId][msg.sender] = Ownership({
            owner: msg.sender,
            shares: _totalShares,
            purchasePrice: 0,
            purchaseDate: block.timestamp
        });
        
        propertyOwners[newPropertyId].push(msg.sender);
        ownerProperties[msg.sender].push(newPropertyId);
        
        // Mint FCT tokens
        fctContract.mint(msg.sender, newPropertyId, _totalShares, "");
        bepContract.mint(msg.sender, newPropertyId);
        
        emit PropertyListed(newPropertyId, msg.sender, _location, _price, _totalShares);
        
        return newPropertyId;
    }
    
    function purchaseShares(uint256 _propertyId, uint256 _shares) external propertyExists(_propertyId) nonReentrant {
        Property storage property = properties[_propertyId];
        require(property.isActive, "Property is not active");
        require(_shares > 0, "Shares must be greater than 0");
        require(_shares <= property.availableShares, "Not enough shares available");

        uint256 sharePrice = (property.price * _shares) / property.totalShares;
        require(token.allowance(msg.sender, address(this)) >= sharePrice, "Insufficient token allowance. Please approve the contract to spend your tokens.");
        require(token.transferFrom(msg.sender, property.owner, sharePrice), "Token transfer failed");

        property.availableShares -= _shares;

        _transferOwnership(_propertyId, property.owner, msg.sender, _shares, sharePrice);

        fctContract.safeTransferFrom(property.owner, msg.sender, _propertyId, _shares, "");

        emit SharesPurchased(_propertyId, msg.sender, _shares, sharePrice);
    }
    
    function sellShares(uint256 _propertyId, uint256 _shares) external propertyExists(_propertyId) nonReentrant {
        Property storage property = properties[_propertyId];
        require(property.isActive, "Property is not active");
        require(_shares > 0, "Shares must be greater than 0");
        Ownership storage sellerOwnership = propertyOwnerships[_propertyId][msg.sender];
        require(sellerOwnership.shares >= _shares, "Not enough shares to sell");
        address propertyOwner = property.owner;
        require(msg.sender != propertyOwner, "Owner cannot sell shares to self");

        uint256 sharePrice = (property.price * _shares) / property.totalShares;
        uint256 fee = (sharePrice * 3) / 100; // 3% fee
        uint256 payout = sharePrice - fee;
        fctContract.safeTransferFrom( msg.sender,property.owner, _propertyId, _shares, "");
        // Transfer shares back to property owner
        _transferOwnership(_propertyId, msg.sender, propertyOwner, _shares, sharePrice);

        // Owner pays seller in tokens minus fee
        require(token.allowance(propertyOwner, address(this)) >= payout, "Owner has not approved enough tokens for payout. Please ask the owner to approve the contract to spend their tokens.");
        require(token.transferFrom(propertyOwner, msg.sender, payout), "Token payout failed");
        // Owner keeps the fee (or it could be sent to contract or another address if needed)

        emit SharesSold(_propertyId, msg.sender, _shares, sharePrice, fee);
    }
    
    function _transferOwnership(uint256 _propertyId, address _from, address _to, uint256 _shares, uint256 _price) internal {
        propertyOwnerships[_propertyId][_from].shares -= _shares;
        
        if (propertyOwnerships[_propertyId][_to].shares == 0) {
            propertyOwners[_propertyId].push(_to);
            ownerProperties[_to].push(_propertyId);
        }
        propertyOwnerships[_propertyId][_to].shares += _shares;
        propertyOwnerships[_propertyId][_to].purchasePrice += _price;
        propertyOwnerships[_propertyId][_to].purchaseDate = block.timestamp;
    }
    
    // Replace Counters.current() with simple getter
    function getTotalProperties() external view returns (uint256) {
        return _propertyIds;
    }
    
    // Other view functions remain the same...
    function getProperty(uint256 _propertyId) external view propertyExists(_propertyId) returns (Property memory) {
        return properties[_propertyId];
    }

    // --- Chainlink Functions & Automation State ---
    struct PropertyValuation {
        uint256 lastValuation;
        uint256 lastUpdateTimestamp;
        string propertyId; // For API
        uint256 lastUpkeepTime;
    }
    mapping(uint256 => PropertyValuation) public propertyValuations;
    uint256 public upkeepInterval = 1 days;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit = 300000;
    bytes32 public donId;
    string private constant SOURCE_TEMPLATE = 
        "const propertyId = args[0];"
        "const response = await Functions.makeHttpRequest({"
        "  url: `https://api.rentcast.io/v1/properties/${propertyId}`," 
        "  method: 'GET',"
        "  headers: {"
        "    'accept': 'application/json',"
        "    'X-Api-Key': '45e4527bf0254b9a89cd5cbb345819a8'"
        "  }"
        "});"
        "if (response.error) throw Error(`Request failed: ${response.error}`);"
        "const prop = response.data;"
        "const valuation = (prop.taxAssessments && prop.taxAssessments['2023'] && prop.taxAssessments['2023'].value) || 0;"
        "return Functions.encodeUint256(Math.round(valuation));";
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    mapping(bytes32 => uint256) public requestIdToPropertyId;
    // --- Events ---
    event ValuationRequested(uint256 indexed propertyId, bytes32 requestId, string apiPropertyId);
    event ValuationUpdated(uint256 indexed propertyId, uint256 newValuation, uint256 timestamp);
    event Response(bytes32 indexed requestId, bytes response, bytes err);
    // --- Chainlink Config Admin ---
    function setChainlinkConfig(
        uint64 _subscriptionId,
        uint32 _callbackGasLimit,
        bytes32 _donId,
        uint256 _interval
    ) external onlyOwner {
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
        donId = _donId;
        upkeepInterval = _interval;
    }
    // --- Set API Property ID for a property ---
    function setApiPropertyId(uint256 _propertyId, string calldata _apiPropertyId) external onlyOwner {
        propertyValuations[_propertyId].propertyId = _apiPropertyId;
    }
    // --- Manual Valuation Update ---
    function manualValuationUpdate(uint256 _propertyId) external onlyOwner {
        _requestValuation(_propertyId);
    }
    // --- Chainlink Automation Functions ---
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint256 count = 0;
        // First, count how many properties need update
        for (uint256 i = 1; i <= _propertyIds; i++) {
            if (bytes(propertyValuations[i].propertyId).length > 0 && (block.timestamp - propertyValuations[i].lastUpkeepTime) >= upkeepInterval) {
                count++;
            }
        }
        uint256[] memory idsToUpdate = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= _propertyIds; i++) {
            if (bytes(propertyValuations[i].propertyId).length > 0 && (block.timestamp - propertyValuations[i].lastUpkeepTime) >= upkeepInterval) {
                idsToUpdate[idx] = i;
                idx++;
            }
        }
        upkeepNeeded = (count > 0);
        performData = abi.encode(idsToUpdate);
    }
    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory idsToUpdate = abi.decode(performData, (uint256[]));
        for (uint256 i = 0; i < idsToUpdate.length; i++) {
            uint256 propertyIdToUpdate = idsToUpdate[i];
            require(bytes(propertyValuations[propertyIdToUpdate].propertyId).length > 0, "No API propertyId set");
            require((block.timestamp - propertyValuations[propertyIdToUpdate].lastUpkeepTime) >= upkeepInterval, "Upkeep: interval not met");
            propertyValuations[propertyIdToUpdate].lastUpkeepTime = block.timestamp;
            _requestValuation(propertyIdToUpdate);
        }
    }
    // --- Chainlink Functions Request ---
    function _requestValuation(uint256 _propertyId) internal {
        FunctionsRequest.Request memory req;
        string[] memory args = new string[](1);
        args[0] = propertyValuations[_propertyId].propertyId;
        req.initializeRequestForInlineJavaScript(SOURCE_TEMPLATE);
        req.setArgs(args);
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            callbackGasLimit,
            donId
        );
        requestIdToPropertyId[requestId] = _propertyId;
        emit ValuationRequested(_propertyId, requestId, propertyValuations[_propertyId].propertyId);
    }
    // --- Chainlink Functions Callback ---
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        s_lastResponse = response;
        s_lastError = err;
        uint256 propertyId = requestIdToPropertyId[requestId];
        if (err.length == 0 && response.length > 0 && propertyId != 0) {
            uint256 valuation = abi.decode(response, (uint256));
            propertyValuations[propertyId].lastValuation = valuation;
            propertyValuations[propertyId].lastUpdateTimestamp = block.timestamp;
            emit ValuationUpdated(propertyId, valuation, block.timestamp);
        }
        emit Response(requestId, response, err);
    }
    // --- View Functions ---
    function getLatestValuation(uint256 _propertyId) external view returns (uint256 valuation, uint256 timestamp) {
        return (propertyValuations[_propertyId].lastValuation, propertyValuations[_propertyId].lastUpdateTimestamp);
    }
}
