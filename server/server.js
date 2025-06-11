// server.js (Node + Express)
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import authorizationRoutes from './routes/auth.js'; // Adjust the path as necessary

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',  // React dev server origin
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));

// 2. Explicitly handle OPTIONS pre-flight requests (if needed)
app.options('/{*splat}', cors());
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
