const mongoose = require('mongoose');

async function testConnection() {
  const uri = "mongodb://ecommarce:65CunhnNeJ0JrGNc@ac-twqvsun-shard-00-00.4sxglgm.mongodb.net:27017,ac-twqvsun-shard-00-01.4sxglgm.mongodb.net:27017,ac-twqvsun-shard-00-02.4sxglgm.mongodb.net:27017/flexwear?ssl=true&replicaSet=atlas-twqvsun-shard-0&authSource=admin";
  
  try {
    console.log("Connecting to MongoDB via Standard String...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Successfully connected to MongoDB!");
    await mongoose.connection.close();
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

testConnection();
