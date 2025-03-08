"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, Theme } from "@rainbow-me/rainbowkit";
import { getConfig } from "./config";

const customTheme: Theme = {
  blurs: {
    modalOverlay: "blur(8px)",
  },
  colors: {
    accentColor: "#7C3AED", // vivid purple
    accentColorForeground: "#FFFFFF",
    actionButtonBorder: "#4C1D95",
    actionButtonBorderMobile: "#4C1D95",
    actionButtonSecondaryBackground: "#6D28D9",
    closeButton: "#E5E7EB",
    closeButtonBackground: "#4C1D95",
    connectButtonBackground: "#7C3AED",
    connectButtonBackgroundError: "#EF4444",
    connectButtonInnerBackground: "#8B5CF6",
    connectButtonText: "#FFFFFF",
    connectButtonTextError: "#FFFFFF",
    connectionIndicator: "#22C55E",
    downloadBottomCardBackground: "#4C1D95",
    downloadTopCardBackground: "#6D28D9",
    error: "#EF4444",
    generalBorder: "#6D28D9",
    generalBorderDim: "#4C1D95",
    menuItemBackground: "#6D28D9",
    modalBackdrop: "rgba(76, 29, 149, 0.5)",
    modalBackground: "#1F1F1F",
    modalBorder: "#6D28D9",
    modalText: "#FFFFFF",
    modalTextDim: "#9CA3AF",
    modalTextSecondary: "#A78BFA",
    profileAction: "#4C1D95",
    profileActionHover: "#6D28D9",
    profileForeground: "#2D1D45",
    selectedOptionBorder: "#7C3AED",
    standby: "#A78BFA",
  },
  fonts: {
    body: "Inter, sans-serif",
  },
  radii: {
    actionButton: "9px",
    connectButton: "12px",
    menuButton: "9px",
    modal: "16px",
    modalMobile: "28px",
  },
  shadows: {
    connectButton: "0px 4px 12px rgba(124, 58, 237, 0.4)",
    dialog: "0px 8px 32px rgba(124, 58, 237, 0.32)",
    profileDetailsAction: "0px 2px 6px rgba(124, 58, 237, 0.24)",
    selectedOption: "0px 2px 6px rgba(124, 58, 237, 0.24)",
    selectedWallet: "0px 2px 6px rgba(124, 58, 237, 0.24)",
    walletLogo: "0px 2px 16px rgba(124, 58, 237, 0.16)",
  },
};

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={customTheme}
          modalSize="compact"
          initialChain={656476}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
