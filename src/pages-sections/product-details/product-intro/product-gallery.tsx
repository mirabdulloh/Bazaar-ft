"use client";

import Image from "next/image";
import { Fragment, MouseEvent, useMemo, useState } from "react";
// STYLED COMPONENTS
import { PreviewImage, ProductImageWrapper } from "./styles";

export default function ProductGallery({ images }: { images: string[] }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const activeImage = useMemo(
    () => images[currentImage] ?? "/assets/images/products/product-1.png",
    [images, currentImage]
  );

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <Fragment>
      <ProductImageWrapper
        zoomed={zoomed}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => {
          setZoomed(false);
          setOrigin("50% 50%");
        }}
        onMouseMove={handleMouseMove}
        onClick={() => setZoomed((prev) => !prev)}
      >
        <div className="zoom-media" style={{ transformOrigin: origin }}>
          <Image fill alt="product" src={activeImage} sizes="(400px 400px)" />
        </div>
      </ProductImageWrapper>

      <div className="preview-images">
        {images.map((url, ind) => (
          <PreviewImage
            key={ind}
            onClick={() => setCurrentImage(ind)}
            selected={currentImage === ind}
          >
            <Image fill alt="product" src={url} sizes="(48px 48px)" />
          </PreviewImage>
        ))}
      </div>
    </Fragment>
  );
}
