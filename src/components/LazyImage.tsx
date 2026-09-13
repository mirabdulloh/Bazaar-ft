"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

const StyledImage = styled(Image)({ width: "100%", height: "auto", display: "block" });

type LazyImageProps = ImageProps & {
  sx?: SxProps<Theme>;
};

export default function LazyImage({ style, sx, ...props }: LazyImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  // Only local object URLs must bypass the optimizer. API-hosted uploads are
  // allowed via remotePatterns and benefit most from resizing (they average
  // ~2MB straight from the camera).
  const unoptimized = src.startsWith("blob:");

  const w = typeof props.width === "number" ? props.width : null;
  const h = typeof props.height === "number" ? props.height : null;

  const computedStyle: React.CSSProperties = {
    objectFit: "contain",
    ...(w && h ? { aspectRatio: `${w} / ${h}` } : {}),
    ...style,
  };

  return (
    <StyledImage
      {...props}
      sx={sx}
      unoptimized={unoptimized || props.unoptimized}
      style={computedStyle}
    />
  );
}
