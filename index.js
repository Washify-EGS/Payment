import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import stripeModule from "stripe";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'your_secret_key', // Replace with your own secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

const port = 8002;
const environment = "sandbox";
const client_id = "Abi_EpOMLx3Z1zZj_8es8kSRlqpDYQYZe2dPKQfmSvYyAmCc5YqhIUVSrQyWzRutQzE9T9OmNMCLhlgN";
const client_secret = "EG7yrKQKbrin-Y9eQV0P96aRgLTylwcAMEoMkM-1ePYNAKecC0eLkglsIVYQhlKK94qtkmHGAdQTj2yG";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const endpoint_url = environment === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

const stripeClient = stripeModule("sk_test_51PHBeCP8sQXr5TAn3VEfZMDSuiWOxejb13sBs4ri2yt41b21WcP39uCm2er92kmhuBuWtrCDa1Oh4qwbeYmNoAGa00ev7kLAqN");

// Home route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/static/templates/index.html");
});

// Create the order - PayPal
app.post("/create_order", (req, res) => {
  get_access_token()
    .then((access_token) => {
      const { price, currency } = req.session;
      let order_data_json = {
        intent: req.body.intent.toUpperCase(),
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: price,
            },
          },
        ],
      };
      const data = JSON.stringify(order_data_json);

      fetch(endpoint_url + "/v2/checkout/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
app.post("/complete_order", (req, res) => {
  get_access_token()
    .then((access_token) => {
      fetch(
        endpoint_url +
          "/v2/checkout/orders/" +
          req.body.order_id +
          "/" +
          req.body.intent,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          console.log(json);
          req.session.payment_success = true; // Mark payment as successful
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
  const data = "grant_type=client_credentials";
  return fetch(endpoint_url + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(auth).toString("base64")}`,
    },
    body: data,
  })
    .then((res) => res.json())
    .then((json) => {
      return json.access_token;
    });
}

// Stripe checkout
app.post("/checkout", async (req, res) => {
  const { payment_uuid, price, currency } = req.session;

  const session = await stripeClient.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: "Car Wash",
          },
          unit_amount: price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    payment_method_types: ["card", "paypal"],  // Assuming PayPal integration within Stripe
    shipping_address_collection: {
      allowed_countries: ["US", "BR", "PT", "ES", "GB"],
    },
    metadata: { payment_uuid }, // Include payment UUID in metadata for internal tracking
    success_url: `http://localhost:8002/success`,
    cancel_url: "http://localhost:8002/cancel",
  });
  req.session.payment_success = true; // Mark payment as successful
  res.redirect(session.url);
});

// Complete the order - Stripe
app.post("/complete_order_stripe", async (req, res) => {
  try {
    const { stripe_id } = req.body;

    // Retrieve the order details from Stripe
    const order = await stripeClient.checkout.sessions.retrieve(stripe_id, {
      expand: ["payment_intent.payment_method"],
    });

    const successfulMessage = `Your payment was successful for order ID ${order.id}`;

    // Send the response back to the client
    res.json({ message: successfulMessage, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during order completion" });
  }
});

// Stripe checkout cancel
app.get("/cancel", (req, res) => {
  res.sendFile(__dirname + "/static/templates/index.html");
});

// Success endpoint
app.get("/successfulpaymentuuid", (req, res) => {
  const { payment_uuid, payment_success } = req.session;
  if (payment_success) {
    console.log(`Success endpoint payment_uuid: ${payment_uuid}`);
    res.json({ payment_uuid });
  } else {
    res.status(400).json({ error: "Payment not successful yet." });
  }
});

app.get("/success", (req, res) => {
  res.sendFile(__dirname + "/static/templates/index2.html");
});

app.post("/update_price_amount", (req, res) => {
  try {
    const { amount: newPrice, currency: newCurrency } = req.body;
    const payment_uuid = uuidv4(); // Generate a unique payment UUID

    req.session.payment_uuid = payment_uuid; // Store in session
    req.session.price = newPrice;
    req.session.currency = newCurrency;
    req.session.payment_success = false; // Initialize payment success as false

    // Log the updated values (optional)
    console.log("Updated Price:", newPrice);
    console.log("Updated Currency:", newCurrency);
    console.log("Generated payment_uuid:", payment_uuid);

    // Send price, currency data, and payment UUID back to the client
    res.json({ price: newPrice, currency: newCurrency, payment_uuid });
  } catch (error) {
    console.error("Error updating price, currency, and generating payment UUID:", error);
    res.status(500).json({ error: "An error occurred while updating price and currency and generating payment UUID." });
  }
});

app.get("/get_price_amount", (req, res) => {
  try {
    const { price, currency } = req.session;
    res.json({ price, currency });
  } catch (error) {
    console.error("Error getting price and currency:", error);
    res.status(500).json({ error: "An error occurred while getting price and currency." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
