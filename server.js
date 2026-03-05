const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const USER_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function isValidUserId(userId) {
  return USER_ID_REGEX.test(userId);
}

function getUserFilePath(userId) {
  return path.join(DATA_DIR, `${userId}.json`);
}

function validateHolding(payload = {}) {
  const errors = {};
  const normalizedSymbol = typeof payload.symbol === "string" ? payload.symbol.trim().toUpperCase() : "";

  if (!normalizedSymbol) {
    errors.symbol = "symbol must be a non-empty string";
  }

  if (typeof payload.shares !== "number" || !Number.isFinite(payload.shares) || payload.shares <= 0) {
    errors.shares = "shares must be a number greater than 0";
  }

  if (typeof payload.price !== "number" || !Number.isFinite(payload.price) || payload.price <= 0) {
    errors.price = "price must be a number greater than 0";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    holding: {
      symbol: normalizedSymbol,
      shares: payload.shares,
      price: payload.price
    }
  };
}

async function readUserPortfolio(userId) {
  const filePath = getUserFilePath(userId);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.holdings)) {
      return { holdings: [] };
    }

    return {
      holdings: parsed.holdings
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { holdings: [] };
    }
    throw error;
  }
}

async function writeUserPortfolio(userId, data) {
  const filePath = getUserFilePath(userId);
  const serialized = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, serialized, "utf-8");
}

function requireValidUserId(req, res, next) {
  const { userId } = req.params;

  if (!isValidUserId(userId)) {
    return res.status(400).json({
      error: "Invalid userId",
      details: "userId must match /^[a-zA-Z0-9_-]+$/"
    });
  }

  return next();
}

app.post("/api/users/:userId/portfolio", requireValidUserId, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const validation = validateHolding(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors
      });
    }

    const portfolio = await readUserPortfolio(userId);
    portfolio.holdings.push(validation.holding);
    await writeUserPortfolio(userId, portfolio);

    return res.status(200).json(portfolio);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/users/:userId/portfolio", requireValidUserId, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const portfolio = await readUserPortfolio(userId);
    return res.status(200).json(portfolio);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/users/:userId/portfolio/value", requireValidUserId, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const portfolio = await readUserPortfolio(userId);
    const rawTotalValue = portfolio.holdings.reduce((acc, item) => acc + item.shares * item.price, 0);
    const totalValue = Number(rawTotalValue.toFixed(2));

    return res.status(200).json({
      userId,
      totalValue,
      currency: "USD",
      holdings: portfolio.holdings,
      computedAt: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API route not found"
  });
});

app.use((req, res) => {
  res.status(404).send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>404 - Not Found</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f3f4f6;
            color: #111827;
          }
          .card {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            text-align: center;
            max-width: 420px;
          }
          a {
            color: #2563eb;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>404</h1>
          <p>The page you requested was not found.</p>
          <p><a href="/">Back to Home</a></p>
        </div>
      </body>
    </html>
  `);
});

app.use((error, req, res, next) => {
  console.error("Unexpected error:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "production" ? undefined : error.message
  });
});

async function startServer() {
  try {
    await ensureDataDir();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
