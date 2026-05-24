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
    string public source = 
        "const apiUrl = 'https://cl-ai.onrender.com/value';"
        "const [name, assetType, origin, variant] = args;"
        "const body = {"
        "  name,"
        "  type: assetType,"
        "  origin,"
        "  shareable: true,"
        "  variant"
        "};"
        "const response = await Functions.makeHttpRequest({"
        "  url: apiUrl,"
        "  method: 'POST',"
        "  headers: { 'Content-Type': 'application/json' },"
        "  data: body"  // Correct parameter name
        "});"
        "if (response.error) {"
        "  throw Error(`Request failed: ${response.error}`);"
        "}"
        "return Functions.encodeString(JSON.stringify(response.data));";



    constructor(address router) FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    /**
     * @notice Sends the POST request to the valuation API
     * @param subscriptionId Your Chainlink Functions billing subscription
     * @param callbackGasLimit Gas allocated to fulfill function
     * @param donId Chainlink DON identifier
     * @param args [name, type, origin, variant] — shareable is hardcoded
     */
    function sendPostRequestTrue(
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        bytes32 donId,
        string[] calldata args
    ) external onlyOwner returns (bytes32 requestId) {
        require(args.length == 4, "Expected 4 args: [name, type, origin, variant]");

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);

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
    function bytesToString(bytes memory data) public pure returns (string memory) {
        return string(data);
    }



    error UnexpectedRequestID(bytes32 requestId);
}
