const multiparty = require("multiparty");
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
    const parsed = await new Promise((resolve, reject) => {
      const form = new multiparty.Form();
      form.parse(Buffer.from(event.body, "base64"), (err, fields) => {
        if (err) return reject(err);
        resolve(fields);
      });
    });

    const authHeader = event.headers.authorization;
    if (!authHeader) throw new Error("Missing Clerk token");

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const userId = decoded.sub;

    const data = {
      user_id: userId,
      first_name: parsed.firstName?.[0],
      last_name: parsed.lastName?.[0],
      dob: `${parsed.dobYear?.[0]}-${parsed.dobMonth?.[0]}-${parsed.dobDay?.[0]}`,
      address: `${parsed.streetNumber?.[0]} ${parsed.streetName?.[0]}, ${parsed.city?.[0]}, ${parsed.state?.[0]} ${parsed.zip?.[0]}`,
      phone: parsed.phone?.[0],
      email: parsed.email?.[0],
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
