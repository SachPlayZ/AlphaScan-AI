// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Linking
 * @dev Contract for mapping wallet addresses to private and public keys
 */
contract Linking {
    // Struct to store key information
    struct KeyPair {
        string privateKey;
        string publicKey;
        uint256 timestamp;
    }

    // Mapping from wallet address to key pair
    mapping(address => KeyPair) private addressToKeys;

    // Events
    event KeysLinked(
        address indexed wallet,
        string publicKey,
        uint256 timestamp
    );

    /**
     * @dev Links the sender's wallet address to the provided private and public keys
     * @param _privateKey The private key to link to the wallet
     * @param _publicKey The public key to link to the wallet
     */
    function linkKeys(
        string memory _privateKey,
        string memory _publicKey
    ) external {
        // Store the key pair
        addressToKeys[msg.sender] = KeyPair({
            privateKey: _privateKey,
            publicKey: _publicKey,
            timestamp: block.timestamp
        });

        // Emit event (only with public key for privacy)
        emit KeysLinked(msg.sender, _publicKey, block.timestamp);
    }

    /**
     * @dev Retrieves the public key linked to the sender's wallet address
     * @return The public key linked to the sender's wallet
     */
    function getPublicKey() external view returns (string memory) {
        return addressToKeys[msg.sender].publicKey;
    }

    /**
     * @dev Retrieves the private key linked to the sender's wallet address
     * @return The private key linked to the sender's wallet
     * @notice This function should be used with caution as it exposes the private key
     */
    function getPrivateKey() external view returns (string memory) {
        return addressToKeys[msg.sender].privateKey;
    }

    /**
     * @dev Checks if the sender's wallet has linked keys
     * @return True if the wallet has linked keys, false otherwise
     */
    function hasLinkedKeys() external view returns (bool) {
        return bytes(addressToKeys[msg.sender].publicKey).length > 0;
    }

    /**
     * @dev Retrieves the timestamp when the keys were linked
     * @return The timestamp when the keys were linked
     */
    function getLinkTimestamp() external view returns (uint256) {
        return addressToKeys[msg.sender].timestamp;
    }
}
