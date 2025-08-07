// src/components/CheckoutPage.jsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart, subtotal, totalItems } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [error, setError] = useState("");

  const handleApplyCode = () => {
    if (!discountCode || discountCode !== "GODMODE") {
      setError("Enter a valid discount code or gift card");
    } else {
      setError("");
      // Apply discount logic here
    }
  };

  return (
    <section className="section" style={{ background: "#f9f9f9", minHeight: "100vh" }}>
      <div className="container">
        <div className="columns is-centered is-variable is-8">
          {/* Left Form */}
          <div className="column is-7">
            <h1 className="title is-4 mb-4">Express checkout</h1>
            <div className="buttons mb-5">
              <button className="button is-purple is-light">Shop Pay</button>
              <button className="button is-warning is-light">PayPal</button>
              <button className="button is-warning is-light">Amazon Pay</button>
              <button className="button is-dark is-light">Google Pay</button>
            </div>

            <div className="has-text-centered my-4">
              <p className="is-size-7 has-text-grey">— OR —</p>
            </div>

            <div className="box">
              <h2 className="title is-5 mb-3">Contact</h2>
              <div className="field">
                <label className="label is-small">Email</label>
                <div className="control">
                  <input className="input" type="email" placeholder="you@example.com" />
                </div>
              </div>
              <label className="checkbox">
                <input type="checkbox" className="mr-2" />
                Email me with news and offers
              </label>

              <hr />

              <h2 className="title is-5 mb-3 mt-4">Delivery</h2>
              <div className="field">
                <label className="label is-small">Country/Region</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select>
                      <option>United States</option>
                      <option>Canada</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="field is-horizontal">
                <div className="field-body">
                  <div className="field">
                    <div className="control">
                      <input className="input" type="text" placeholder="First name" />
                    </div>
                  </div>
                  <div className="field">
                    <div className="control">
                      <input className="input" type="text" placeholder="Last name" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="field">
                <input className="input" type="text" placeholder="Company (optional)" />
              </div>

              <div className="field">
                <input className="input" type="text" placeholder="Address" />
              </div>

              <div className="field">
                <input
                  className="input"
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
            </div>
          </div>

          {/* Right Cart Summary */}
          <div className="column is-5">
            <div className="box">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="is-flex is-justify-content-space-between is-align-items-center mb-4"
                >
                  <div>
                    <strong>{item.name}</strong>
                    <p className="is-size-7 has-text-grey">
                      {item.variant || ""} x {item.qty}
                    </p>
                  </div>
                  <div className="has-text-right">
                    <p>${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              ))}

              <div className="field mt-4">
                <label className="label is-small">Discount code or gift card</label>
                <div className="field has-addons">
                  <div className="control is-expanded">
                    <input
                      className={`input ${error ? "is-danger" : ""}`}
                      type="text"
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                    />
                  </div>
                  <div className="control">
                    <button className="button is-link" onClick={handleApplyCode}>
                      Apply
                    </button>
                  </div>
                </div>
                {error && <p className="help is-danger">{error}</p>}
              </div>

              <hr />

              <div className="is-flex is-justify-content-space-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="is-flex is-justify-content-space-between mb-4">
                <span>Shipping</span>
                <span className="has-text-grey">Enter shipping address</span>
              </div>

              <div className="is-flex is-justify-content-space-between">
                <strong>Total</strong>
                <strong className="is-size-5">USD ${subtotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}