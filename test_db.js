const mongoose = require('mongoose');

async function testConnection() {
  const uri = "mongodb+srv://ecommerce:65CunhnNeJ0JrGNc@cluster0.4sxglgm.mongodb.net/flexwear";
  
  try {
    console.log("Connecting to MongoDB via Mongoose (ecommerce spelling)...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Successfully connected to MongoDB!");
    await mongoose.connection.close();
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

testConnection();
