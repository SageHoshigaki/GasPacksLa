// components/ShopPage.jsx
import React from "react";

const products = [
  {
    name: "SPACED SHEER CREWNECK",
    price: "$395.00",
    image: "/images/spaced_sheer_crewneck.jpg",
    tag: "NEW"
  },
  {
    name: "CAR JEANS",
    price: "$385.00",
    image: "/images/car_jeans.jpg",
    tag: "NEW"
  },
  {
    name: "SHEER STRIPE TEE",
    price: "$325.00",
    image: "/images/sheer_stripe_tee.jpg",
    tag: "NEW"
  },
  {
    name: "LASER STUDIO HOODIE",
    price: "$295.00",
    image: "/images/laser_studio_hoodie.jpg",
    tag: "NEW"
  }
];

const ShopPage = () => {
  return (
    <div className="px-6 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">HELMUT LANG</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div key={index} className="text-center">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto object-cover mb-2"
              />
              <span className="absolute top-2 left-2 bg-white text-black text-xs px-2 py-1 font-semibold">
                {product.tag}
              </span>
            </div>
            <div className="text-sm font-medium mt-2">{product.name}</div>
            <div className="text-sm font-bold">{product.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
