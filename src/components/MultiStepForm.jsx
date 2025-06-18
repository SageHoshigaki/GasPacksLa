import React, { useState } from "react";
import "../css/Multiform.css";
import "animate.css/animate.min.css";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/clerk-react";

const MultiStepForm = () => {
  const { getToken } = useAuth();
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
    if (step === 1) {
      const {
        firstName,
        lastName,
        dobDay,
        dobMonth,
        dobYear,
        streetNumber,
        streetName,
        city,
        state,
        zip,
      } = formData;
      if (!firstName || !lastName || !dobDay || !dobMonth || !dobYear || !streetNumber || !streetName || !city || !state || !zip) {
        alert("Please fill out all required fields before proceeding.");
        return;
      }
    } else if (step === 2) {
      const { licenseFile, ssn } = formData;
      if (!licenseFile || !ssn) {
        alert("Please upload your license and enter your SSN.");
        return;
      }
    } else if (step === 3) {
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
      const token = await getToken();
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      const response = await fetch("/.netlify/functions/saveIdentity", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed");

      alert("Form submitted successfully!");
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  const steps = ["Your Information", "Upload License", "Contact Info", "Summary"];

  const renderPreload = () => (
    <div
      className="has-background-black has-text-white"
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 className="title is-3 has-text-white animate__animated animate__fadeInDown animate__faster">
        Welcome
      </h1>
      <motion.p
        className="subtitle is-5 has-text-white"
        style={{ maxWidth: "600px", marginBottom: "2rem", display: "flex", flexWrap: "wrap" }}
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {preloadText.map((word, index) => (
          <motion.span
            key={index}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              },
            }}
            style={{ marginRight: "6px", display: "inline-block" }}
          >
            {word}
          </motion.span>
        ))}
      </motion.p>
      <motion.button
        className="button is-light is-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: preloadText.length * 0.1 + 0.5, duration: 1 }}
        onClick={() => setShowPreload(false)}
      >
        Continue →
      </motion.button>
    </div>
  );

  const renderFields = () => {
    switch (step) {
      // (field rendering cases unchanged)
      case 1:
      case 2:
      case 3:
      case 4:
        // use your previously provided renderFields logic here...
        break;
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
            {step > 1 && (
              <button className="button is-light" onClick={prevStep}>← Back</button>
            )}
            {step < 4 && (
              <button className="button is-link" onClick={nextStep}>Next Step →</button>
            )}
            {step === 4 && (
              <button className="button is-success" onClick={handleSubmit}>Submit</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;