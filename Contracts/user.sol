// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserSignup {
    struct User {
        bool acceptedTerms;
        bool acceptedPrivacy;
        uint256 signupTimestamp;
    }

    mapping(address => User) public users;

    event UserSignedUp(address indexed user, uint256 timestamp);

    modifier notSignedUp() {
        require(!users[msg.sender].acceptedTerms, "Already signed up");
        _;
    }

    /// @notice User accepts both Terms and Privacy Policy and signs up
    function signup() external notSignedUp {
        users[msg.sender] = User({
            acceptedTerms: true,
            acceptedPrivacy: true,
            signupTimestamp: block.timestamp
        });

        emit UserSignedUp(msg.sender, block.timestamp);
    }

    /// @notice Returns whether a user has signed up
    function isSignedUp(address user) external view returns (bool) {
        return users[user].acceptedTerms && users[user].acceptedPrivacy;
    }

    /// @notice Get signup timestamp
    function getSignupTimestamp(address user) external view returns (uint256) {
        return users[user].signupTimestamp;
    }
}
