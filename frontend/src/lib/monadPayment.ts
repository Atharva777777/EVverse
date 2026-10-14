/**
 * Monad Testnet EIP-1193 Web3 Integration & Payment Verification Engine
 * Chain ID: 10143 (0x279f)
 * Native Asset: MON (18 decimals)
 */

export interface MonadNetworkConfig {
  chainIdDecimal: number;
  chainIdHex: string;
  chainName: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeAsset: {
    name: string;
    symbol: string;
    decimals: number;
  };
  configuredRecipientAddress: string;
}

// Alchemy Monad RPC Sponsor Resolution
const alchemyUrl = (process.env.NEXT_PUBLIC_MONAD_ALCHEMY_RPC_URL || "").trim();
const alchemyKey = (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "").trim();

export const MONAD_CONFIG: MonadNetworkConfig & { providerName: string; isAlchemy: boolean } = {
  chainIdDecimal: 10143,
  chainIdHex: "0x279f",
  chainName: "Monad Testnet",
  rpcUrl: alchemyUrl
    ? alchemyUrl
    : alchemyKey
    ? `https://monad-testnet.g.alchemy.com/v2/${alchemyKey}`
    : process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
  explorerUrl:
    process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL ||
    "https://testnet.monadexplorer.com",
  nativeAsset: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  configuredRecipientAddress: (
    process.env.NEXT_PUBLIC_MONAD_PAYMENT_RECIPIENT_ADDRESS || ""
  ).trim(),
  providerName: (alchemyUrl || alchemyKey) ? "Alchemy Monad Testnet RPC" : "Monad Public Testnet RPC",
  isAlchemy: Boolean(alchemyUrl || alchemyKey),
};

export interface RecipientConfigResult {
  isConfigured: boolean;
  address: string;
  missingConfig: string | null;
  source?: "env" | "station" | "local_override";
}

/**
 * Validates whether an address is a valid 20-byte Ethereum hexadecimal address.
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Persists a user-specified recipient address in localStorage for session testing.
 */
export function setLocalPaymentRecipient(address: string): boolean {
  if (!isValidEthereumAddress(address.trim())) {
    return false;
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("evverse_monad_recipient", address.trim());
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Clears the user-specified recipient override.
 */
export function clearLocalPaymentRecipient(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("evverse_monad_recipient");
    } catch {
      // ignore
    }
  }
}

/**
 * Returns the verified payment recipient address without inventing fictitious data.
 * Priority: station override -> environment variable -> user localStorage override.
 * If unconfigured, explicitly reports the missing configuration.
 */
export function getPaymentRecipientConfig(
  stationAddressOverride?: string | null
): RecipientConfigResult {
  if (
    stationAddressOverride &&
    isValidEthereumAddress(stationAddressOverride.trim())
  ) {
    return {
      isConfigured: true,
      address: stationAddressOverride.trim(),
      missingConfig: null,
      source: "station",
    };
  }

  if (
    MONAD_CONFIG.configuredRecipientAddress &&
    isValidEthereumAddress(MONAD_CONFIG.configuredRecipientAddress)
  ) {
    return {
      isConfigured: true,
      address: MONAD_CONFIG.configuredRecipientAddress,
      missingConfig: null,
      source: "env",
    };
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("evverse_monad_recipient");
      if (stored && isValidEthereumAddress(stored.trim())) {
        return {
          isConfigured: true,
          address: stored.trim(),
          missingConfig: null,
          source: "local_override",
        };
      }
    } catch {
      // ignore
    }
  }

  return {
    isConfigured: false,
    address: "",
    missingConfig: "NEXT_PUBLIC_MONAD_PAYMENT_RECIPIENT_ADDRESS",
  };
}

/**
 * Safely parses a MON amount string (e.g. "0.025 MON" or "0.025") to exact wei without float rounding errors.
 */
export function monToWeiHex(monAmountStr: string): {
  weiString: string;
  weiHex: string;
  displayMon: string;
} {
  const clean = monAmountStr.replace(/[^0-9.]/g, "");
  if (!clean || clean === ".") {
    return { weiString: "0", weiHex: "0x0", displayMon: "0.0000" };
  }

  const parts = clean.split(".");
  const wholePart = parts[0] || "0";
  const rawFrac = parts[1] || "";
  const fracPart = rawFrac.padEnd(18, "0").slice(0, 18);

  const combined =
    wholePart === "0" ? fracPart.replace(/^0+/, "") || "0" : `${wholePart}${fracPart}`;

  try {
    const weiBigInt = BigInt(combined);
    return {
      weiString: weiBigInt.toString(),
      weiHex: `0x${weiBigInt.toString(16)}`,
      displayMon: (+clean).toFixed(4),
    };
  } catch {
    return { weiString: "0", weiHex: "0x0", displayMon: clean };
  }
}

/**
 * Helper to truncate an address for mobile/desktop UI.
 */
export function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/**
 * Helper to truncate a transaction hash.
 */
export function truncateTxHash(hash: string): string {
  if (!hash || hash.length < 14) return hash || "";
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

/**
 * Extracts friendly, actionable human-readable messages from Web3, RPC, and persistence errors.
 */
export function parseWeb3Error(error: unknown): string {
  if (!error) return "An unknown wallet error occurred. Please try again.";

  if (typeof error === "string") {
    return error;
  }

  const err = error as { code?: number | string; message?: string; detail?: string };
  const rawMsg = (err.message || err.detail || "").toString();
  const lowerMsg = rawMsg.toLowerCase();

  // 1. User rejection / cancellation
  if (
    err.code === 4001 ||
    lowerMsg.includes("user rejected") ||
    lowerMsg.includes("user denied") ||
    lowerMsg.includes("action rejected")
  ) {
    return "Transaction was cancelled in your wallet. No testnet MON was transferred. You can click 'Approve & Pay' again when you are ready.";
  }

  // 2. Insufficient testnet funds / gas
  if (
    err.code === -32000 ||
    lowerMsg.includes("insufficient funds") ||
    lowerMsg.includes("exceeds balance") ||
    lowerMsg.includes("insufficient balance")
  ) {
    return "Insufficient testnet MON balance to cover the hold deposit + gas fee. Claim free testnet tokens from the official Monad Faucet at testnet.monad.xyz.";
  }

  // 3. Request already pending in wallet extension
  if (
    err.code === -32002 ||
    lowerMsg.includes("already pending") ||
    lowerMsg.includes("resource unavailable")
  ) {
    return "A wallet confirmation request is already pending. Please open your wallet extension window to approve or dismiss it.";
  }

  // 4. Unauthorized / locked wallet
  if (
    err.code === 4100 ||
    lowerMsg.includes("unauthorized") ||
    lowerMsg.includes("locked")
  ) {
    return "Wallet is locked or not authorized. Please unlock your browser wallet extension and reconnect.";
  }

  // 5. Wrong network / unadded chain
  if (
    err.code === 4902 ||
    lowerMsg.includes("unrecognized chain") ||
    lowerMsg.includes("unknown chain") ||
    lowerMsg.includes("switch chain")
  ) {
    return "Monad Testnet (Chain ID 10143) is required. Please approve adding or switching to Monad Testnet in your wallet.";
  }

  // 6. Transaction reverted on-chain
  if (lowerMsg.includes("reverted")) {
    return "Transaction was submitted but reverted on-chain on Monad Testnet (status 0x0). Payment could not be confirmed.";
  }

  // 7. Security verification failure (recipient/amount mismatch)
  if (lowerMsg.includes("security verification fail") || lowerMsg.includes("recipient on-chain")) {
    return rawMsg;
  }

  // 8. Duplicate transaction hash rejection
  if (lowerMsg.includes("already been registered")) {
    return "This transaction hash has already been registered in the EVverse booking ledger. Duplicate submissions are prevented.";
  }

  // 9. Timeout / RPC network error
  if (
    lowerMsg.includes("timed out") ||
    lowerMsg.includes("timeout") ||
    lowerMsg.includes("failed to fetch") ||
    lowerMsg.includes("network error")
  ) {
    return "Network error or timeout communicating with Monad Testnet RPC. Please verify your internet connection and inspect the transaction status on Monad Explorer.";
  }

  if (rawMsg && rawMsg.length < 180 && !rawMsg.includes("{")) {
    return rawMsg;
  }

  return "Transaction could not be completed. Please check your wallet connection and try again.";
}

/**
 * Checks if browser has an injected EIP-1193 Ethereum provider.
 */
export function hasInjectedProvider(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

/**
 * Request connected accounts from injected wallet.
 */
export async function requestWalletAccounts(): Promise<string[]> {
  if (!hasInjectedProvider()) {
    throw new Error(
      "No compatible Web3 wallet detected. Please install MetaMask, Rabby, or a browser extension wallet."
    );
  }

  const accounts = (await window.ethereum!.request<string[]>({
    method: "eth_requestAccounts",
  })) as string[];

  return accounts || [];
}

/**
 * Get currently connected accounts without triggering permission popup.
 */
export async function getExistingAccounts(): Promise<string[]> {
  if (!hasInjectedProvider()) return [];
  try {
    const accounts = (await window.ethereum!.request<string[]>({
      method: "eth_accounts",
    })) as string[];
    return accounts || [];
  } catch {
    return [];
  }
}

/**
 * Read current chain ID from wallet.
 */
export async function getCurrentChainId(): Promise<string | null> {
  if (!hasInjectedProvider()) return null;
  try {
    const chainIdHex = (await window.ethereum!.request<string>({
      method: "eth_chainId",
    })) as string;
    return chainIdHex ? chainIdHex.toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Switch wallet to Monad Testnet (Chain ID 10143 / 0x279f), prompting to add if missing.
 */
export async function switchOrAddMonadTestnet(): Promise<boolean> {
  if (!hasInjectedProvider()) {
    throw new Error("No browser wallet available to switch network.");
  }

  const currentChain = await getCurrentChainId();
  if (currentChain === MONAD_CONFIG.chainIdHex.toLowerCase()) {
    return true;
  }

  try {
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_CONFIG.chainIdHex }],
    });
    return true;
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    // Code 4902 indicates chain has not been added to wallet
    if (err.code === 4902) {
      await window.ethereum!.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: MONAD_CONFIG.chainIdHex,
            chainName: MONAD_CONFIG.chainName,
            nativeCurrency: MONAD_CONFIG.nativeAsset,
            rpcUrls: [MONAD_CONFIG.rpcUrl],
            blockExplorerUrls: [MONAD_CONFIG.explorerUrl],
          },
        ],
      });
      return true;
    }
    throw switchError;
  }
}

/**
 * Direct RPC caller for JSON-RPC verification fallback.
 */
async function callMonadRpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(MONAD_CONFIG.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!res.ok) {
    throw new Error(`Monad RPC HTTP error ${res.status}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(json.error.message || `RPC error: ${method}`);
  }

  return json.result as T;
}

export interface VerifiedOnChainReceipt {
  verified: boolean;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  from: string;
  to: string;
  valueWei: string;
  valueMon: string;
  explorerUrl: string;
}

/**
 * Exhaustively verifies on-chain receipt and enforces that the mined recipient and amount match intended payment.
 */
export async function verifyOnChainReceipt({
  txHash,
  expectedRecipient,
  expectedWeiHex,
  maxAttempts = 25,
  pollIntervalMs = 1500,
}: {
  txHash: string;
  expectedRecipient: string;
  expectedWeiHex: string;
  maxAttempts?: number;
  pollIntervalMs?: number;
}): Promise<VerifiedOnChainReceipt> {
  const normRecipient = expectedRecipient.toLowerCase();
  const expectedWeiBigInt = BigInt(expectedWeiHex);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // 1. Fetch receipt
      let receipt: {
        status?: string;
        blockNumber?: string;
        gasUsed?: string;
        to?: string;
        from?: string;
      } | null = null;

      if (hasInjectedProvider()) {
        try {
          receipt = await window.ethereum!.request<{
            status?: string;
            blockNumber?: string;
            gasUsed?: string;
            to?: string;
            from?: string;
          }>({
            method: "eth_getTransactionReceipt",
            params: [txHash],
          });
        } catch {
          receipt = null;
        }
      }

      if (!receipt) {
        receipt = await callMonadRpc<{
          status?: string;
          blockNumber?: string;
          gasUsed?: string;
          to?: string;
          from?: string;
        } | null>("eth_getTransactionReceipt", [txHash]);
      }

      // If mined
      if (receipt && receipt.blockNumber) {
        // Status '0x1' is success; '0x0' is reverted
        if (receipt.status && receipt.status !== "0x1") {
          throw new Error(
            "Transaction reverted on-chain on Monad Testnet (status 0x0). Payment failed."
          );
        }

        // 2. Fetch full transaction to verify recipient and exact amount
        let txDetails: {
          to?: string;
          from?: string;
          value?: string;
        } | null = null;

        if (hasInjectedProvider()) {
          try {
            txDetails = await window.ethereum!.request<{
              to?: string;
              from?: string;
              value?: string;
            }>({
              method: "eth_getTransactionByHash",
              params: [txHash],
            });
          } catch {
            txDetails = null;
          }
        }

        if (!txDetails) {
          txDetails = await callMonadRpc<{
            to?: string;
            from?: string;
            value?: string;
          } | null>("eth_getTransactionByHash", [txHash]);
        }

        if (!txDetails) {
          throw new Error(
            "Could not fetch mined transaction parameters for verification."
          );
        }

        // Validate recipient match
        const actualTo = (txDetails.to || receipt.to || "").toLowerCase();
        if (actualTo !== normRecipient) {
          throw new Error(
            `Security verification failure: Recipient on-chain (${actualTo}) does not match intended recipient (${normRecipient}).`
          );
        }

        // Validate value match
        const actualValueBigInt = BigInt(txDetails.value || "0x0");
        if (actualValueBigInt < expectedWeiBigInt) {
          throw new Error(
            `Security verification failure: Value paid on-chain (${actualValueBigInt.toString()} wei) is less than required payment (${expectedWeiBigInt.toString()} wei).`
          );
        }

        const blockNum = parseInt(receipt.blockNumber, 16);
        const gasUsedStr = receipt.gasUsed
          ? parseInt(receipt.gasUsed, 16).toString()
          : "N/A";
        const valMon = (Number(actualValueBigInt) / 1e18).toFixed(4);

        return {
          verified: true,
          txHash,
          blockNumber: blockNum,
          gasUsed: gasUsedStr,
          from: txDetails.from || receipt.from || "",
          to: actualTo,
          valueWei: actualValueBigInt.toString(),
          valueMon: valMon,
          explorerUrl: `${MONAD_CONFIG.explorerUrl}/tx/${txHash}`,
        };
      }
    } catch (checkErr: unknown) {
      const msg = (checkErr as Error).message || "";
      if (msg.includes("Security verification failure") || msg.includes("reverted")) {
        throw checkErr;
      }
    }

    // Wait before next poll attempt
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(
    "Verification timed out waiting for transaction inclusion on Monad Testnet. You can verify your transaction hash on the explorer."
  );
}
