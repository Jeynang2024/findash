// server.js (Node + Express)
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import authorizationRoutes from './routes/auth.js'; // Adjust the path as necessary
import Binance from 'binance-api-node'; // Import the default export
import passport from './routes/middleware/passportconfig.js';
import CryptoJS from 'crypto-js';
import { createHmac } from 'node:crypto';
import axios from "axios"
function signQueryString(queryString, secret) {
  return createHmac('sha256', secret).update(queryString).digest('hex');
}
const app = express();
import pool from './db.js';
app.use(express.json()); 
app.use(cors({
  origin: 'http://localhost:5173',  // React dev server origin
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));
app.use(passport.initialize()); // Initialize Passport for authentication
app.options('/{*splat}', cors());
app.use('/api/auth', authorizationRoutes); // Use the auth routes


//const API_KEY ="6fvqCgvHOvSF1F6LboI18hO4qj5bGTjAnzxWhW2Jwv6PCx0KnJEPXe5kbiFTYoDu"
//const API_SECRET ="uruxesHtN7SJOrfAeQU4xx5PTPsAcQR0EJAPQTQhB8y4pcQFuS9z5gEKOZUvZ6RR"

//const BASE_URL = 'https://testnet.binance.vision';


async function getUserBinanceClient(userId) {
  const { rows } = await pool.query(
    'SELECT api_key, api_secret FROM crypto_users WHERE id = $1',
    [userId]
  );
  if (!rows[0]?.api_key || !rows[0]?.api_secret) {
    throw new Error('No Binance credentials found');
  }
  return Binance.default({
    apiKey: rows[0].api_key,
    apiSecret: rows[0].api_secret,
    httpBase: 'https://testnet.binance.vision',
  });
}
app.get('/account', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const client = await getUserBinanceClient(req.user.id);
    const info = await client.accountInfo();
    const balances = (info.balances || [])
      .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map(b => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
      }));
    res.json(balances);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
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
app.post(
  '/order',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { symbol, side, quantity } = req.body;
    const userId = req.user.id;
 try{
    // 1. Fetch user's Binance API credentials
    const user = await pool.query(
        'SELECT api_key, api_secret FROM crypto_users WHERE id = $1',
        [userId]
      );

       if (!user.rows.length || !user.rows[0].api_secret) {
  return res.status(400).json({ error: 'Binance API credentials not found' });
}

const apiKey = user.rows[0].api_key;
const apiSecret = user.rows[0].api_secret;

if (!apiSecret) {
  return res.status(400).json({ error: 'Binance API secret is missing' });
}



const timestamp = Date.now();
      const params = {
        symbol,
        side: side.toUpperCase(),
        type: 'MARKET',
        quantity,
        timestamp,
        recvWindow: 5000,
        newOrderRespType: 'FULL' // To get fills data
      };


const paramString = new URLSearchParams(params).toString();

const signature = signQueryString(paramString, apiSecret);
const finalParams = new URLSearchParams({ ...params, signature });

      const binanceResponse = await axios.post(
        'https://testnet.binance.vision/api/v3/order',
  finalParams.toString(),
        {
          headers: {
            'X-MBX-APIKEY': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );


const fills = binanceResponse.data.fills || [];
      const price = fills.length > 0 ? fills[0].price : null;
      
      const executedQty = fills.length > 0 ? fills[0].qty : quantity;
      const orderId = binanceResponse.data.orderId;
      const spent=price*executedQty;
    await pool.query(
      `INSERT INTO trades 
       (user_id, symbol, side, price, quantity, order_id) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, symbol, side, spent, quantity, orderId]
    );

    // 4. Send back the stored order and trade info
   res.json({
        success: true,
        orderId,
        symbol,
        side,
        price,
        quantity: executedQty,
        timestamp: new Date().toISOString()
      }); 
     }catch (error) {
      console.error('Order placement error:', error);
      
      // Handle different error types
      let statusCode = 500;
      let errorMessage = 'Failed to place order';
      
      if (error.response) {
        // Binance API error
        statusCode = error.response.status;
        errorMessage = error.response.data.msg || error.response.data.message;
      } else if (error.request) {
        // No response received
        errorMessage = 'No response from Binance API';
      }

      res.status(statusCode).json({ 
        success: false,
        error: errorMessage,
        details: error.response?.data || error.message
      });
    }
    }

);

app.get('/profit', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      COALESCE(SUM(CASE WHEN side = 'BUY' THEN price END), 0) AS buy_total,
      COALESCE(SUM(CASE WHEN side = 'SELL' THEN price END), 0) AS sell_total
    FROM trades
    WHERE user_id = $1;
  `;

  try {
    const { rows } = await pool.query(sql, [userId]);
    const { buy_total: buyTotal, sell_total: sellTotal } = rows[0];
    const profit = sellTotal - buyTotal;
    
    res.json({ buyTotal, sellTotal, profit });
  } catch (err) {
    console.error('Error calculating profit:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// GET endpoint to fetch trades for authenticated user
app.get(
  '/trades',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Fetch trades from database with pagination
      const { rows } = await pool.query(
        `SELECT id, symbol, side, price, quantity, order_id, created_at 
         FROM trades 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 5`, // Adjust limit as needed
        [userId]
      );

      // Format response
      const trades = rows.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        side: trade.side,
        price: parseFloat(trade.price),
        quantity: parseFloat(trade.quantity),
        orderId: trade.order_id,
        createdAt: trade.created_at
      }));

      res.json({ success: true, trades });

    } catch (error) {
      console.error('Error fetching trades:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch trades'
      });
    }
  }
);
// Middleware to parse JSON bodies

app.listen(5001, () => console.log('Listening on port 5001'));
