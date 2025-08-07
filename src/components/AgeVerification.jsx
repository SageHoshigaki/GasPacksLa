// src/components/utility/AgeVerification.jsx
import React from "react";

const AgeVerification = ({ onConfirm }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center font-cherry">
      <img
        src="/images/product/gaspackslogo.png"
        alt="GasPacks Logo"
        className="w-[220px] mb-4"
      />
      <p className="text-2xl mb-6">ARE YOU OVER 21 YEARS OF AGE?</p>
      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white py-2 px-6 text-lg rounded"
          onClick={() => onConfirm(false)}
        >
          NO
        </button>
        <button
          className="bg-blue-600 text-white py-2 px-6 text-lg rounded"
          onClick={() => onConfirm(true)}
        >
          YES
        </button>
      </div>
    </div>
  );
};

export default AgeVerification;