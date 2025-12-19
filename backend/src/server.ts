import app from "./app";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Server port
const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
