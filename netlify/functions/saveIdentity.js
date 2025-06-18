const { parse } = require("multiparty");
const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const util = require("util");

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

  const parseForm = util.promisify((req, cb) => {
    const form = new parse.Form();
    form.parse(req, cb);
  });

  try {
    const { req } = event;
    const parsed = await new Promise((resolve, reject) => {
      const form = new parse.Form();
      form.parse(Buffer.from(event.body, "base64"), (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // Verify JWT from Authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader) throw new Error("Missing Clerk token");
    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.decode(token);
    const userId = decoded.sub;

    const data = {
      user_id: userId,
      first_name: parsed.fields.firstName?.[0],
      last_name: parsed.fields.lastName?.[0],
      dob: `${parsed.fields.dobYear?.[0]}-${parsed.fields.dobMonth?.[0]}-${parsed.fields.dobDay?.[0]}`,
      address: `${parsed.fields.streetNumber?.[0]} ${parsed.fields.streetName?.[0]}, ${parsed.fields.city?.[0]}, ${parsed.fields.state?.[0]} ${parsed.fields.zip?.[0]}`,
      ssn: parsed.fields.ssn?.[0],
      phone: parsed.fields.phone?.[0],
      email: parsed.fields.email?.[0],
    };

    // Upload license file to Supabase Storage
    const licenseFile = parsed.files.licenseFile?.[0];
    let licenseUrl = null;
    if (licenseFile) {
      const fileBuffer = fs.readFileSync(licenseFile.path);
      const upload = await supabase.storage
        .from("licenses")
        .upload(`license_${userId}_${Date.now()}.jpg`, fileBuffer, {
          contentType: licenseFile.headers["content-type"],
          upsert: true,
        });

      if (upload.error) throw upload.error;
      licenseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/licenses/${upload.data.path}`;
      data.license_url = licenseUrl;
    }

    const insert = await supabase.from("user_identity").insert([data]);

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
