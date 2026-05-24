// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";


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
string public source = 
    "const response = await Functions.makeHttpRequest({"
    "  url: 'https://api.rentcast.io/v1/properties/random?limit=5',"
    "  method: 'GET',"
    "  headers: {"
    "    'accept': 'application/json',"
    "    'X-Api-Key': '45e4527bf0254b9a89cd5cbb345819a8'"
    "  }"
    "});"
    "if (response.error) throw Error(`Request failed: ${response.error}`);"
    "const props = response.data;"
    "if (!Array.isArray(props) || props.length === 0) throw Error('No property data returned');"
    "const firstProp = props[0];"
    "const output = {"
    "  address: firstProp.formattedAddress || '',"
    "  lastSalePrice: firstProp.lastSalePrice || 0"
    "};"
    "return Functions.encodeString(JSON.stringify(output));";



    constructor(address router) FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    function sendGetRequestRentCast(
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        bytes32 donId
        // bytes memory encryptedSecretsReference // ← This is your secrets payload
    ) external onlyOwner returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);

        // Attach the secrets (e.g. your RentCast API key)
        // req.addSecretsReference(encryptedSecretsReference);

        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            callbackGasLimit,
            donId
        );

        return s_lastRequestId;
    }


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
