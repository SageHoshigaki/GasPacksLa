// src/components/ProductPage.jsx
import React from "react";
import "../css/ProductPage.css";

const ProductPage = ({ product }) => {
  return (
    <div className="product-page-wrapper">
      <div className="product-page">
        <div className="product-gallery">
          <img
            src={product.imageUrlFront}
            alt={product.name}
            className="product-img"
          />
          {product.imageUrlBack && (
            <img
              src={product.imageUrlBack}
              alt={product.name + " back"}
              className="product-img"
            />
          )}
        </div>

        <div className="product-details">
          <h2 className="brand-name">FEAR OF GOD</h2>
          <h1 className="product-title">"{product.name}"</h1>
          <div className="price">${product.price}</div>

          <div className="options">
            <select defaultValue="Cream">
              <option>Cream</option>
            </select>
            <select defaultValue="">
              <option disabled>Select Size</option>
              {product.sizes.map((size, idx) => (
                <option key={idx}>{size}</option>
              ))}
            </select>
            <span className="size-chart">SIZE CHART</span>
          </div>

          <button className="add-to-cart" disabled>
            ADD TO CART
          </button>

          <div className="description">
            <p>{product.description}</p>
            <p className="note">Proceeds benefiting The Shabazz Center.</p>
            <p className="final-sale">ALL SALES OF THIS ITEM ARE FINAL.</p>
          </div>

          <div className="expandables">
            <details>
              <summary>DETAILS</summary>
              <p>{product.details}</p>
            </details>
            <details>
              <summary>SHIPPING POLICY</summary>
              <p>{product.shipping}</p>
            </details>
            <details>
              <summary>SHARE</summary>
              <p>{product.share}</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;