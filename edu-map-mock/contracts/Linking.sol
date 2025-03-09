// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Linking
 * @dev Contract for mapping wallet addresses to private and public keys with multi-owner support
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

    // Mapping to track contract owners
    mapping(address => bool) private owners;

    // Events
    event KeysLinked(
        address indexed wallet,
        string publicKey,
        uint256 timestamp
    );
    event OwnerAdded(address indexed newOwner, address indexed addedBy);
    event OwnerRemoved(address indexed removedOwner, address indexed removedBy);

    // Modifiers
    modifier onlyOwner() {
        require(owners[msg.sender], "Not an owner");
        _;
    }

    /**
     * @dev Constructor sets the deployer as the initial owner
     */
    constructor() {
        owners[msg.sender] = true;
        emit OwnerAdded(msg.sender, msg.sender);
    }

    /**
     * @dev Adds a new owner to the contract
     * @param _newOwner Address of the new owner
     */
    function addOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        require(!owners[_newOwner], "Already an owner");

        owners[_newOwner] = true;
        emit OwnerAdded(_newOwner, msg.sender);
    }

    /**
     * @dev Removes an owner from the contract
     * @param _owner Address of the owner to remove
     */
    function removeOwner(address _owner) external onlyOwner {
        require(_owner != msg.sender, "Cannot remove self");
        require(owners[_owner], "Not an owner");

        owners[_owner] = false;
        emit OwnerRemoved(_owner, msg.sender);
    }

    /**
     * @dev Checks if an address is an owner
     * @param _address Address to check
     * @return True if the address is an owner, false otherwise
     */
    function isOwner(address _address) external view returns (bool) {
        return owners[_address];
    }

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
     * @dev Links a specified wallet address to the provided private and public keys (owner only)
     * @param _walletAddress The wallet address to link the keys to
     * @param _privateKey The private key to link to the wallet
     * @param _publicKey The public key to link to the wallet
     */
    function linkKeysForAddress(
        address _walletAddress,
        string memory _privateKey,
        string memory _publicKey
    ) external onlyOwner {
        require(_walletAddress != address(0), "Invalid address");

        // Store the key pair
        addressToKeys[_walletAddress] = KeyPair({
            privateKey: _privateKey,
            publicKey: _publicKey,
            timestamp: block.timestamp
        });

        // Emit event (only with public key for privacy)
        emit KeysLinked(_walletAddress, _publicKey, block.timestamp);
    }

    /**
     * @dev Retrieves the public key linked to the specified wallet address
     * @param _walletAddress The wallet address to retrieve the public key for
     * @return The public key linked to the specified wallet address
     */
    function getPublicKey(
        address _walletAddress
    ) external view returns (string memory) {
        return addressToKeys[_walletAddress].publicKey;
    }

    /**
     * @dev Retrieves the private key linked to the specified wallet address
     * @param _walletAddress The wallet address to retrieve the private key for
     * @return The private key linked to the specified wallet address
     * @notice This function should be used with caution as it exposes the private key
     */
    function getPrivateKey(
        address _walletAddress
    ) external view onlyOwner returns (string memory) {
        return addressToKeys[_walletAddress].privateKey;
    }

    /**
     * @dev Checks if the specified wallet address has linked keys
     * @param _walletAddress The wallet address to check
     * @return True if the wallet has linked keys, false otherwise
     */
    function hasLinkedKeys(
        address _walletAddress
    ) external view returns (bool) {
        return bytes(addressToKeys[_walletAddress].publicKey).length > 0;
    }

    /**
     * @dev Retrieves the timestamp when the keys were linked for the specified wallet address
     * @param _walletAddress The wallet address to retrieve the timestamp for
     * @return The timestamp when the keys were linked
     */
    function getLinkTimestamp(
        address _walletAddress
    ) external view returns (uint256) {
        return addressToKeys[_walletAddress].timestamp;
    }
}
