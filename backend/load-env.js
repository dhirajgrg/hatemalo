import dotenv from "dotenv";
import { existsSync } from "fs";

// Load base .env first
dotenv.config();

// Override with .env.local for local development (gitignored)
if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local", override: true });
}
