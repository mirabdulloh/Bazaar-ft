"use client";

import { Fragment } from "react";
import Box from "@mui/material/Box";
// GLOBAL CUSTOM COMPONENTS
import { Carousel, CarouselArrows, useCarousel } from "components/slider";

const carouselArrowStyles = {
  sx: {
    boxShadow: 0,
    color: "primary.main",
    backgroundColor: "transparent",
    "&:hover": { backgroundColor: "transparent" }
  }
};

interface Props {
  title: string;
  images: string[];
}

export default function ImageCarousel({ images, title }: Props) {
  const { ref, api, arrows } = useCarousel();
  const safeImages = images.filter(Boolean);
  const carouselImages = safeImages.length
    ? safeImages
    : ["/assets/images/products/product-1.png"];

  return (
    <Fragment>
      <Carousel ref={ref} api={api}>
        {carouselImages.map((item: string, index: number) => (
          <Box
            key={index}
            height={300}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={item}
              alt={title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
                display: "block",
              }}
            />
          </Box>
        ))}
      </Carousel>

      <CarouselArrows
        onClickNext={arrows.onClickNext}
        onClickPrev={arrows.onClickPrev}
        disableNext={arrows.disableNext}
        disablePrev={arrows.disablePrev}
        slotProps={{
          prev: carouselArrowStyles,
          next: carouselArrowStyles
        }}
      />
    </Fragment>
  );
}
