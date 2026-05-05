const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/fetch-rules", async (req, res) => {
  const { token, instanceUrl } = req.body;

  try {
    const response = await fetch(
      `${instanceUrl}/services/data/v57.0/tooling/query/?q=SELECT+Id,ValidationName,Active+FROM+ValidationRule`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch("/toggle-rule", async (req, res) => {
  const { token, instanceUrl, ruleId, active } = req.body;

  try {
    await fetch(
      `${instanceUrl}/services/data/v57.0/tooling/sobjects/ValidationRule/${ruleId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Active: active }),
      }
    );

    res.send("Updated");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));