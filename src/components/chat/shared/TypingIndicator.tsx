"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface TypingIndicatorProps {
  names: string[];
}

export function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing…`
      : `${names.slice(0, 2).join(", ")} are typing…`;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.4,
          bgcolor: "grey.100",
          borderRadius: "12px 12px 12px 4px",
          px: 1.5,
          py: 0.75,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "grey.500",
              "@keyframes typingBounce": {
                "0%, 80%, 100%": { transform: "translateY(0)" },
                "40%": { transform: "translateY(-4px)" },
              },
              animation: "typingBounce 1.2s infinite ease-in-out",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
