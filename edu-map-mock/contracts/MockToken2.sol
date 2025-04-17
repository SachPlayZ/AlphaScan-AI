// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title DealToken
 * @dev ERC20 token with a dynamic pricing mechanism based on token supply
 */
contract ALTToken is ERC20, Ownable {
    // Base price in wei
    uint256 public basePrice = 0.001 ether;

    // Price increase factor (multiplied by 1e18 for precision)
    uint256 public priceIncreaseFactor = 1.2 * 1e18;

    // Total ETH collected
    uint256 public totalEthCollected;

    // Initial supply
    uint256 private constant INITIAL_SUPPLY = 1_000_000 * 1e18;

    // Max supply
    uint256 private constant MAX_SUPPLY = 10_000_000 * 1e18;

    // Events
    event TokensPurchased(
        address indexed buyer,
        uint256 ethAmount,
        uint256 tokenAmount
    );

    event TokensSold(
        address indexed seller,
        uint256 tokenAmount,
        uint256 ethAmount
    );

    constructor() ERC20("ALT", "ALTToken") Ownable(msg.sender) {
        // Mint initial supply to the contract creator
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Returns the current token price based on the current supply
     * Price increases as more tokens are purchased
     */
    function getCurrentPrice() public view returns (uint256) {
        uint256 currentSupply = totalSupply();

        // If we're at max supply, return a very high price
        if (currentSupply >= MAX_SUPPLY) {
            return type(uint256).max;
        }

        // Calculate price based on current supply
        // The more tokens in circulation, the higher the price
        uint256 supplyFactor = (currentSupply * 1e18) / MAX_SUPPLY;
        uint256 priceMultiplier = basePrice +
            (supplyFactor * (priceIncreaseFactor - 1e18)) /
            1e18;

        return priceMultiplier;
    }

    /**
     * @dev Buy tokens with ETH
     */
    function buy() external payable {
        require(msg.value > 0, "Must send ETH to buy tokens");

        uint256 currentPrice = getCurrentPrice();
        require(currentPrice > 0, "Price calculation error");

        // Calculate tokens to mint based on ETH sent and current price
        uint256 tokensToMint = (msg.value * 1e18) / currentPrice;

        // Check if this would exceed max supply
        uint256 currentSupply = totalSupply();
        if (currentSupply + tokensToMint > MAX_SUPPLY) {
            tokensToMint = MAX_SUPPLY - currentSupply;
        }

        require(tokensToMint > 0, "Not enough ETH sent to buy any tokens");

        // Update total ETH collected
        totalEthCollected += msg.value;

        // Mint tokens to buyer
        _mint(msg.sender, tokensToMint);

        emit TokensPurchased(msg.sender, msg.value, tokensToMint);
    }

    /**
     * @dev Sell tokens back to the contract for ETH
     * @param tokenAmount The amount of tokens to sell
     */
    function sell(uint256 tokenAmount) external {
        require(tokenAmount > 0, "Must sell a positive amount");
        require(
            balanceOf(msg.sender) >= tokenAmount,
            "Insufficient token balance"
        );

        // Check contract ETH balance
        uint256 contractEthBalance = address(this).balance;
        require(contractEthBalance > 0, "Contract has no ETH to pay");

        // Calculate ETH to return based on current price and contract balance
        uint256 currentPrice = getCurrentPrice();

        // Apply a sell discount (90% of buy price)
        uint256 sellPrice = (currentPrice * 90) / 100;

        // Calculate ETH amount based on token amount and sell price
        uint256 ethToReturn = (tokenAmount * sellPrice) / 1e18;

        // Make sure we don't exceed contract balance
        if (ethToReturn > contractEthBalance) {
            ethToReturn = contractEthBalance;
        }

        require(ethToReturn > 0, "Not enough ETH to return");

        // Burn the tokens
        _burn(msg.sender, tokenAmount);

        // Update total ETH collected
        totalEthCollected -= ethToReturn;

        // Transfer ETH to seller
        (bool success, ) = payable(msg.sender).call{value: ethToReturn}("");
        require(success, "ETH transfer failed");

        emit TokensSold(msg.sender, tokenAmount, ethToReturn);
    }

    /**
     * @dev Update base price (owner only)
     */
    function updateBasePrice(uint256 _newBasePrice) external onlyOwner {
        basePrice = _newBasePrice;
    }

    /**
     * @dev Update price increase factor (owner only)
     * @param _newFactor New factor multiplied by 1e18 (e.g., 1.5 * 1e18 for 50% increase)
     */
    function updatePriceIncreaseFactor(uint256 _newFactor) external onlyOwner {
        require(_newFactor >= 1e18, "Factor must be at least 1.0");
        priceIncreaseFactor = _newFactor;
    }
}
