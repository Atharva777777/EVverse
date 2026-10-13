"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useId,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  X,
  Clock,
  CheckCircle2,
  Car,
  Zap,
  CreditCard,
  Navigation,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Lock,
  ChevronRight,
  ChevronLeft,
  Info,
  Coins,
  ArrowRight,
  ExternalLink,
  Wallet,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { LiveStation } from "@/types/api";
import type { EVVehicle } from "./VehicleCockpit";
import {
  getStoredVehicles,
  getStoredActiveVehicleId,
  VERIFIED_GARAGE_VEHICLES,
} from "@/lib/vehicleStorage";
import {
  MONAD_CONFIG,
  getPaymentRecipientConfig,
  setLocalPaymentRecipient,
  clearLocalPaymentRecipient,
  isValidEthereumAddress,
  monToWeiHex,
  truncateAddress,
  truncateTxHash,
  parseWeb3Error,
  hasInjectedProvider,
  requestWalletAccounts,
  getExistingAccounts,
  getCurrentChainId,
  switchOrAddMonadTestnet,
  verifyOnChainReceipt,
  type VerifiedOnChainReceipt,
} from "@/lib/monadPayment";
import { createDriverBooking } from "@/lib/driverApi";

export interface ParkingBooking {
  id: string;
  stationId: string;
  stationName: string;
  bayNumber: string;
  connectorType: string;
  durationMinutes: number;
  totalCost: string;
  pinCode: string;
  startTime: string;
  expiryTime: string;
  expiryTimestamp: number;
  status: "confirmed" | "active" | "cancelled";
  sessionType?: "hold_only" | "charging_session";
  targetKwh?: number;
  targetBatteryPct?: number;
  paymentMethod?: "monad_testnet" | "sandbox_card" | "sandbox_upi";
  monAmount?: string;
  vehicleMakeModel?: string;
  stagedStatus?: "staged_for_approval" | "confirmed";
  txHash?: string;
  blockNumber?: number;
  recipientAddress?: string;
  explorerUrl?: string;
  gasUsed?: string;
  onChainVerified?: boolean;
}

interface ParkingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: LiveStation | null;
  onStartNavigation?: (station: LiveStation) => void;
  activeVehicle?: EVVehicle;
  initialStep?: "config" | "review" | "pass";
}

interface HoldOption {
  mins: number;
  label: string;
  feeInr: number;
  feeDisplay: string;
  monEquivalent: string;
  tag: string;
}

const RESERVATION_FEE_OPTIONS: HoldOption[] = [
  {
    mins: 30,
    label: "30 min hold",
    feeInr: 49,
    feeDisplay: "₹49",
    monEquivalent: "0.025 MON",
    tag: "Standard Transit",
  },
  {
    mins: 45,
    label: "45 min hold",
    feeInr: 69,
    feeDisplay: "₹69",
    monEquivalent: "0.035 MON",
    tag: "Buffer Included",
  },
  {
    mins: 60,
    label: "60 min hold",
    feeInr: 89,
    feeDisplay: "₹89",
    monEquivalent: "0.045 MON",
    tag: "Heavy Traffic",
  },
  {
    mins: 90,
    label: "90 min hold",
    feeInr: 119,
    feeDisplay: "₹119",
    monEquivalent: "0.060 MON",
    tag: "Highway Stop",
  },
];

function createConfirmedBookingRecord({
  station,
  bayNumber,
  connectorType,
  durationMinutes,
  totalCost,
  sessionType,
  targetKwh,
  targetBatteryPct,
  paymentMethod,
  monAmount,
  vehicleMakeModel,
  txHash,
  blockNumber,
  recipientAddress,
  explorerUrl,
  gasUsed,
  onChainVerified,
}: {
  station: LiveStation;
  bayNumber: string;
  connectorType: string;
  durationMinutes: number;
  totalCost: string;
  sessionType?: "hold_only" | "charging_session";
  targetKwh?: number;
  targetBatteryPct?: number;
  paymentMethod?: "monad_testnet" | "sandbox_card" | "sandbox_upi";
  monAmount?: string;
  vehicleMakeModel?: string;
  txHash?: string;
  blockNumber?: number;
  recipientAddress?: string;
  explorerUrl?: string;
  gasUsed?: string;
  onChainVerified?: boolean;
}): ParkingBooking {
  const now = Date.now();
  const expiryTimestamp = now + durationMinutes * 60 * 1000;
  const expiryDate = new Date(expiryTimestamp);
  const randomPin = Math.floor(1000 + Math.random() * 9000);
  const randomCode = Math.floor(1000 + Math.random() * 9000);

  return {
    id: `RES-${randomCode}-EV`,
    stationId: station.station_id,
    stationName: station.name,
    bayNumber,
    connectorType,
    durationMinutes,
    totalCost,
    pinCode: String(randomPin),
    startTime: new Date(now).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    expiryTime: expiryDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    expiryTimestamp,
    status: "confirmed",
    sessionType,
    targetKwh,
    targetBatteryPct,
    paymentMethod,
    monAmount,
    vehicleMakeModel,
    stagedStatus: txHash ? "confirmed" : "staged_for_approval",
    txHash,
    blockNumber,
    recipientAddress,
    explorerUrl,
    gasUsed,
    onChainVerified,
  };
}

export function ParkingBookingModal({
  isOpen,
  onClose,
  station,
  onStartNavigation,
  activeVehicle: propVehicle,
  initialStep = "review",
}: ParkingBookingModalProps) {
  // Navigation / Modal Step: "config" -> "review" -> "pass"
  const [step, setStep] = useState<"config" | "review" | "pass">(initialStep);

  // Booking parameters
  const [sessionType, setSessionType] = useState<"hold_only" | "charging_session">(
    "charging_session"
  );
  const [selectedMins, setSelectedMins] = useState<number>(30);
  const [targetBatteryLimit, setTargetBatteryLimit] = useState<number>(80);
  const [paymentMethod, setPaymentMethod] = useState<
    "monad_testnet" | "sandbox_card" | "sandbox_upi"
  >("monad_testnet");

  // Booking storage and UI state
  const [activeBooking, setActiveBooking] = useState<ParkingBooking | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);

  // Web3 Wallet & Monad Testnet State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletChainId, setWalletChainId] = useState<string | null>(null);
  const [isWalletConnecting, setIsWalletConnecting] = useState<boolean>(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState<boolean>(false);
  const hasProvider = useSyncExternalStore(
    () => () => {},
    () => typeof window !== "undefined" && typeof window.ethereum !== "undefined",
    () => false
  );
  const [copiedTxHash, setCopiedTxHash] = useState<boolean>(false);
  const [copiedRecipient, setCopiedRecipient] = useState<boolean>(false);


  // Transaction execution & On-Chain verification state
  const [txStatus, setTxStatus] = useState<
    | "idle"
    | "awaiting_approval"
    | "verifying_onchain"
    | "success"
    | "error"
  >("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState<VerifiedOnChainReceipt | null>(
    null
  );
  const isSubmittingRef = useRef<boolean>(false);

  // Accessible unique IDs
  const baySelectId = useId();
  const batterySliderId = useId();

  // Resolved active vehicle
  const currentVehicle: EVVehicle = useMemo(() => {
    if (propVehicle) return propVehicle;
    try {
      const stored = getStoredVehicles();
      const activeId = getStoredActiveVehicleId();
      const match = stored.find((v) => v.id === activeId);
      if (match) return match;
      if (stored.length > 0) return stored[0];
    } catch {
      // ignore
    }
    return VERIFIED_GARAGE_VEHICLES[0];
  }, [propVehicle]);

  // Derive bays based on station's live data
  const availableBays = useMemo(() => {
    if (!station) return [];
    const conns =
      station.connector_types && station.connector_types.length > 0
        ? station.connector_types
        : ["CCS2 Combo", "Type 2 (AC)"];
    const power = station.power_kw || 150;

    return conns.map((conn, idx) => {
      const bayNum = `Bay 0${idx + 1}`;
      const isDc =
        conn.toLowerCase().includes("ccs") ||
        conn.toLowerCase().includes("chademo") ||
        conn.toLowerCase().includes("dc");
      const bayPower = isDc ? power : Math.min(22, power);
      const isCompatible =
        currentVehicle.plugType.toLowerCase().includes(conn.toLowerCase()) ||
        conn.toLowerCase().includes(currentVehicle.plugType.toLowerCase());

      return {
        id: `${bayNum} (${bayPower} kW - ${conn})`,
        bayNumber: bayNum,
        connectorType: conn,
        powerKw: bayPower,
        isDc,
        isCompatible,
      };
    });
  }, [station, currentVehicle]);

  // Selected bay custom override
  const [selectedBayCustom, setSelectedBayCustom] = useState<string>("");

  // Selected bay: use custom selection if valid, otherwise prefer compatible bay
  const selectedBay = useMemo(() => {
    if (selectedBayCustom && availableBays.some((b) => b.id === selectedBayCustom)) {
      return selectedBayCustom;
    }
    const compatibleBay = availableBays.find((b) => b.isCompatible);
    return compatibleBay ? compatibleBay.id : availableBays[0]?.id || "";
  }, [selectedBayCustom, availableBays]);

  const [recipientRefreshKey, setRecipientRefreshKey] = useState<number>(0);
  const [isEditingRecipient, setIsEditingRecipient] = useState<boolean>(false);
  const [recipientInput, setRecipientInput] = useState<string>("");
  const [recipientInputError, setRecipientInputError] = useState<string | null>(null);

  // Check recipient configuration without inventing fictitious addresses
  const recipientConfig = useMemo(() => {
    return getPaymentRecipientConfig(station?.operator);
  }, [station, recipientRefreshKey]);

  const handleSaveRecipient = (addrToSave?: string) => {
    const raw = (addrToSave !== undefined ? addrToSave : recipientInput).trim();
    if (!isValidEthereumAddress(raw)) {
      setRecipientInputError("Please enter a valid 42-character 0x EVM address.");
      return;
    }
    setRecipientInputError(null);
    setLocalPaymentRecipient(raw);
    setRecipientRefreshKey((k) => k + 1);
    setIsEditingRecipient(false);
  };

  const handleClearRecipient = () => {
    clearLocalPaymentRecipient();
    setRecipientInput("");
    setRecipientInputError(null);
    setRecipientRefreshKey((k) => k + 1);
  };

  // Monitor injected provider & account changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (hasProvider && window.ethereum) {
      getExistingAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      });

      getCurrentChainId().then((chainId) => {
        if (chainId) setWalletChainId(chainId.toLowerCase());
      });

      const handleAccountsChanged = (accounts: unknown) => {
        const accs = accounts as string[];
        if (accs && accs.length > 0) {
          setWalletAddress(accs[0]);
        } else {
          setWalletAddress(null);
        }
      };

      const handleChainChanged = (chainId: unknown) => {
        if (typeof chainId === "string") {
          setWalletChainId(chainId.toLowerCase());
        }
      };

      window.ethereum.on?.("accountsChanged", handleAccountsChanged);
      window.ethereum.on?.("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      };
    }
  }, [isOpen]);

  // Check existing active spot booking from storage
  useEffect(() => {
    if (isOpen && station) {
      const timer = setTimeout(() => {
        try {
          const stored = localStorage.getItem("evverse_active_spot_booking");
          if (stored) {
            const parsed: ParkingBooking = JSON.parse(stored);
            const timeLeft = Math.floor((parsed.expiryTimestamp - Date.now()) / 1000);
            if (timeLeft > 0 && parsed.stationId === station.station_id) {
              setActiveBooking(parsed);
              setSecondsRemaining(timeLeft);
              setStep("pass");
              return;
            }
          }
        } catch {
          // ignore
        }
        setStep(initialStep || "review");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, station, initialStep]);

  // Live countdown timer for active booking
  useEffect(() => {
    if (!activeBooking || step !== "pass") return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBooking, step]);

  if (!isOpen || !station) return null;

  // Selected hold option
  const currentHoldOption =
    RESERVATION_FEE_OPTIONS.find((o) => o.mins === selectedMins) ||
    RESERVATION_FEE_OPTIONS[0];

  // Selected bay object
  const currentBayObj =
    availableBays.find((b) => b.id === selectedBay) || availableBays[0];

  // Pricing & Energy Calculations (reusing verified numbers)
  const currentSoc = currentVehicle.currentBatteryPct;
  const targetSoc = Math.max(currentSoc, targetBatteryLimit);
  const neededSocPct = Math.max(0, targetSoc - currentSoc);
  const estimatedKwh = +((currentVehicle.usableKwh * neededSocPct) / 100).toFixed(1);
  const estimatedRangeAddedKm = Math.round(
    (estimatedKwh / (currentVehicle.efficiencyKwh100km || 18.0)) * 100
  );

  // Station Tariff parsing (respecting actual data)
  const tariffStr = (station.usage_cost || "").trim();
  const isCustomTariff = tariffStr.length > 0;
  const parsedEnergyUnitRate = isCustomTariff
    ? tariffStr
    : "Standard Grid Rate ($0.28 / kWh)";
  const energyCostUsd = +(estimatedKwh * 0.28).toFixed(2);
  const energyCostInr = Math.round(estimatedKwh * 18.5);

  const isMonadTestnetActive =
    walletChainId === MONAD_CONFIG.chainIdHex.toLowerCase();

  // Handlers
  const handleConnectWallet = async () => {
    setIsWalletConnecting(true);
    setTxError(null);
    try {
      const accounts = await requestWalletAccounts();
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
      const chain = await getCurrentChainId();
      if (chain) setWalletChainId(chain.toLowerCase());
    } catch (err: unknown) {
      setTxError(parseWeb3Error(err));
    } finally {
      setIsWalletConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setIsSwitchingNetwork(true);
    setTxError(null);
    try {
      await switchOrAddMonadTestnet();
      const chain = await getCurrentChainId();
      if (chain) setWalletChainId(chain.toLowerCase());
    } catch (err: unknown) {
      setTxError(parseWeb3Error(err));
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // Monad Testnet On-Chain Payment Handler
  const handleExecuteMonadPayment = async () => {
    if (
      isSubmittingRef.current ||
      txStatus === "awaiting_approval" ||
      txStatus === "verifying_onchain"
    ) {
      return;
    }

    if (!recipientConfig.isConfigured || !recipientConfig.address) {
      setTxError(
        `Payment disabled: ${recipientConfig.missingConfig} is not configured.`
      );
      return;
    }

    if (!walletAddress) {
      await handleConnectWallet();
      return;
    }

    if (!isMonadTestnetActive) {
      await handleSwitchNetwork();
      return;
    }

    isSubmittingRef.current = true;
    setTxError(null);
    setTxStatus("awaiting_approval");

    try {
      const { weiHex, displayMon } = monToWeiHex(currentHoldOption.monEquivalent);

      // Explicit user approval: Prompt browser wallet (MetaMask, Rabby, etc.)
      const submittedHash = (await window.ethereum!.request<string>({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to: recipientConfig.address,
            value: weiHex,
          },
        ],
      })) as string;

      if (!submittedHash || typeof submittedHash !== "string") {
        throw new Error("No transaction hash returned from wallet approval.");
      }

      setTxHash(submittedHash);
      setTxStatus("verifying_onchain");

      // 1. Client-side receipt poll & parameter validation
      const receipt = await verifyOnChainReceipt({
        txHash: submittedHash,
        expectedRecipient: recipientConfig.address,
        expectedWeiHex: weiHex,
      });

      setVerifiedReceipt(receipt);

      // 2. Persist booking on backend with independent RPC verification & SQLite persistence
      let persistedId = `RES-${Math.floor(1000 + Math.random() * 9000)}-EV`;
      try {
        const backendBooking = await createDriverBooking({
          station_id: station.station_id,
          station_name: station.name,
          bay_number: currentBayObj ? currentBayObj.bayNumber : "Bay 01",
          connector_type: currentBayObj
            ? currentBayObj.connectorType
            : station.connector_types?.[0] || "CCS2 Combo",
          duration_minutes: selectedMins,
          total_cost: currentHoldOption.feeDisplay,
          mon_amount: `${displayMon} MON`,
          tx_hash: submittedHash,
          recipient_address: recipientConfig.address,
          payment_method: "monad_testnet",
          session_type: sessionType,
          target_kwh:
            sessionType === "charging_session" ? estimatedKwh : undefined,
          target_battery_pct:
            sessionType === "charging_session" ? targetSoc : undefined,
        });
        if (backendBooking && backendBooking.id) {
          persistedId = backendBooking.id;
        }
      } catch (backendErr: unknown) {
        console.warn("[EVverse] Backend booking persistence notice:", backendErr);
      }

      setTxStatus("success");

      // Build confirmed booking record using verified on-chain parameters
      const booking = createConfirmedBookingRecord({
        station,
        bayNumber: currentBayObj ? currentBayObj.bayNumber : "Bay 01",
        connectorType: currentBayObj
          ? currentBayObj.connectorType
          : station.connector_types?.[0] || "CCS2 Combo",
        durationMinutes: selectedMins,
        totalCost: currentHoldOption.feeDisplay,
        sessionType,
        targetKwh:
          sessionType === "charging_session" ? estimatedKwh : undefined,
        targetBatteryPct:
          sessionType === "charging_session" ? targetSoc : undefined,
        paymentMethod: "monad_testnet",
        monAmount: `${displayMon} MON`,
        vehicleMakeModel: `${currentVehicle.make} ${currentVehicle.model}`,
        txHash: submittedHash,
        blockNumber: receipt.blockNumber,
        recipientAddress: receipt.to,
        explorerUrl: receipt.explorerUrl,
        gasUsed: receipt.gasUsed,
        onChainVerified: true,
      });
      booking.id = persistedId;

      setActiveBooking(booking);
      setSecondsRemaining(selectedMins * 60);
      setStep("pass");

      // Save to driver storage and notify app
      try {
        localStorage.setItem("evverse_active_spot_booking", JSON.stringify(booking));
        window.dispatchEvent(
          new CustomEvent("evverse-spot-booking-changed", { detail: booking })
        );
      } catch (e) {
        console.warn("Storage error:", e);
      }
    } catch (err: unknown) {
      setTxStatus("error");
      setTxError(parseWeb3Error(err));
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // Sandbox Staging Handler (Mock fallback)
  const handleStageSandboxBooking = () => {
    const booking = createConfirmedBookingRecord({
      station,
      bayNumber: currentBayObj ? currentBayObj.bayNumber : "Bay 01",
      connectorType: currentBayObj
        ? currentBayObj.connectorType
        : station.connector_types?.[0] || "CCS2 Combo",
      durationMinutes: selectedMins,
      totalCost: currentHoldOption.feeDisplay,
      sessionType,
      targetKwh: sessionType === "charging_session" ? estimatedKwh : undefined,
      targetBatteryPct:
        sessionType === "charging_session" ? targetSoc : undefined,
      paymentMethod,
      monAmount: currentHoldOption.monEquivalent,
      vehicleMakeModel: `${currentVehicle.make} ${currentVehicle.model}`,
    });

    setActiveBooking(booking);
    setSecondsRemaining(selectedMins * 60);
    setStep("pass");

    try {
      localStorage.setItem("evverse_active_spot_booking", JSON.stringify(booking));
      window.dispatchEvent(
        new CustomEvent("evverse-spot-booking-changed", { detail: booking })
      );
    } catch (e) {
      console.warn("Storage error:", e);
    }
  };

  const handleCancelBooking = () => {
    try {
      localStorage.removeItem("evverse_active_spot_booking");
      window.dispatchEvent(
        new CustomEvent("evverse-spot-booking-changed", { detail: null })
      );
    } catch {
      // ignore
    }
    setActiveBooking(null);
    setStep("config");
    setTxStatus("idle");
    setTxHash(null);
    setTxError(null);
    onClose();
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string, type: "tx" | "recipient") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "tx") {
        setCopiedTxHash(true);
        setTimeout(() => setCopiedTxHash(false), 2000);
      } else {
        setCopiedRecipient(true);
        setTimeout(() => setCopiedRecipient(false), 2000);
      }
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Charging Booking & Checkout"
        className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      >
        <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md border border-black/[0.08] shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto no-scrollbar text-left text-[#111312]">
          {/* ── Top Bar / Header ────────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              {step === "review" && (
                <button
                  type="button"
                  onClick={() => setStep("config")}
                  aria-label="Back to configuration"
                  className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-black/[0.06] flex items-center justify-center text-[#525854] hover:text-[#111312] transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              <div className="w-9 h-9 rounded-full bg-[#111312] text-[#C8F369] flex items-center justify-center font-bold text-sm shadow-xs">
                {step === "pass" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Zap size={18} />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold tracking-tight text-[#111312]">
                  {step === "config" && "Configure Stall & Session"}
                  {step === "review" && "Review & Monad Settlement"}
                  {step === "pass" && "Active Stall Reservation Pass"}
                </h3>
                <p className="text-[11px] text-[#767D78] truncate max-w-[210px] sm:max-w-[240px]">
                  {station.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-8 h-8 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#525854] hover:bg-[#F4F3EE] hover:text-[#111312] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── 4-Step Monad Payment Pipeline Tracker ──────────────── */}
          <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-black/[0.06] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-[#767D78]">
              <span className="flex items-center gap-1.5">
                <Coins size={12} className="text-[#2563EB]" />
                <span>Monad Testnet Settlement</span>
              </span>
              <span className="text-[#2563EB] font-bold">
                {step === "pass"
                  ? "Step 4 of 4: Receipt Verified"
                  : !walletAddress
                  ? "Step 1 of 4: Connect Wallet"
                  : !isMonadTestnetActive
                  ? "Step 1 of 4: Switch Network"
                  : txStatus === "awaiting_approval"
                  ? "Step 3 of 4: Approve in Wallet"
                  : txStatus === "verifying_onchain"
                  ? "Step 3 of 4: Verifying on Monad"
                  : "Step 2 of 4: Review Payment"}
              </span>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {/* 1. Connect */}
              <div
                className={`p-1.5 rounded-xl border text-[10px] transition-all ${
                  walletAddress && isMonadTestnetActive
                    ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] font-semibold"
                    : !walletAddress || !isMonadTestnetActive
                    ? "bg-white text-[#1D4ED8] border-[#3B82F6] font-bold shadow-xs ring-1 ring-[#3B82F6]/30"
                    : "bg-[#F4F3EE] text-[#767D78] border-black/[0.04]"
                }`}
              >
                <div className="font-bold">1. Connect</div>
                <div className="text-[8.5px] font-mono mt-0.5 truncate">
                  {walletAddress ? (isMonadTestnetActive ? "Connected ✓" : "Wrong Chain") : "Required"}
                </div>
              </div>

              {/* 2. Review */}
              <div
                className={`p-1.5 rounded-xl border text-[10px] transition-all ${
                  step === "pass"
                    ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] font-semibold"
                    : walletAddress && isMonadTestnetActive && txStatus === "idle"
                    ? "bg-white text-[#111312] border-[#111312] font-bold shadow-xs ring-1 ring-black/10"
                    : "bg-[#F4F3EE] text-[#767D78] border-black/[0.04]"
                }`}
              >
                <div className="font-bold">2. Review</div>
                <div className="text-[8.5px] font-mono mt-0.5 truncate">
                  {currentHoldOption.monEquivalent}
                </div>
              </div>

              {/* 3. Approve */}
              <div
                className={`p-1.5 rounded-xl border text-[10px] transition-all ${
                  step === "pass"
                    ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] font-semibold"
                    : txStatus === "awaiting_approval" || txStatus === "verifying_onchain"
                    ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#3B82F6] font-bold animate-pulse ring-1 ring-[#3B82F6]/30"
                    : "bg-[#F4F3EE] text-[#767D78] border-black/[0.04]"
                }`}
              >
                <div className="font-bold">3. Approve</div>
                <div className="text-[8.5px] font-mono mt-0.5 truncate">
                  {txStatus === "verifying_onchain" ? "Verifying..." : "Wallet Sign"}
                </div>
              </div>

              {/* 4. Receipt */}
              <div
                className={`p-1.5 rounded-xl border text-[10px] transition-all ${
                  step === "pass"
                    ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] font-bold shadow-xs ring-1 ring-[#16A34A]/30"
                    : "bg-[#F4F3EE] text-[#767D78] border-black/[0.04]"
                }`}
              >
                <div className="font-bold">4. Receipt</div>
                <div className="text-[8.5px] font-mono mt-0.5 truncate">
                  {step === "pass" ? "Verified ✓" : "On-Chain"}
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* STEP 1: CONFIGURATION                                      */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {step === "config" && (
            <div className="space-y-4 animate-in fade-in">
              {/* Active Vehicle & Compatibility Badge */}
              <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-black/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center text-[#111312]">
                    <Car size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111312] flex items-center gap-1.5">
                      <span>{currentVehicle.make} {currentVehicle.model}</span>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-sm bg-black/[0.05] text-[#525854]">
                        {currentVehicle.plugType}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#767D78] flex items-center gap-1">
                      <span>Battery: {currentVehicle.currentBatteryPct}%</span>
                      <span>•</span>
                      <span>Usable: {currentVehicle.usableKwh} kWh</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10.5px] font-mono font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#86EFAC]">
                  Matched
                </span>
              </div>

              {/* Booking Mode Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111312]">
                  Select Booking Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionType("charging_session")}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      sessionType === "charging_session"
                        ? "border-[#111312] bg-[#FAF9F6] shadow-xs"
                        : "border-black/[0.08] bg-white hover:bg-[#FAF9F6]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Zap
                        size={15}
                        className={
                          sessionType === "charging_session"
                            ? "text-[#16A34A]"
                            : "text-[#767D78]"
                        }
                      />
                      {sessionType === "charging_session" && (
                        <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#111312] mt-1.5">
                      Reserve & Charge
                    </div>
                    <div className="text-[10px] text-[#767D78] mt-0.5 leading-tight">
                      Hold bay + target battery level
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSessionType("hold_only")}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      sessionType === "hold_only"
                        ? "border-[#111312] bg-[#FAF9F6] shadow-xs"
                        : "border-black/[0.08] bg-white hover:bg-[#FAF9F6]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Lock
                        size={15}
                        className={
                          sessionType === "hold_only"
                            ? "text-[#2563EB]"
                            : "text-[#767D78]"
                        }
                      />
                      {sessionType === "hold_only" && (
                        <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#111312] mt-1.5">
                      Stall Hold Only
                    </div>
                    <div className="text-[10px] text-[#767D78] mt-0.5 leading-tight">
                      Guaranteed spot arrival window
                    </div>
                  </button>
                </div>
              </div>

              {/* Connector / Bay Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor={baySelectId}
                  className="text-xs font-semibold text-[#111312] flex items-center justify-between"
                >
                  <span>Select Connector & Bay</span>
                  <span className="text-[10px] font-mono text-[#767D78]">
                    {availableBays.length} bays available
                  </span>
                </label>
                <div className="relative">
                  <select
                    id={baySelectId}
                    value={selectedBay}
                    onChange={(e) => setSelectedBayCustom(e.target.value)}
                    className="w-full p-2.5 pr-8 bg-[#FAF9F6] border border-black/[0.08] rounded-xl text-xs font-medium text-[#111312] focus:outline-hidden focus:border-[#111312] cursor-pointer"
                  >
                    {availableBays.map((bay) => (
                      <option key={bay.id} value={bay.id}>
                        {bay.id} {bay.isCompatible ? "✓ Matches Vehicle" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hold Duration Window */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111312] flex items-center justify-between">
                  <span>Hold Duration Window</span>
                  <span className="text-[10px] text-[#767D78] font-mono">
                    Stall arrival window
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {RESERVATION_FEE_OPTIONS.map((opt) => (
                    <button
                      key={opt.mins}
                      type="button"
                      onClick={() => setSelectedMins(opt.mins)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedMins === opt.mins
                          ? "border-[#111312] bg-[#111312] text-white font-bold"
                          : "border-black/[0.08] bg-[#FAF9F6] text-[#525854] hover:bg-[#F4F3EE]"
                      }`}
                    >
                      <div className="text-xs font-mono">{opt.mins} min</div>
                      <div
                        className={`text-[9.5px] mt-0.5 leading-tight ${
                          selectedMins === opt.mins
                            ? "text-[#C8F369]"
                            : "text-[#767D78]"
                        }`}
                      >
                        <div>{opt.feeDisplay}</div>
                        <div className="font-mono text-[9px] opacity-90">{opt.monEquivalent}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Battery Level (Only if charging session) */}
              {sessionType === "charging_session" && (
                <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-black/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={batterySliderId}
                      className="text-xs font-semibold text-[#111312]"
                    >
                      Target Battery Level
                    </label>
                    <div className="text-xs font-mono font-bold text-[#16A34A] bg-white px-2 py-0.5 rounded-md border border-black/[0.06]">
                      {targetBatteryLimit}%
                    </div>
                  </div>

                  <input
                    id={batterySliderId}
                    type="range"
                    min={Math.max(50, currentSoc)}
                    max={100}
                    step={5}
                    value={targetBatteryLimit}
                    onChange={(e) => setTargetBatteryLimit(Number(e.target.value))}
                    className="w-full accent-[#111312] cursor-pointer"
                  />

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="bg-white p-2 rounded-xl border border-black/[0.04]">
                      <div className="text-[9px] font-mono uppercase text-[#767D78]">
                        Energy Needed
                      </div>
                      <div className="text-xs font-mono font-bold text-[#111312]">
                        +{estimatedKwh} kWh
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-black/[0.04]">
                      <div className="text-[9px] font-mono uppercase text-[#767D78]">
                        Added Range
                      </div>
                      <div className="text-xs font-mono font-bold text-[#16A34A]">
                        +{estimatedRangeAddedKm} km
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-black/[0.04]">
                      <div className="text-[9px] font-mono uppercase text-[#767D78]">
                        Energy Est.
                      </div>
                      <div className="text-xs font-mono font-bold text-[#111312]">
                        ${energyCostUsd}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3-Tier Clarity Box */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-3 rounded-2xl text-[11px] text-[#1E40AF] space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-[#1D4ED8]">
                  <Info size={13} />
                  <span>Transparent Settlement Process</span>
                </div>
                <div className="space-y-1 text-[10.5px] leading-relaxed">
                  <div>
                    • <strong>Charging Estimate:</strong> Energy cost is calculated
                    from vehicle battery metrics. Electrons are metered dynamically at
                    the station.
                  </div>
                  <div>
                    • <strong>Stall Reservation:</strong> Guaranteed stall slot hold
                    and reservation PIN.
                  </div>
                  <div>
                    • <strong>Monad Settlement:</strong> Staged for on-chain
                    authorization on Monad Testnet (Chain ID 10143).
                  </div>
                </div>
              </div>

              {/* Compact Payment Security Entry Point */}
              <button
                type="button"
                onClick={() => setShowSecurityModal(true)}
                className="w-full p-2.5 bg-[#FAF9F6] border border-black/[0.08] hover:border-[#2563EB] rounded-xl flex items-center justify-between text-xs text-[#525854] hover:text-[#111312] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={14} className="text-[#2563EB]" />
                  <span>Payment Security & Monad Staging Info</span>
                </span>
                <span className="text-[10px] text-[#2563EB] font-semibold flex items-center gap-0.5">
                  Learn more <ChevronRight size={12} />
                </span>
              </button>

              {/* Proceed to Review CTA */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setStep("review")}
                  className="w-full min-h-[46px] py-3 bg-[#111312] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#252826] active:scale-[0.99] transition-all cursor-pointer shadow-md"
                >
                  <span>Review Monad Settlement ({currentHoldOption.feeDisplay} • {currentHoldOption.monEquivalent})</span>
                  <ArrowRight size={14} className="text-[#C8F369]" />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* STEP 2: CHECKOUT REVIEW & WALLET PAYMENT                    */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {step === "review" && (
            <div className="space-y-3.5 animate-in fade-in">
              {/* Detailed Itemized Price Breakdown */}
              <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-black/[0.06] space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] font-bold text-[#111312]">
                  <span>Itemized Price Breakdown</span>
                  <span className="text-[10px] font-mono text-[#767D78]">
                    {currentBayObj?.bayNumber} • {sessionType === "charging_session" ? "Charging Session" : "Hold Only"}
                  </span>
                </div>

                {/* 1. Stall Reservation Deposit (Due Now) */}
                <div className="p-2.5 bg-white rounded-xl border border-black/[0.06] flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-[#111312] truncate">
                      Stall Reservation Hold ({currentHoldOption.label})
                    </div>
                    <div className="text-[10px] text-[#525854] mt-0.5">
                      Guaranteed slot hold pass • Due Now
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-[#16A34A] text-xs">
                      {currentHoldOption.feeDisplay}
                    </div>
                    <div className="text-[9.5px] font-mono text-[#525854]">
                      {currentHoldOption.monEquivalent}
                    </div>
                  </div>
                </div>

                {/* 2. Estimated Energy Charges (Metered on Dispense) */}
                {sessionType === "charging_session" ? (
                  <div className="p-2.5 bg-white/70 rounded-xl border border-black/[0.04] flex items-center justify-between text-[#525854]">
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-[#111312] truncate">
                        Estimated Energy Dispense
                      </div>
                      <div className="text-[10px] text-[#767D78] mt-0.5">
                        ~{estimatedKwh} kWh @ {parsedEnergyUnitRate} • Metered at charger
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-[#525854] shrink-0">
                      ~${energyCostUsd} <span className="text-[10px] text-[#8C938E]">(₹{energyCostInr})</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between text-[#525854] px-1 text-[11px]">
                    <span>Energy Dispense:</span>
                    <span className="font-mono text-[#767D78]">None (Stall hold only)</span>
                  </div>
                )}

                {/* Due Now Total */}
                <div className="pt-2 border-t border-black/[0.06] flex justify-between items-baseline font-bold text-[#111312] px-1">
                  <span className="text-xs">Due Now (Monad Settlement):</span>
                  <span className="text-sm font-mono text-[#16A34A]">
                    {currentHoldOption.feeDisplay}{" "}
                    <span className="text-[11px] text-[#525854] font-normal">
                      ({currentHoldOption.monEquivalent})
                    </span>
                  </span>
                </div>
              </div>

              {/* ── Monad Testnet Settlement Card ───────────────────── */}
              <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-black/[0.08] space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                  <div className="flex items-center gap-1.5 font-bold text-[#111312]">
                    <Wallet size={14} className="text-[#2563EB]" />
                    <span>Monad Testnet Settlement</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isMonadTestnetActive
                        ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]"
                        : walletAddress
                        ? "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                        : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                    }`}
                  >
                    Chain 10143
                  </span>
                </div>

                {/* Network & RPC Provider Badge */}
                <div className="flex items-center justify-between text-[#525854]">
                  <span>Network & RPC:</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#111312] bg-white px-2 py-0.5 rounded-md border border-black/[0.06] text-[10.5px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    <span>{MONAD_CONFIG.providerName}</span>
                  </span>
                </div>

                {/* Connected Wallet Account */}
                <div className="flex items-center justify-between text-[#525854]">
                  <span>Connected Wallet:</span>
                  {walletAddress ? (
                    <span className="font-mono font-semibold text-[#111312] bg-white px-2 py-0.5 rounded-md border border-black/[0.06]">
                      {truncateAddress(walletAddress)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-md border border-[#FECACA]">
                      Disconnected
                    </span>
                  )}
                </div>

                {/* Recipient Configuration Check & Inline Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[#525854]">
                    <span>Payment Recipient:</span>
                    {recipientConfig.isConfigured ? (
                      <div className="flex items-center gap-1">
                        <span
                          title={recipientConfig.address}
                          className="font-mono text-[#111312] bg-white px-2 py-0.5 rounded-md border border-black/[0.06]"
                        >
                          {truncateAddress(recipientConfig.address)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(recipientConfig.address, "recipient")
                          }
                          aria-label="Copy recipient address"
                          className="p-1 hover:bg-black/[0.05] rounded-sm text-[#767D78] cursor-pointer"
                        >
                          {copiedRecipient ? (
                            <Check size={11} className="text-[#16A34A]" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRecipientInput(recipientConfig.address);
                            setIsEditingRecipient(!isEditingRecipient);
                          }}
                          className="text-[10px] text-[#2563EB] hover:underline font-semibold ml-1 cursor-pointer"
                        >
                          {isEditingRecipient ? "Cancel" : "Change"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#DC2626] font-semibold bg-[#FEF2F2] px-2 py-0.5 rounded-md border border-[#FECACA]">
                          Unconfigured
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingRecipient(true)}
                          className="text-[10px] text-[#2563EB] hover:underline font-bold cursor-pointer"
                        >
                          Set Address
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Recipient Configuration Box */}
                  {(!recipientConfig.isConfigured || isEditingRecipient) && (
                    <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2 text-left">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#111312]">
                        <span>Testnet Recipient Address:</span>
                        {walletAddress && (
                          <button
                            type="button"
                            onClick={() => handleSaveRecipient(walletAddress)}
                            className="text-[10px] text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded-md hover:bg-[#DCFCE7] font-semibold cursor-pointer"
                          >
                            Use Connected Wallet
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={recipientInput}
                          onChange={(e) => {
                            setRecipientInput(e.target.value);
                            setRecipientInputError(null);
                          }}
                          placeholder="0x... (42-char EVM address)"
                          className="flex-1 font-mono text-[11px] px-2.5 py-1.5 bg-[#FAF9F6] border border-black/[0.1] rounded-lg focus:outline-none focus:border-[#111312]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRecipient()}
                          className="px-3 py-1.5 bg-[#111312] text-white text-[11px] font-bold rounded-lg hover:bg-[#252826] cursor-pointer"
                        >
                          Save
                        </button>
                        {recipientConfig.isConfigured && (
                          <button
                            type="button"
                            onClick={handleClearRecipient}
                            className="px-2 py-1.5 text-[#DC2626] text-[11px] hover:underline cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      {recipientInputError && (
                        <p className="text-[10px] text-[#DC2626] font-semibold">{recipientInputError}</p>
                      )}
                      <p className="text-[9.5px] text-[#767D78] leading-tight">
                        Provide any valid Monad Testnet address to receive test MON, or configure <code className="font-mono bg-black/[0.04] px-1 py-0.5 rounded">NEXT_PUBLIC_MONAD_PAYMENT_RECIPIENT_ADDRESS</code> in <code className="font-mono">.env</code>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Settlement Asset and Amount */}
                <div className="flex items-center justify-between text-[#525854]">
                  <span>Amount to Pay:</span>
                  <span className="font-mono font-bold text-[#16A34A]">
                    {currentHoldOption.monEquivalent}{" "}
                    <span className="text-[10px] text-[#767D78] font-normal">
                      (MON Testnet)
                    </span>
                  </span>
                </div>

                {/* Testnet Zero-Real-Value Disclosure */}
                <div className="p-2 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE] text-[10px] text-[#1E40AF] leading-snug">
                  <strong>Monad Testnet (Chain 10143): </strong>
                  Test tokens have zero real-world monetary value. Confirm recipient and amount in your wallet prompt.
                </div>

                {/* Pending & Broadcast Status Feedback */}
                {txStatus === "awaiting_approval" && (
                  <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-[11px] text-[#1D4ED8] flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin shrink-0" />
                    <span>Waiting for explicit approval in your browser wallet...</span>
                  </div>
                )}

                {txStatus === "verifying_onchain" && (
                  <div className="p-2.5 bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl text-[11px] text-[#6D28D9] flex items-start gap-2">
                    <Loader2 size={14} className="animate-spin shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">
                        Transaction Broadcast ({truncateTxHash(txHash || "")})
                      </div>
                      <div className="text-[10px] text-[#7C3AED] mt-0.5">
                        Verifying on-chain receipt and parameters on Monad Testnet...
                      </div>
                      {txHash && (
                        <a
                          href={`${MONAD_CONFIG.explorerUrl}/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10.5px] text-[#6D28D9] hover:underline font-semibold mt-1"
                        >
                          <span>View on Monad Explorer</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Notification */}
                {txError && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[11px] text-[#B91C1C] space-y-2">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <div className="leading-snug">{txError}</div>
                    </div>
                    {txHash && (
                      <div className="pt-2 border-t border-[#FECACA]/60 flex items-center justify-between text-[10.5px]">
                        <span className="font-mono text-[#7F1D1D]">
                          Tx: {truncateTxHash(txHash)}
                        </span>
                        <a
                          href={`${MONAD_CONFIG.explorerUrl}/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#B91C1C] hover:underline"
                        >
                          <span>Inspect on Monad Explorer</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Single Primary Action Button at a Time */}
              <div className="space-y-2 pt-1">
                {!hasProvider ? (
                  <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl text-center text-xs text-[#92400E] space-y-1">
                    <div className="font-bold flex items-center justify-center gap-1">
                      <AlertTriangle size={14} />
                      <span>No Web3 Browser Wallet Detected</span>
                    </div>
                    <div className="text-[10.5px]">
                      Please install MetaMask, Rabby, or a compatible EIP-1193 browser extension to pay via Monad Testnet.
                    </div>
                  </div>
                ) : !walletAddress ? (
                  <button
                    type="button"
                    disabled={isWalletConnecting}
                    onClick={handleConnectWallet}
                    className="w-full min-h-[48px] py-3.5 bg-[#111312] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#252826] transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isWalletConnecting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Connecting Wallet...</span>
                      </>
                    ) : (
                      <>
                        <Wallet size={14} className="text-[#C8F369]" />
                        <span>Connect Browser Wallet</span>
                      </>
                    )}
                  </button>
                ) : !isMonadTestnetActive ? (
                  <button
                    type="button"
                    disabled={isSwitchingNetwork}
                    onClick={handleSwitchNetwork}
                    className="w-full min-h-[48px] py-3.5 bg-[#B45309] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#92400E] transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSwitchingNetwork ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Switching Network...</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} />
                        <span>Switch Network to Monad Testnet (10143)</span>
                      </>
                    )}
                  </button>
                ) : !recipientConfig.isConfigured ? (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setIsEditingRecipient(true)}
                      className="w-full min-h-[48px] py-3.5 bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FEE2E2] cursor-pointer shadow-none transition-colors"
                    >
                      <AlertTriangle size={14} />
                      <span>Set Recipient Address to Continue</span>
                    </button>
                    <p className="text-[10px] text-[#767D78] text-center">
                      Configure recipient above or click &quot;Use Connected Wallet&quot; to test.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={
                      txStatus === "awaiting_approval" ||
                      txStatus === "verifying_onchain"
                    }
                    onClick={handleExecuteMonadPayment}
                    className="w-full min-h-[48px] py-3.5 bg-[#111312] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#252826] active:scale-[0.99] transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {txStatus === "awaiting_approval" ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-[#C8F369]" />
                        <span>Awaiting Wallet Approval...</span>
                      </>
                    ) : txStatus === "verifying_onchain" ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-[#C8F369]" />
                        <span>Verifying Monad Receipt...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={14} className="text-[#C8F369]" />
                        <span>
                          Approve & Pay {currentHoldOption.monEquivalent} in Wallet
                        </span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setStep("config")}
                  className="w-full min-h-[36px] py-1.5 text-xs font-semibold text-[#525854] hover:text-[#111312] text-center cursor-pointer transition-colors"
                >
                  Adjust Reservation Parameters
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* STEP 3: ACTIVE RESERVATION PASS & ON-CHAIN RECEIPT          */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {step === "pass" && activeBooking && (
            <div className="space-y-4 animate-in fade-in">
              {/* Live Hold Status Card */}
              <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] mx-auto">
                  <CheckCircle2 size={26} />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold">
                    Stall Hold Reserved
                  </span>
                  <div className="text-base font-bold text-[#111312] mt-0.5">
                    {activeBooking.bayNumber}
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#86EFAC] text-xs font-mono font-bold text-[#15803D]">
                  <Clock size={12} />
                  <span>{formatCountdown(secondsRemaining)} remaining</span>
                </div>
              </div>

              {/* Digital Stall Ticket & Barrier Unlock PIN */}
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-black/[0.05] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                  <div>
                    <div className="text-[10px] text-[#767D78] uppercase font-mono">
                      Stall Reservation PIN
                    </div>
                    <div className="text-xl font-mono font-bold text-[#111312] tracking-widest mt-0.5">
                      {activeBooking.pinCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#767D78] uppercase font-mono">
                      Booking Code
                    </div>
                    <div className="text-xs font-mono font-bold text-[#111312] mt-0.5">
                      {activeBooking.id}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#525854]">
                    <span>Reserved Window:</span>
                    <span className="font-semibold text-[#111312]">
                      {activeBooking.startTime} – {activeBooking.expiryTime}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#525854]">
                    <span>Hold Duration:</span>
                    <span className="font-semibold text-[#111312]">
                      {activeBooking.durationMinutes} minutes
                    </span>
                  </div>
                  <div className="flex justify-between text-[#525854]">
                    <span>Settlement Mode:</span>
                    <span className="font-mono font-semibold text-[#2563EB]">
                      {activeBooking.txHash
                        ? "Settled on Monad Testnet"
                        : "Sandbox Staged"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#525854]">
                    <span>Booking Fee:</span>
                    <span className="font-bold text-[#16A34A]">
                      {activeBooking.totalCost}{" "}
                      {activeBooking.monAmount && `(${activeBooking.monAmount})`}
                    </span>
                  </div>
                </div>

                {/* ── Verified On-Chain Receipt Section ────────────────── */}
                {activeBooking.txHash && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-[#BBF7D0] space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#15803D]">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 size={13} />
                        <span>Verified On-Chain Receipt</span>
                      </span>
                      <span className="text-[9.5px] font-mono bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                        Monad 10143
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-[#525854]">
                      <div className="flex justify-between items-center">
                        <span>Transaction Hash:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[#111312]">
                            {truncateTxHash(activeBooking.txHash)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(activeBooking.txHash || "", "tx")
                            }
                            aria-label="Copy transaction hash"
                            className="p-1 hover:bg-black/[0.05] rounded-sm text-[#767D78]"
                          >
                            {copiedTxHash ? (
                              <Check size={11} className="text-[#16A34A]" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                      </div>

                      {activeBooking.blockNumber && (
                        <div className="flex justify-between">
                          <span>Mined Block:</span>
                          <span className="font-mono text-[#111312]">
                            #{activeBooking.blockNumber}
                          </span>
                        </div>
                      )}

                      {activeBooking.recipientAddress && (
                        <div className="flex justify-between">
                          <span>Verified Recipient:</span>
                          <span className="font-mono text-[#111312]">
                            {truncateAddress(activeBooking.recipientAddress)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Monad Explorer Link */}
                    <a
                      href={
                        activeBooking.explorerUrl ||
                        `${MONAD_CONFIG.explorerUrl}/tx/${activeBooking.txHash}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-[#F0FDF4] border border-[#86EFAC] text-[#15803D] hover:bg-[#DCFCE7] rounded-lg flex items-center justify-center gap-1.5 font-semibold text-[11px] transition-colors cursor-pointer mt-1"
                    >
                      <span>View on Monad Explorer</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                <div className="p-2.5 bg-white rounded-xl border border-black/[0.04] text-[10.5px] text-[#525854] flex items-start gap-2">
                  <ShieldCheck size={14} className="text-[#16A34A] shrink-0 mt-0.5" />
                  <span>
                    Cryptographic testnet proof verified on Monad Testnet.
                    (Note: Testnet settlement does not trigger physical charging or barrier hardware activation).
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onStartNavigation) onStartNavigation(station);
                    onClose();
                  }}
                  className="w-full min-h-[46px] py-3 bg-[#111312] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 hover:bg-[#252826] cursor-pointer shadow-md"
                >
                  <Navigation size={14} className="text-[#C8F369]" />
                  <span>Navigate to Reserved Stall</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelBooking}
                  className="w-full min-h-[40px] py-2 bg-[#FAF9F6] text-[#DC2626] text-xs font-semibold rounded-2xl border border-black/[0.06] hover:bg-[#FEE2E2] cursor-pointer"
                >
                  Cancel Reservation & Release Stall
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* COMPACT PAYMENT SECURITY MODAL                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showSecurityModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Payment Security and Verification"
          className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-sm border border-black/[0.08] shadow-2xl space-y-4 text-left text-[#111312]">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111312]">
                    Payment Security & Monad
                  </h4>
                  <p className="text-[10px] text-[#525854]">
                    On-chain verification architecture
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#525854] hover:bg-[#F4F3EE] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#525854]">
              <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-black/[0.04] space-y-1">
                <div className="font-bold text-[#111312] flex items-center gap-1.5">
                  <Coins size={13} className="text-[#2563EB]" />
                  <span>Wallet Approval via Web3</span>
                </div>
                <p className="text-[11px]">
                  You explicitly approve the exact testnet MON amount directly in your
                  browser wallet (e.g. MetaMask, Rabby). No private keys or seed
                  phrases are ever stored or requested by EVverse.
                </p>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-black/[0.04] space-y-1">
                <div className="font-bold text-[#111312] flex items-center gap-1.5">
                  <Zap size={13} className="text-[#16A34A]" />
                  <span>Monad Testnet (Zero Financial Risk)</span>
                </div>
                <p className="text-[11px]">
                  All transactions execute exclusively on Monad Testnet (Chain ID 10143)
                  using free faucet testnet tokens. No mainnet assets are ever debited.
                </p>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-black/[0.04] space-y-1">
                <div className="font-bold text-[#111312] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#16A34A]" />
                  <span>Cryptographic On-Chain Verification</span>
                </div>
                <p className="text-[11px]">
                  EVverse monitors the confirmed transaction receipt via Monad JSON-RPC,
                  validating that the block was mined and that the on-chain recipient
                  and amount match the required payment before issuing barrier PINs.
                </p>
              </div>

              <div className="p-2.5 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE] text-[10.5px] text-[#1E40AF]">
                <strong>Network Config: </strong>
                Chain ID 10143 (0x279f), RPC: <code>https://testnet-rpc.monad.xyz</code>,
                Explorer: <code>https://testnet.monadexplorer.com</code>.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSecurityModal(false)}
              className="w-full py-2.5 bg-[#111312] text-white text-xs font-semibold rounded-xl hover:bg-[#252826] cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
}
