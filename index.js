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

app.post("/capture-order", async (req, res) => {
  const { orderID } = req.body;
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);

    // Agrega tiempo fijo: 60 segundos por ejemplo
    userTime += 60;

    res.json({ success: true, addedSeconds: 60 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});


  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating PayPal order");
  }
});

app.post("/add-time", async (req, res) => {
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
