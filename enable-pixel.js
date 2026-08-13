const mongoose = require('mongoose');

// Assuming you're running this from the project root
require('dotenv').config({ path: './.env' });

async function enablePixel() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  await db.collection('settings').updateOne(
    { key: 'global' },
    {
      $set: {
        'facebookPixel.pixelId': '123456789098765',
        'facebookPixel.enabled': true,
        'facebookPixel.testEventCode': 'TEST12345'
      }
    },
    { upsert: true }
  );

  console.log('Pixel enabled in DB');
  process.exit(0);
}

enablePixel();
