"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import useSettings from "hooks/useSettings";

export function HeaderThemeToggle() {
  const { settings, updateSettings } = useSettings();
  const isDark = settings.mode === "dark";

  const toggleMode = () => updateSettings({ mode: isDark ? "light" : "dark" });

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton onClick={toggleMode} aria-label="Toggle color mode">
        {isDark ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
