// server.js (Node + Express)
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import authorizationRoutes from './routes/auth.js'; // Adjust the path as necessary
import Binance from 'binance-api-node'; // Import the default export
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',  // React dev server origin
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));

// 2. Explicitly handle OPTIONS pre-flight requests (if needed)
app.options('/{*splat}', cors());

//const API_KEY ="6fvqCgvHOvSF1F6LboI18hO4qj5bGTjAnzxWhW2Jwv6PCx0KnJEPXe5kbiFTYoDu"
//const API_SECRET ="uruxesHtN7SJOrfAeQU4xx5PTPsAcQR0EJAPQTQhB8y4pcQFuS9z5gEKOZUvZ6RR"

//const BASE_URL = 'https://testnet.binance.vision';

const client = Binance.default({
  apiKey: "6fvqCgvHOvSF1F6LboI18hO4qj5bGTjAnzxWhW2Jwv6PCx0KnJEPXe5kbiFTYoDu",
  apiSecret: "uruxesHtN7SJOrfAeQU4xx5PTPsAcQR0EJAPQTQhB8y4pcQFuS9z5gEKOZUvZ6RR",
  httpBase: 'https://testnet.binance.vision' // 🔥 Important for testnet
});

app.get('/account', async (req, res) => {
  try {
    const accountInfo = await client.accountInfo();
    
    // Ensure we always return an array
    const balances = accountInfo.balances || [];
    
    // Filter and format the response
    const nonZeroBalances = balances
      .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map(b => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked)
      }));
    
    res.json(nonZeroBalances);
    
  } catch (error) {
    console.error('Binance API error:', error);
    res.status(500).json({
      error: 'Failed to fetch balances',
      details: error.message,
      balances: [] // Consistent return shape
    });
  }
});
// server/routes.js (Express.js)
app.get('/api/btc-rates', async (req, res) => {
  try {
    const response = await fetch(
      'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR,GBP'
    );
    const rates = await response.json(); // e.g., { USD: 51824.33, EUR: 46087.93, GBP: 37654.12 }
    res.json(rates);
  } catch (err) {
    console.error('Error fetching CryptoCompare data:', err);
    res.status(500).json({ error: 'Failed to fetch conversion rates' });
  }
});
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/api/auth', authorizationRoutes); // Use the auth routes

app.listen(5001, () => console.log('Listening on port 5001'));
