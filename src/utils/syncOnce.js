import dispensaries from "../dispensaries.json"; // adjust if this file is in /src/utils or similar

export const syncDispensariesOnce = async () => {
  try {
    const upload = await fetch(
      "https://gas-packs.com/.netlify/functions/add-dispensaries",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dispensaries),
      }
    );

    const result = await upload.json();
    console.log("✅ Sync Complete:", result);
    return result;
  } catch (err) {
    console.error("❌ Sync Error:", err.message);
    return { error: err.message };
  }
};
