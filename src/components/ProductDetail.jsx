// src/pages/ProductDetail.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) console.error("Error fetching product:", error);
      else setProduct(data);
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p className="has-text-centered mt-6">Loading...</p>;

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-variable is-8 is-vcentered">
          {/* Left: Product Images */}
          <div className="column is-half">
            <figure className="image is-square">
              <img src={product.image_url} alt={product.name} />
            </figure>
            {/* Optionally add more images here as thumbnails */}
          </div>

          {/* Right: Info */}
          <div className="column is-half">
            <h2 className="title is-4 has-text-weight-bold">{product.name}</h2>
            <p className="is-size-5 has-text-grey-dark mb-2">${Number(product.price).toLocaleString()}</p>
            <p className="mb-4">{product.description}</p>

            {/* Variant options (fake dropdowns for now) */}
            <div className="field">
              <label className="label">Select Option</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select>
                    <option>3.5g</option>
                    <option>7g</option>
                    <option>14g</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Add to Cart or Buy with Crypto */}
            <button className="button is-dark is-fullwidth mt-4">Buy with Crypto</button>

            {/* Expandable Sections */}
            <div className="mt-5">
              <p className="is-size-7 has-text-grey">Details +</p>
              <p className="is-size-7 has-text-grey mt-1">Shipping Policy +</p>
              <p className="is-size-7 has-text-grey mt-1">Share +</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}