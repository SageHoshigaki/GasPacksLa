const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const authHeader = event.headers.authorization;
    if (!authHeader) throw new Error("Missing Clerk token");

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const userId = decoded.sub;

    const {
      dobYear,
      dobMonth,
      dobDay,
      streetNumber,
      streetName,
      city,
      state,
      zip,
      ssn,
      phone,
    } = JSON.parse(event.body);

    const data = {
      user_id: userId,
      dob: `${dobYear}-${dobMonth}-${dobDay}`,
      address: `${streetNumber} ${streetName}, ${city}, ${state} ${zip}`,
      ssn,
      phone,
    };

    const insert = await supabase.from("user_identity_data").insert([data]);
    if (insert.error) throw insert.error;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data saved successfully" }),
    };
  } catch (error) {
    console.error("Error saving identity:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
