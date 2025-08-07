import React from 'react';

const TailwindTest = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-center flex items-center justify-center">
      <h1 className="text-pink-500 text-5xl font-bold">
        ✅ Tailwind is Working!
      </h1>
      <div className="bg-red-500 text-white">If this is red, Tailwind works.</div>
    </div>
  );
};

export default TailwindTest;