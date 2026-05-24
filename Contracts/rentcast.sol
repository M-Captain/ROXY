// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title ValuePoster
 * @notice Posts asset valuation data to an external API via Chainlink Functions
 */
contract ValuePoster is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // Chainlink Functions state
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    // Event
    event Response(
        bytes32 indexed requestId,
        string result,
        bytes response,
        bytes err
    );

    // JavaScript source with shareable: true
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
    "const output = {"
    "  propertyType: prop.propertyType || '',"
    "  formattedAddress: prop.formattedAddress || '',"
    "  bedrooms: prop.bedrooms || 0,"
    "  bathrooms: prop.bathrooms || 0,"
    "  squarefootage: prop.squareFootage || 0,"
    "  yearbuilt: prop.yearBuilt || 0,"
    "  valuation: (prop.taxAssessments && prop.taxAssessments['2023'] && prop.taxAssessments['2023'].value) || 0"
    "};"
    "return Functions.encodeString(JSON.stringify(output));";





    constructor(address router) FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    function sendGetRequestRentCast(
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        bytes32 donId,
        string memory propertyId  // New parameter
        // bytes memory encryptedSecrets // Required for API key
    ) external onlyOwner returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        
        // Set arguments (property ID)
        string[] memory args = new string[](1);
        args[0] = propertyId;
        
        // Initialize request with JS source and arguments
        req.initializeRequestForInlineJavaScript(SOURCE_TEMPLATE);
        req.setArgs(args);
        
        // Add encrypted secrets (API key)
        // req.addSecretsReference(encryptedSecrets);
        
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            callbackGasLimit,
            donId
        );
        return s_lastRequestId;
    }



    /**
     * @notice Callback from Chainlink Functions
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }

        s_lastResponse = response;
        s_lastError = err;

        emit Response(requestId, string(response), response, err);
    }

    error UnexpectedRequestID(bytes32 requestId);
}
