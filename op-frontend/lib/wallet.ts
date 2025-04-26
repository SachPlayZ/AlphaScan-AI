import { ethers } from "ethers";
import { pharosDevnet } from "@/app/config";

// Define interfaces for wallet data and transactions
export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  description: string;
  timestamp: number;
  hash?: string;
}

export interface WalletData {
  address: string;
  privateKey: string;
  balance: number; // USD balance (for UI display only)
  eduBalance: number; // Native EDU token balance
  transactions: Transaction[];
}

/**
 * Creates a new Ethereum wallet or retrieves an existing one from localStorage
 * @returns WalletData object containing wallet information
 */
export function getOrCreateWallet(): WalletData {
  // Check if we already have a wallet in localStorage
  const storedWallet = localStorage.getItem("agent-wallet");

  if (storedWallet) {
    // Parse and return existing wallet data
    return JSON.parse(storedWallet);
  }

  // Create a new random wallet
  const wallet = ethers.Wallet.createRandom();

  // Create initial wallet data
  const walletData: WalletData = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    balance: 0, // Initial USD balance
    eduBalance: 0, // Initial EDU token balance
    transactions: [],
  };

  // Store wallet data in localStorage
  localStorage.setItem("agent-wallet", JSON.stringify(walletData));

  return walletData;
}

/**
 * Adds a transaction to the wallet's transaction history
 * @param wallet Current wallet data
 * @param transaction Transaction to add
 * @returns Updated wallet data
 */
export function addTransaction(
  wallet: WalletData,
  transaction: Omit<Transaction, "id" | "timestamp">
): WalletData {
  // Create a new transaction with generated ID and timestamp
  const newTransaction: Transaction = {
    ...transaction,
    id: generateTransactionId(),
    timestamp: Date.now(),
  };

  // Update wallet balance based on transaction type
  const updatedBalance =
    transaction.type === "deposit"
      ? wallet.balance + transaction.amount
      : wallet.balance - transaction.amount;

  // Create updated wallet data
  const updatedWallet: WalletData = {
    ...wallet,
    balance: updatedBalance,
    transactions: [newTransaction, ...wallet.transactions],
  };

  // Save updated wallet to localStorage
  localStorage.setItem("agent-wallet", JSON.stringify(updatedWallet));

  return updatedWallet;
}

/**
 * Helper function to generate a unique transaction ID
 */
function generateTransactionId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Updates the native EDU token balance in the wallet
 * @param wallet Current wallet data
 * @returns Updated wallet data with current EDU balance
 */
export async function updateEduBalance(
  wallet: WalletData
): Promise<WalletData> {
  try {
    // Create a provider for the Edu testnet using the local proxy
    const provider = new ethers.JsonRpcProvider(
      "https://devnet.dplabs-internal.com"
    );

    // Get the native token (EDU) balance
    const balanceWei = await provider.getBalance(wallet.address);

    // Convert from wei to EDU (assuming 18 decimals like ETH)
    const balanceEdu = parseFloat(ethers.formatEther(balanceWei));

    // Update wallet with new balance
    const updatedWallet = {
      ...wallet,
      eduBalance: balanceEdu,
    };

    // Save to localStorage
    localStorage.setItem("agent-wallet", JSON.stringify(updatedWallet));

    return updatedWallet;
  } catch (error) {
    console.error("Error fetching EDU balance:", error);
    // Return original wallet if there's an error
    return wallet;
  }
}

/**
 * Sends native EDU tokens to another address
 * @param wallet Current wallet data
 * @param to Recipient address
 * @param amount Amount of EDU tokens to send
 * @param description Transaction description
 * @returns Object containing success status and transaction hash or error
 */
export async function sendEduTokens(
  wallet: WalletData,
  to: string,
  amount: number,
  description: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Validate the recipient address
    if (!ethers.isAddress(to)) {
      return { success: false, error: "Invalid recipient address" };
    }

    // Create a provider for the Edu testnet using the local proxy
    const provider = new ethers.JsonRpcProvider(
      "https://devnet.dplabs-internal.com"
    );

    // Create a wallet instance with the private key
    const walletInstance = new ethers.Wallet(wallet.privateKey, provider);

    // Convert amount to wei (assuming 18 decimals like ETH)
    const amountInWei = ethers.parseEther(amount.toString());

    // Check if wallet has enough balance
    const balance = await provider.getBalance(wallet.address);
    if (balance < amountInWei) {
      return { success: false, error: "Insufficient EDU balance" };
    }

    // Get current gas price with a slight increase for faster confirmation
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits("50", "gwei");
    const adjustedGasPrice = (gasPrice * BigInt(120)) / BigInt(100); // 20% increase

    // Estimate gas for the transaction
    let gasLimit;
    try {
      gasLimit = await provider.estimateGas({
        from: wallet.address,
        to: to,
        value: amountInWei,
      });
      // Add a 20% buffer to the gas limit for safety
      gasLimit = (gasLimit * BigInt(120)) / BigInt(100);
    } catch (gasError) {
      console.warn("Gas estimation failed, using default:", gasError);
      gasLimit = ethers.toBigInt("300000"); // Fallback gas limit
    }

    // Get the latest nonce
    const nonce = await provider.getTransactionCount(wallet.address);

    // Create transaction object
    const tx = {
      to: to,
      value: amountInWei,
      gasLimit: gasLimit,
      gasPrice: adjustedGasPrice,
      nonce: nonce,
      chainId: pharosDevnet.id,
      data: "0x",
    };
    // Note: We're not explicitly setting type property - letting ethers handle it

    console.log("Sending transaction with parameters:", {
      to: to,
      value: ethers.formatEther(amountInWei) + " EDU",
      gasLimit: gasLimit.toString(),
      gasPrice: ethers.formatUnits(adjustedGasPrice, "gwei") + " gwei",
      nonce: nonce,
      chainId: pharosDevnet.id,
    });

    // Send transaction
    const transaction = await walletInstance.sendTransaction(tx);
    console.log("Transaction sent:", transaction.hash);

    // Add transaction to history immediately with pending status
    const pendingTxHash = transaction.hash;
    const updatedWallet = addTransaction(wallet, {
      type: "withdrawal",
      amount: amount,
      description: description,
      hash: pendingTxHash,
    });

    try {
      // Wait for transaction to be mined with increased timeout
      const receipt = await Promise.race([
        transaction.wait(1), // Wait for 1 confirmation
        new Promise<null>((_, reject) =>
          setTimeout(
            () => reject(new Error("Transaction confirmation timeout")),
            60000 // Increased to 60 seconds
          )
        ),
      ]);

      // Update transaction with confirmed status
      const txHash = receipt?.hash || pendingTxHash;

      // Update wallet balance
      await updateEduBalance(updatedWallet);

      return {
        success: true,
        txHash: txHash,
      };
    } catch (waitError) {
      console.warn("Transaction may still be pending:", waitError);

      // The transaction is still valid, just not confirmed yet
      return {
        success: true,
        txHash: pendingTxHash,
        error:
          "Transaction sent but confirmation timed out. It may still go through. Check explorer for status.",
      };
    }
  } catch (error) {
    console.error("Error sending EDU tokens:", error);

    // Provide more detailed error feedback
    let errorMessage = "Unknown error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;

      // Better organized error classification
      if (
        errorMessage.includes("insufficient funds") ||
        errorMessage.includes("not enough funds")
      ) {
        errorMessage = "Insufficient funds to complete this transaction";
      } else if (
        errorMessage.includes("nonce") ||
        errorMessage.includes("already known")
      ) {
        errorMessage = "Transaction sequencing error. Please try again";
      } else if (
        errorMessage.includes("rejected") ||
        errorMessage.includes("denied")
      ) {
        errorMessage = "Transaction rejected by the network";
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("connect")
      ) {
        errorMessage =
          "Network connection error. Please check your internet connection";
      } else if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("timed out")
      ) {
        errorMessage = "Network timeout. The pharos might be congested";
      }
    }

    // Include detailed logging of the error
    console.error("Transaction error details:", {
      message: errorMessage,
      originalError: error,
      walletAddress: wallet.address,
      recipientAddress: to,
      amount: amount,
    });

    return { success: false, error: errorMessage };
  }
}

/**
 * Signs a message with the wallet's private key
 * @param wallet Current wallet data
 * @param message Message to sign
 * @returns Signed message
 */
export async function signMessage(
  wallet: WalletData,
  message: string
): Promise<string> {
  const walletInstance = new ethers.Wallet(wallet.privateKey);
  return await walletInstance.signMessage(message);
}

/**
 * Signs a transaction with the wallet's private key
 * @param wallet Current wallet data
 * @param transaction Transaction object to sign
 * @returns Signed transaction
 */
export async function signTransaction(
  wallet: WalletData,
  transaction: ethers.TransactionRequest
): Promise<string> {
  const walletInstance = new ethers.Wallet(wallet.privateKey);
  return await walletInstance.signTransaction(transaction);
}

/**
 * Estimate the gas needed for a transaction (useful for UI feedback)
 * @param wallet Current wallet data
 * @param to Recipient address
 * @param amount Amount of EDU to send
 * @returns Estimated gas in wei and in EDU
 */
export async function estimateTransactionGas(
  wallet: WalletData,
  to: string,
  amount: number
): Promise<{ gasInWei: bigint; gasInEdu: number }> {
  try {
    const provider = new ethers.JsonRpcProvider(
      "https://devnet.dplabs-internal.com"
    );
    const amountInWei = ethers.parseEther(amount.toString());

    // Estimate gas for the transaction
    const gasEstimate = await provider.estimateGas({
      from: wallet.address,
      to: to,
      value: amountInWei,
    });

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits("50", "gwei");

    // Calculate total gas cost in wei
    const gasInWei = gasEstimate * gasPrice;

    // Convert to EDU
    const gasInEdu = parseFloat(ethers.formatEther(gasInWei));

    return {
      gasInWei,
      gasInEdu,
    };
  } catch (error) {
    console.error("Error estimating gas:", error);
    throw error;
  }
}
