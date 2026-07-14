const mongoose = require("mongoose");
require("dotenv").config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();