import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';
import stripeModule from 'stripe'; 
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static('static'));
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;
const environment = process.env.ENVIRONMENT || 'sandbox';
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const endpoint_url =
  environment === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

const stripeClient = stripeModule(process.env.STRIPE_SECRET_KEY);

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/templates/index.html');
});

// Create the order - PayPal
app.post('/create_order', (req, res) => {
  get_access_token()
    .then((access_token) => {
      let order_data_json = {
        intent: req.body.intent.toUpperCase(),
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: '10.00',
            },
          },
        ],
      };
      const data = JSON.stringify(order_data_json);

      fetch(endpoint_url + '/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: data,
      })
        .then((res) => res.json())
        .then((json) => {
          res.send(json);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

// Complete the order - PayPal
app.post('/complete_order', (req, res) => {
  get_access_token()
    .then((access_token) => {
      fetch(
        endpoint_url +
          '/v2/checkout/orders/' +
          req.body.order_id +
          '/' +
          req.body.intent,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          console.log(json);
          res.send(json);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

// Get the access token - PayPal
function get_access_token() {
  const auth = `${client_id}:${client_secret}`;
  const data = 'grant_type=client_credentials';
  return fetch(endpoint_url + '/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(auth).toString('base64')}`,
    },
    body: data,
  })
    .then((res) => res.json())
    .then((json) => {
      return json.access_token;
    });
}

// Stripe checkout
app.post('/checkout', async (req, res) => {
  // const { price, productName } = req.body; // Assuming the price is sent in the request body
  const price  = 10;
  const productName = 'Product Name';

  const session = await stripeClient.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName 
          },
          unit_amount: price * 100 // Convert price to cents
        },
        quantity: 1 // Assuming only one quantity is purchased
      }
    ],
    mode: 'payment',
    shipping_address_collection: {
      allowed_countries: ['US', 'BR', 'PT', 'ES', 'GB']
    },
    success_url: 'http://localhost:8080/complete', // Hardcoded success URL
    cancel_url: 'http://localhost:8080/cancel' // Hardcoded cancel URL
  });

  console.log(session)
  res.redirect(session.url);
});

// Stripe checkout complete
app.get('/complete', async (req, res) => {
    const result = Promise.all([
        stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] }),
        stripe.checkout.sessions.listLineItems(req.query.session_id)
    ])

    console.log(JSON.stringify(await result))

    res.send('Your payment was successful')
})

// Stripe checkout cancel
app.get('/cancel', (req, res) => {
    res.redirect('/')
})

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
