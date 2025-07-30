const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const dispensaries = JSON.parse(event.body);

    if (!Array.isArray(dispensaries)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON array format" }),
      };
    }

    const { data, error } = await supabase
      .from("Dispensaries")
      .insert(dispensaries);

    if (error) {
      console.error("❌ Supabase Insert Error:", error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    console.log("✅ Inserted:", data);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, inserted: data.length }),
    };
  } catch (err) {
    console.error("❌ Function Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Invalid JSON or internal error" }),
    };
  }
};
