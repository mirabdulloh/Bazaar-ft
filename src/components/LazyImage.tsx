"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";
import { styled } from "@mui/material/styles";

const StyledImage = styled(Image)({ width: "100%", height: "auto", display: "block" });

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function LazyImage({ style, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const unoptimized =
    (API_URL && src.startsWith(API_URL)) || src.startsWith("blob:");

  const w = typeof props.width === "number" ? props.width : null;
  const h = typeof props.height === "number" ? props.height : null;

  const computedStyle: React.CSSProperties = {
    objectFit: "cover",
    ...(w && h ? { aspectRatio: `${w} / ${h}` } : {}),
    ...style,
  };

  return (
    <StyledImage
      {...props}
      unoptimized={unoptimized || props.unoptimized}
      style={computedStyle}
    />
  );
}
