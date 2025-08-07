// src/components/CheckoutSummary.jsx
import React from "react";
import { useCart } from "../context/CartContext";

const CheckoutSummary = () => {
  const { cart, subtotal } = useCart();

  return (
    <div className="box">
      <h3 className="title is-5">Your Order</h3>
      {cart.map((item, i) => (
        <div key={i} className="media mb-2">
          <figure className="media-left">
            <p className="image is-64x64">
              <img src={item.image} alt={item.title} />
            </p>
          </figure>
          <div className="media-content">
            <p>{item.title}</p>
            <small>{item.variant}</small>
          </div>
          <div className="media-right">
            <p>${(item.price * item.qty).toFixed(2)}</p>
          </div>
        </div>
      ))}
      <hr />
      <div className="level">
        <div className="level-left">Subtotal</div>
        <div className="level-right">${subtotal.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default CheckoutSummary;