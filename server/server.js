import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import authorizationRoutes from './routes/auth.js';
import Binance from 'binance-api-node'; 
import passport from './routes/middleware/passportconfig.js';
import { createHmac } from 'node:crypto';
import axios from "axios"
import pool from './db.js';
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.SERVER_PORT ;

function signQueryString(queryString, secret) {
  return createHmac('sha256', secret).update(queryString).digest('hex');
}
const app = express();
app.use(express.json()); 
app.use(cors({
  origin: 'http://localhost:5173',  
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));
app.use(passport.initialize()); 
app.options('/{*splat}', cors());
app.use('/api/auth', authorizationRoutes);



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

app.get('/api/btc-rates', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coinbase.com/v2/exchange-rates',
      { params: { currency: 'BTC' } }
    );
    res.json(resp.data.data.rates);
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
        newOrderRespType: 'FULL'
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
      
      let statusCode = 500;
      let errorMessage = 'Failed to place order';
      
      if (error.response) {
        statusCode = error.response.status;
        errorMessage = error.response.data.msg || error.response.data.message;
      } else if (error.request) {
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



app.get(
  '/trades',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      const { rows } = await pool.query(
        `SELECT id, symbol, side, price, quantity, order_id, created_at 
         FROM trades 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 5`, 
        [userId]
      );

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
app.get('/api/binance/ticker', async (req, res) => {
  try {
    const { symbol } = req.query;
    const response = await axios.get(`https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`);
    res.json(response.data);
  } catch (err) {
    console.error('Binance proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch ticker data' });
  }
});

app.get(
  '/dashboard',
  passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
  }
);

app.get(
  '/backtest',
  passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
  }
);

app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on port ${port}`);
});
