"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";

interface InitialBrandLoaderProps {
  children: ReactNode;
  duration?: number;
}

export default function InitialBrandLoader({ children, duration = 1800 }: InitialBrandLoaderProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), duration);
    return () => window.clearTimeout(timer);
  }, [duration]);

  return (
    <>
      <Box
        aria-hidden={!loading}
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 18% 22%, rgba(122, 56, 16, 0.12), transparent 38%), radial-gradient(circle at 84% 82%, rgba(0, 0, 0, 0.1), transparent 42%), #fff",
          opacity: loading ? 1 : 0,
          visibility: loading ? "visible" : "hidden",
          pointerEvents: loading ? "auto" : "none",
          transition: "opacity 520ms ease, visibility 520ms ease",
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: { xs: "14%", md: "18%" },
            left: { xs: "-8%", md: "8%" },
            width: { xs: 160, md: 240 },
            height: { xs: 160, md: 240 },
            borderRadius: "50%",
            filter: "blur(50px)",
            backgroundColor: "rgba(224, 184, 140, 0.45)",
            animation: "floatBlob 3.4s ease-in-out infinite",
            "@keyframes floatBlob": {
              "0%, 100%": { transform: "translate(0, 0)" },
              "50%": { transform: "translate(22px, -16px)" }
            }
          }}
        />

        <Box
          sx={{
            position: "absolute",
            right: { xs: "-10%", md: "6%" },
            bottom: { xs: "8%", md: "14%" },
            width: { xs: 140, md: 220 },
            height: { xs: 140, md: 220 },
            borderRadius: "50%",
            filter: "blur(55px)",
            backgroundColor: "rgba(74, 74, 74, 0.18)",
            animation: "floatBlobReverse 3.8s ease-in-out infinite",
            "@keyframes floatBlobReverse": {
              "0%, 100%": { transform: "translate(0, 0)" },
              "50%": { transform: "translate(-20px, 12px)" }
            }
          }}
        />

        <Box
          sx={{
            position: "relative",
            width: { xs: 160, sm: 210 },
            height: { xs: 64, sm: 84 },
            animation: "logoEnter 860ms cubic-bezier(.19,1,.22,1) both, logoPulse 1.8s ease-in-out 920ms infinite",
            "@keyframes logoEnter": {
              "0%": { opacity: 0, transform: "translateY(22px) scale(0.86)" },
              "65%": { opacity: 1, transform: "translateY(-2px) scale(1.03)" },
              "100%": { opacity: 1, transform: "translateY(0) scale(1)" }
            },
            "@keyframes logoPulse": {
              "0%, 100%": { transform: "translateY(0) scale(1)" },
              "50%": { transform: "translateY(-2px) scale(1.03)" }
            }
          }}
        >
          <Image
            fill
            priority
            src="/assets/images/logo.svg"
            alt="Bazaar logo"
            sizes="(max-width: 600px) 160px, 210px"
            style={{ objectFit: "contain" }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          opacity: loading ? 0 : 1,
          transform: loading ? "translateY(10px)" : "translateY(0)",
          filter: loading ? "blur(3px)" : "blur(0)",
          transition: "opacity 520ms ease, transform 520ms ease, filter 520ms ease"
        }}
      >
        {children}
      </Box>
    </>
  );
}
