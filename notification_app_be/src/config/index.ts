import dotenv from "dotenv";
dotenv.config();

const config = {
  port: parseInt(process.env.PORT ?? "5000", 10),
  testServer: {
    baseUrl: process.env.TEST_SERVER_BASE_URL ?? "http://4.224.186.213",
    accessToken: process.env.ACCESS_TOKEN ?? "",
  },
};

if (!config.testServer.accessToken) {
  console.warn(
    "[Config] WARNING: ACCESS_TOKEN is not set. Set it in .env before running."
  );
}

export default config;
