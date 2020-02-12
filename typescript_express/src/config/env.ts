import dotenv from "dotenv";

export const loadEnvFile = () => {
  // Load .env file if existing
  const result = dotenv.config();
  // When there is an error stop
  if (result.error) { throw result.error; }
};
