export const syncDispensariesOnce = async () => {
  try {
    const res = await fetch("/data/dispensaries.json");
    const dispensaries = await res.json();

    const upload = await fetch("/.netlify/functions/add-dispensaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dispensaries),
    });

    const result = await upload.json();
    console.log("✅ Sync Complete:", result);
    return result;
  } catch (err) {
    console.error("❌ Sync Error:", err.message);
    return { error: err.message };
  }
};
