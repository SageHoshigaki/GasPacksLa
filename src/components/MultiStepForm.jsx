import React, { useState } from "react";
import "../css/Multiform.css";
import "animate.css/animate.min.css";
import { motion } from "framer-motion";

const MultiStepForm = () => {
  const [showPreload, setShowPreload] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
  
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    streetNumber: "",
    streetName: "",
    city: "",
    state: "",
    zip: "",
    phone: "",

  });

  const preloadText = `Welcome. To ensure a secure shopping experience, we require a brief background check. This process typically takes 24–72 hours. During this time, your account remains accessible for any updates you may wish to make.`.split(" ");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    if (step === 1) {
      const {
        dobDay, dobMonth, dobYear,
        streetNumber, streetName, city, state, zip
      } = formData;
      if (!dobDay || !dobMonth || !dobYear || !streetNumber || !streetName || !city || !state || !zip) {
        alert("Please fill out all required fields before proceeding.");
        return;
      }
    } else if (step === 2) {
      const { phone, email } = formData;
      if (!phone || !email) {
        alert("Please provide your phone number and email address.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      const token = await window.Clerk?.session?.getToken?.();
      const response = await fetch("/.netlify/functions/saveIdentity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Form submitted successfully!");
        setStep(1);
      } else {
        alert("Submission failed: " + result.error);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("An error occurred while submitting the form.");
    }
  };

  const steps = ["Your Information", "Contact Info", "Summary"];

  const renderPreload = () => (
    <div className="has-background-black has-text-white" style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem", textAlign: "center" }}>
      <h1 className="title is-3 has-text-white animate__animated animate__fadeInDown animate__faster">Welcome</h1>
      <motion.p className="subtitle is-5 has-text-white" style={{ maxWidth: "600px", marginBottom: "2rem", display: "flex", flexWrap: "wrap" }} initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        {preloadText.map((word, index) => (
          <motion.span key={index} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } } }} style={{ marginRight: "6px", display: "inline-block" }}>{word}</motion.span>
        ))}
      </motion.p>
      <motion.button className="button is-light is-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: preloadText.length * 0.1 + 0.5, duration: 1 }} onClick={() => setShowPreload(false)}>Continue →</motion.button>
    </div>
  );

  const renderFields = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="title is-4 has-text-white">Personal Information</h2>
            <p className="subtitle is-6 has-text-white">Please provide your date of birth, and address details.</p>
            <div className="columns">
            
            </div>
            <label className="label mt-4 has-text-white">Date of Birth</label>
            <div className="columns">
              <div className="column">
                <div className="select is-fullwidth">
                  <select name="dobDay" value={formData.dobDay} onChange={handleChange}>
                    <option value="">Day</option>
                    {[...Array(31).keys()].map((d) => (
                      <option key={d + 1} value={d + 1}>{d + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="column">
                <div className="select is-fullwidth">
                  <select name="dobMonth" value={formData.dobMonth} onChange={handleChange}>
                    <option value="">Month</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="column">
                <div className="select is-fullwidth">
                  <select name="dobYear" value={formData.dobYear} onChange={handleChange}>
                    <option value="">Year</option>
                    {[...Array(100).keys()].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>
            </div>
            <label className="label mt-4 has-text-white">Address</label>
            <div className="columns is-multiline">
              <div className="column is-4">
                <input className="input" name="streetNumber" placeholder="Street Number" value={formData.streetNumber} onChange={handleChange} />
              </div>
              <div className="column is-8">
                <input className="input" name="streetName" placeholder="Street Name" value={formData.streetName} onChange={handleChange} />
              </div>
              <div className="column is-5">
                <input className="input" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
              </div>
              <div className="column is-4">
                <input className="input" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
              </div>
              <div className="column is-3">
                <input className="input" name="zip" placeholder="ZIP Code" value={formData.zip} onChange={handleChange} />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="title is-4 has-text-white">Contact Details</h2>
            <p className="subtitle is-6 has-text-white">Phone and email for contact.</p>
            <div className="field">
              <label className="label has-text-white">Phone</label>
              <input className="input" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="label has-text-white">Email</label>
              <input className="input" name="email" value={formData.email} onChange={handleChange} />
            </div>
          </>
        );
      case 3:
        return (
          <div className="content has-text-white">
            <h2 className="title is-4">Summary</h2>
           
            <p><strong>DOB:</strong> {formData.dobMonth} {formData.dobDay}, {formData.dobYear}</p>
            <p><strong>Address:</strong> {formData.streetNumber} {formData.streetName}, {formData.city}, {formData.state} {formData.zip}</p>
            <p><strong>Phone:</strong> {formData.phone}</p>
            <p><strong>Email:</strong> {formData.email}</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (showPreload) return renderPreload();

  return (
    <div className="columns is-centered is-vcentered has-background-black" style={{ minHeight: "100vh" }}>
      <div className="column is-8 box" style={{ display: "flex", padding: 0 }}>
        <aside className="column is-4 has-background-dark p-5" style={{ color: "#fff", borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" }}>
          {steps.map((label, index) => (
            <div key={index} className={`mb-5 ${index + 1 === step ? "has-text-white" : "has-text-grey-light"}`}>
              <p className="has-text-weight-bold is-size-6">STEP {index + 1}</p>
              <p className="is-size-5">{label}</p>
            </div>
          ))}
        </aside>
        <div className="column is-8 p-6">
          {renderFields()}
          <div className="mt-5 is-flex is-justify-content-space-between">
            {step > 1 && <button className="button is-light" onClick={prevStep}>← Back</button>}
            {step < 3 && <button className="button is-link" onClick={nextStep}>Next Step →</button>}
            {step === 3 && <button className="button is-success" onClick={handleSubmit}>Submit</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;