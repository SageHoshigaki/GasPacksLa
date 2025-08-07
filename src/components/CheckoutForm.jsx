// src/components/CheckoutForm.jsx
import React, { useState } from "react";

const CheckoutForm = () => {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 className="title is-4">Contact Information</h2>
      <div className="field">
        <label className="label">Email</label>
        <div className="control">
          <input className="input" type="email" name="email" value={form.email} onChange={handleChange} />
        </div>
      </div>

      <h2 className="title is-4">Shipping Address</h2>
      <div className="field is-horizontal">
        <div className="field-body">
          <div className="field">
            <p className="control is-expanded">
              <input className="input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
            </p>
          </div>
          <div className="field">
            <p className="control is-expanded">
              <input className="input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
            </p>
          </div>
        </div>
      </div>

      {/* More fields for address, city, state, zip, country... */}
    </div>
  );
};

export default CheckoutForm;