import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Shop() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) console.error(error);
      else setProducts(data);
    };
    loadProducts();
  }, []);

  return (
    <section className="section has-background-white">
      <div className="container">
        <div className="columns is-multiline">
          {products.map((product) => (
            <div key={product.id} className="column is-12-mobile is-6-tablet is-4-desktop">
              <Link to={`/product/${product.id}`}>
                <div className="box" style={{ border: "none", padding: 0, cursor: "pointer" }}>
                  <figure className="image is-square">
                    <img src={product.image_url} alt={product.name} />
                  </figure>
                  <div className="mt-3 px-2">
                    <p className="is-size-7 has-text-weight-semibold">{product.brand}</p>
                    <p className="is-size-6 mb-1">{product.name}</p>
                    <p className="is-size-6 has-text-weight-bold">${Number(product.price).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}