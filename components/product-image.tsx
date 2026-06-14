"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/images/product-rice.png";

type ProductImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
};

export function ProductImage({ src, alt, ...props }: ProductImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const requestedSource = src || FALLBACK_IMAGE;
  const currentSource = failedSource === requestedSource ? FALLBACK_IMAGE : requestedSource;

  return (
    <Image
      {...props}
      src={currentSource}
      alt={alt}
      onError={() => {
        if (currentSource !== FALLBACK_IMAGE) setFailedSource(requestedSource);
      }}
    />
  );
}
