// === backend/index.js ===
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const paypal = require("@paypal/checkout-server-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// PayPal config
const Environment = paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
);

// Store user time in-memory
let userTime = 0; // in seconds

app.post("/create-order", async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "1.00"
        }
      }
    ]
  });

  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating PayPal order");
  }
});

app.post("/capture-order", async (req, res) => {
  const { orderID } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);

    // Add time to user (e.g., 60 seconds per $1)
    userTime += 60;
    res.json({ status: "success", addedTime: 60, totalTime: userTime });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error capturing PayPal order");
  }
});

app.get("/time", (req, res) => {
  res.json({ totalTime: userTime });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
