const validateEnv = () => {
const required = ["MONGO_URI", "JWT_SECRET", "GROQ_API_KEY"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Missing required env variables: ${missing.join(", ")}`);
    console.error(`   Copy .env.example to .env and fill in the values.`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.error("❌ JWT_SECRET must be at least 16 characters");
    process.exit(1);
  }
  console.log("✅ Environment variables validated");
};

module.exports = validateEnv;
