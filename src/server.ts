import { config } from "dotenv";
import App from "./app";

config(); // Read and set variables from .env file.

const app = new App();

app.listen();
