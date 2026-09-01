import { appendOrderToSheet } from './src/lib/googleSheets.js';
import { config } from 'dotenv';
config({ path: '.env' });

async function runTest() {
  try {
    console.log('Testing Google Sheets integration...');
    console.log('Spreadsheet ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? 'Set' : 'Not Set');
    console.log('Service Account:', process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? 'Set' : 'Not Set');
    
    // We'll use tsx to run this directly, so we can import the .ts file
    const { appendOrderToSheet } = await import('./src/lib/googleSheets.ts');
    
    await appendOrderToSheet({
      orderId: 'TEST-123',
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      phone: '01700000000',
      addressLine1: 'Test Address',
      city: 'Test City',
      paymentMethod: 'cod',
      items: [{ title: 'Test Product', quantity: 1, price: 100 }],
      shippingCost: 50,
      totalAmount: 150,
      fulfillmentStatus: 'unfulfilled',
    });
    console.log('Successfully appended test order!');
  } catch (error) {
    console.error('Error appending test order:', error);
  }
}

runTest();
