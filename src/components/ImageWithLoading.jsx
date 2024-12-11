"use client";
import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function ImageWithLoading({ src, alt, maxW, ...props }) {
  const [loading, setLoading] = useState(true);

  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <>
      {loading && (
        <div
          className={` ${
            loading
              ? "def-img-with-loading def-loading-box"
              : "w-full flex overflow-auto bg-black"
          }`}
        >
          {loading && (
            <div className="def-img-with-loading-txt">
              <div className="def-loading-svg">
                <AiOutlineLoading3Quarters />
              </div>
              Loading Image...
            </div>
          )}
        </div>
      )}
      <div className="max-w-full w-full overflow-hidden rounded-md">
        <div className="max-w-full w-full overflow-auto">
          <img
            src={src}
            alt={alt}
            style={{maxWidth: `${maxW}`}}
            {...props}
            onLoad={() => {
              setLoading(false);
            }}
            onError={() => setLoading(false)} // Optionally handle image load errors
          />
        </div>
      </div>
    </>
  );
}
