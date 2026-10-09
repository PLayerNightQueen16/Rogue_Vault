import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Customer from './models/customer.model.js';
import Product from './models/product.model.js';
import Order from './models/order.model.js';

dotenv.config();

const BASE_URL = 'http://localhost:8000';

async function runTests() {
  console.log('--- Starting ShopKart Labs 05 & 06 Automated Verification Suite ---');

  // Ensure DB is connected for checking directly
  await mongoose.connect(process.env.dbUrl);
  console.log('✓ Connected to MongoDB for verification assertions.');

  // Find or create a test product
  let product = await Product.findOne({ stock: { $gte: 5 } });
  if (!product) {
    product = await Product.create({
      name: 'Test Mechanical Keyboard',
      description: 'Test Description',
      price: 2999,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600',
      stock: 10
    });
  }
  const productId = product._id.toString();
  console.log(`✓ Using test product: "${product.name}" (ID: ${productId}, Price: ${product.price}, Stock: ${product.stock})`);

  // Create two distinct test users
  const timestamp = Date.now();
  const user1Data = {
    fullName: 'Test Buyer One',
    email: `buyer1_${timestamp}@shopkart.test`,
    password: 'password123',
    phone: '9876543210'
  };

  const user2Data = {
    fullName: 'Test Buyer Two',
    email: `buyer2_${timestamp}@shopkart.test`,
    password: 'password123',
    phone: '9123456780'
  };

  // 1. Register User 1
  const regRes1 = await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user1Data)
  });
  const reg1Cookies = regRes1.headers.get('set-cookie');
  const tokenCookie1 = reg1Cookies ? reg1Cookies.split(';')[0] : '';
  console.log('✓ Registered User 1 with token cookie.');

  // Register User 2
  const regRes2 = await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user2Data)
  });
  const reg2Cookies = regRes2.headers.get('set-cookie');
  const tokenCookie2 = reg2Cookies ? reg2Cookies.split(';')[0] : '';
  console.log('✓ Registered User 2 with token cookie.');

  // TEST 1: Unauthenticated request returns 401
  const unauthRes = await fetch(`${BASE_URL}/cart`);
  if (unauthRes.status === 401) {
    console.log('✓ Test 1 Passed: Unauthenticated request to /cart returns 401.');
  } else {
    throw new Error(`Test 1 Failed: Expected 401 but got ${unauthRes.status}`);
  }

  // TEST 2: Add product to cart (quantity 1)
  const addRes1 = await fetch(`${BASE_URL}/cart/${productId}`, {
    method: 'POST',
    headers: { Cookie: tokenCookie1 }
  });
  const addData1 = await addRes1.json();
  if (addRes1.status === 200 && addData1.success && addData1.cart.length === 1 && addData1.cart[0].quantity === 1) {
    console.log('✓ Test 2 Passed: Adding a product creates cart item with quantity 1.');
  } else {
    throw new Error(`Test 2 Failed: ${JSON.stringify(addData1)}`);
  }

  // TEST 3: Adding same product increments quantity to 2
  const addRes2 = await fetch(`${BASE_URL}/cart/${productId}`, {
    method: 'POST',
    headers: { Cookie: tokenCookie1 }
  });
  const addData2 = await addRes2.json();
  if (addRes2.status === 200 && addData2.cart[0].quantity === 2) {
    console.log('✓ Test 3 Passed: Adding same product increments quantity to 2.');
  } else {
    throw new Error(`Test 3 Failed: ${JSON.stringify(addData2)}`);
  }

  // TEST 4: GET /cart returns populated product data
  const getCartRes = await fetch(`${BASE_URL}/cart`, {
    headers: { Cookie: tokenCookie1 }
  });
  const getCartData = await getCartRes.json();
  if (getCartRes.status === 200 && getCartData.cart[0].product.name === product.name && getCartData.cart[0].product.price === product.price) {
    console.log('✓ Test 4 Passed: GET /cart returns populated product details.');
  } else {
    throw new Error(`Test 4 Failed: ${JSON.stringify(getCartData)}`);
  }

  // TEST 5: PATCH /cart/:productId updates quantity
  const patchRes = await fetch(`${BASE_URL}/cart/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: tokenCookie1 },
    body: JSON.stringify({ quantity: 3 })
  });
  const patchData = await patchRes.json();
  if (patchRes.status === 200 && patchData.cart[0].quantity === 3) {
    console.log('✓ Test 5 Passed: PATCH /cart/:productId successfully updated quantity to 3.');
  } else {
    throw new Error(`Test 5 Failed: ${JSON.stringify(patchData)}`);
  }

  // TEST 6: Invalid quantity (< 1 or non-integer) is rejected
  const patchInvalidRes = await fetch(`${BASE_URL}/cart/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: tokenCookie1 },
    body: JSON.stringify({ quantity: 0 })
  });
  if (patchInvalidRes.status === 400) {
    console.log('✓ Test 6 Passed: Quantity < 1 rejected with 400.');
  } else {
    throw new Error(`Test 6 Failed: Expected 400, got ${patchInvalidRes.status}`);
  }

  // TEST 7: Quantity exceeding stock is rejected
  const patchExceedRes = await fetch(`${BASE_URL}/cart/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: tokenCookie1 },
    body: JSON.stringify({ quantity: product.stock + 50 })
  });
  if (patchExceedRes.status === 400) {
    console.log('✓ Test 7 Passed: Quantity exceeding product stock rejected with 400.');
  } else {
    throw new Error(`Test 7 Failed: Expected 400, got ${patchExceedRes.status}`);
  }

  // TEST 8: User isolation (User 2 cart is empty, User 1 cart has item)
  const user2CartRes = await fetch(`${BASE_URL}/cart`, {
    headers: { Cookie: tokenCookie2 }
  });
  const user2CartData = await user2CartRes.json();
  if (user2CartRes.status === 200 && user2CartData.cart.length === 0) {
    console.log('✓ Test 8 Passed: User isolation verified; User 2 cannot see User 1 cart.');
  } else {
    throw new Error(`Test 8 Failed: ${JSON.stringify(user2CartData)}`);
  }

  // TEST 9: DELETE /cart/:productId
  const delRes = await fetch(`${BASE_URL}/cart/${productId}`, {
    method: 'DELETE',
    headers: { Cookie: tokenCookie1 }
  });
  const delData = await delRes.json();
  if (delRes.status === 200 && delData.cart.length === 0) {
    console.log('✓ Test 9 Passed: DELETE /cart/:productId removed item from cart.');
  } else {
    throw new Error(`Test 9 Failed: ${JSON.stringify(delData)}`);
  }

  // TEST 10: Empty cart checkout rejected
  const emptyCheckoutRes = await fetch(`${BASE_URL}/orders/create-payment-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: tokenCookie1 },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        addressLine1: '22 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    })
  });
  if (emptyCheckoutRes.status === 400) {
    console.log('✓ Test 10 Passed: Checkout on empty cart rejected with 400.');
  } else {
    throw new Error(`Test 10 Failed: Expected 400, got ${emptyCheckoutRes.status}`);
  }

  // Add item back to cart for checkout tests (quantity 2)
  await fetch(`${BASE_URL}/cart/${productId}`, {
    method: 'POST',
    headers: { Cookie: tokenCookie1 }
  });
  await fetch(`${BASE_URL}/cart/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: tokenCookie1 },
    body: JSON.stringify({ quantity: 2 })
  });

  // TEST 11: Invalid shipping address rejected
  const invalidAddressRes = await fetch(`${BASE_URL}/orders/create-payment-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: tokenCookie1 },
    body: JSON.stringify({
      shippingAddress: {
        fullName: '',
        phone: '123', // invalid
        addressLine1: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '5600' // invalid pincode
      }
    })
  });
  if (invalidAddressRes.status === 400) {
    console.log('✓ Test 11 Passed: Invalid shipping address rejected with 400.');
  } else {
    throw new Error(`Test 11 Failed: Expected 400, got ${invalidAddressRes.status}`);
  }

  // TEST 12: Create Payment Order via Razorpay Test Integration
  const validCheckoutRes = await fetch(`${BASE_URL}/orders/create-payment-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: tokenCookie1 },
    body: JSON.stringify({
      shippingAddress: {
        fullName: 'Aarav Sharma',
        phone: '9876543210',
        addressLine1: '22 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    })
  });
  const checkoutData = await validCheckoutRes.json();
  if (
    validCheckoutRes.status === 200 &&
    checkoutData.success &&
    checkoutData.shopKartOrderId &&
    checkoutData.razorpayOrderId &&
    checkoutData.amount === product.price * 2 * 100 &&
    checkoutData.key
  ) {
    console.log('✓ Test 12 Passed: Created ShopKart order & Razorpay order with server-calculated total (in paise).');
    console.log(`  Razorpay Order ID: ${checkoutData.razorpayOrderId}, Public Key: ${checkoutData.key}`);
  } else {
    throw new Error(`Test 12 Failed: ${JSON.stringify(checkoutData)}`);
  }

  // TEST 13: Razorpay Key Secret is NEVER returned in response
  if (!checkoutData.secret && !checkoutData.key_secret && !checkoutData.razorpay_secret) {
    console.log('✓ Test 13 Passed: Razorpay Key Secret is securely hidden from client response.');
  } else {
    throw new Error('Test 13 Failed: Razorpay Secret was exposed in response!');
  }

  // TEST 14: Invalid payment signature rejected and cart preserved
  const invalidSigRes = await fetch(`${BASE_URL}/orders/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: tokenCookie1 },
    body: JSON.stringify({
      shopKartOrderId: checkoutData.shopKartOrderId,
      razorpay_order_id: checkoutData.razorpayOrderId,
      razorpay_payment_id: 'pay_fake123456789',
      razorpay_signature: 'invalid_fake_hmac_signature'
    })
  });
  if (invalidSigRes.status === 400) {
    console.log('✓ Test 14 Passed: Invalid payment signature rejected with 400.');
  } else {
    throw new Error(`Test 14 Failed: Expected 400, got ${invalidSigRes.status}`);
  }

  // Verify cart is still preserved after failed verification
  const checkCartRes = await fetch(`${BASE_URL}/cart`, {
    headers: { Cookie: tokenCookie1 }
  });
  const checkCartData = await checkCartRes.json();
  if (checkCartData.cart.length > 0) {
    console.log('✓ Test 15 Passed: Cart was preserved after payment signature failure.');
  } else {
    throw new Error('Test 15 Failed: Cart was improperly cleared on payment failure!');
  }

  // TEST 16: Valid payment verification with HMAC SHA-256 signature
  const fakePaymentId = 'pay_test_' + Date.now();
  const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.razorpay_secret;
  const validSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${checkoutData.razorpayOrderId}|${fakePaymentId}`)
    .digest('hex');

  const verifyRes = await fetch(`${BASE_URL}/orders/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: tokenCookie1 },
    body: JSON.stringify({
      shopKartOrderId: checkoutData.shopKartOrderId,
      razorpay_order_id: checkoutData.razorpayOrderId,
      razorpay_payment_id: fakePaymentId,
      razorpay_signature: validSignature
    })
  });
  const verifyData = await verifyRes.json();
  if (
    verifyRes.status === 200 &&
    verifyData.success &&
    verifyData.order.paymentStatus === 'PAID' &&
    verifyData.order.status === 'PLACED'
  ) {
    console.log('✓ Test 16 Passed: Payment successfully verified. Order status = PLACED, paymentStatus = PAID.');
  } else {
    throw new Error(`Test 16 Failed: ${JSON.stringify(verifyData)}`);
  }

  // TEST 17: Cart is cleared on server after verified payment
  const postPaymentCartRes = await fetch(`${BASE_URL}/cart`, {
    headers: { Cookie: tokenCookie1 }
  });
  const postPaymentCartData = await postPaymentCartRes.json();
  if (postPaymentCartData.cart.length === 0) {
    console.log('✓ Test 17 Passed: User cart is cleared after successful payment verification.');
  } else {
    throw new Error(`Test 17 Failed: Cart not cleared: ${JSON.stringify(postPaymentCartData)}`);
  }

  // TEST 18: GET /orders returns authenticated user orders
  const ordersRes = await fetch(`${BASE_URL}/orders`, {
    headers: { Cookie: tokenCookie1 }
  });
  const ordersData = await ordersRes.json();
  if (ordersRes.status === 200 && ordersData.orders.length >= 1 && ordersData.orders[0]._id === checkoutData.shopKartOrderId) {
    console.log('✓ Test 18 Passed: GET /orders returns user order history with price snapshot.');
  } else {
    throw new Error(`Test 18 Failed: ${JSON.stringify(ordersData)}`);
  }

  // TEST 19: GET /orders/:id returns single order and enforces ownership
  const singleOrderRes = await fetch(`${BASE_URL}/orders/${checkoutData.shopKartOrderId}`, {
    headers: { Cookie: tokenCookie1 }
  });
  const singleOrderData = await singleOrderRes.json();
  if (singleOrderRes.status === 200 && singleOrderData.order._id === checkoutData.shopKartOrderId) {
    console.log('✓ Test 19 Passed: GET /orders/:id returns single order.');
  } else {
    throw new Error(`Test 19 Failed: ${JSON.stringify(singleOrderData)}`);
  }

  // TEST 20: User 2 cannot access User 1 order (returns 403)
  const user2OrderAccessRes = await fetch(`${BASE_URL}/orders/${checkoutData.shopKartOrderId}`, {
    headers: { Cookie: tokenCookie2 }
  });
  if (user2OrderAccessRes.status === 403) {
    console.log('✓ Test 20 Passed: Order access control verified. User 2 received 403 on User 1 order.');
  } else {
    throw new Error(`Test 20 Failed: Expected 403, got ${user2OrderAccessRes.status}`);
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL 20 LAB 05 & LAB 06 AUTOMATED TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('===============================================================');

  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
