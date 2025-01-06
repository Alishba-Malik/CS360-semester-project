// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SnapBlocks {
    struct Access {
        address user;
        bool access;
    }

    mapping(address => string[]) private files; // To store files for each user in a dynamic array using mapping
    mapping(address => mapping(address => bool)) private accessRights; // Grant access to specific users by the owner using nested mapping
    mapping(address => Access[]) private accessList; // Track who has access, the struct for that user is mapped with that owner address

    // Add a file ta specific user that both (specific user and admin) can access
    function addFile(address user, string calldata url) external {
        require(
            msg.sender == user || accessRights[user][msg.sender],
            "You do not have permission to add files for this user."
        );

        files[user].push(url); // Add file to the owner's list, that owner can access, even the other shareaccessed user hasn't granted access to the owner 
    }

    // Grant access to another user
    function grantAccess(address user) external {
        require(user != msg.sender, "You cannot grant access to yourself.");
        require(!accessRights[msg.sender][user], "Access already granted.");

        accessRights[msg.sender][user] = true; // Update access rights
        accessList[msg.sender].push(Access(user, true)); // Track in access list
    }

    // Revoke access from another user
    function revokeAccess(address user) external {
        require(user != msg.sender, "You cannot revoke access from yourself.");
        require(accessRights[msg.sender][user], "User does not have access.");

        accessRights[msg.sender][user] = false; // Update access rights

        // Update the access list
        for (uint256 i = 0; i < accessList[msg.sender].length; i++) {
            if (accessList[msg.sender][i].user == user) {
                accessList[msg.sender][i].access = false;
            }
        }
    }

    // View all files of a specific user
    function viewFiles(address owner) external view returns (string[] memory) {
        require(
            owner == msg.sender || accessRights[owner][msg.sender],
            "You do not have permission to view these files."
        );

        return files[owner];
    }

    // Get the access list for the caller
    function getAccessList() external view returns (Access[] memory) {
        return accessList[msg.sender];
    }
}

// contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3