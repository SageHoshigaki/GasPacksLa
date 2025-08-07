// src/components/utility/LoadingScreen.jsx
import React from "react";

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-center">
      <img
        src="/images/product/gaspacksani.png"
        alt="GasPacks Loading"
        className="w-[650px] animate-jump"
      />
    </div>
  );
};

export default LoadingScreen;