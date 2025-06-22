import express from 'express';
import pool from "../db.js"; // Adjust the path as necessary
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from './middleware/passportconfig.js';
 // Adjust the path as necessary
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

router.post("/signup",async (req, res) => {
    const { username, email, password ,apiKey ,apiSecret} = req.body;

  console.log("api key",apiKey);    
    console.log("api secret",apiSecret);
    try {
        const response=await pool.query("SELECT * FROM crypto_users WHERE email = $1", [email]);
        if (response.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            "INSERT INTO crypto_users (username, email, password,api_key,api_secret) VALUES ($1, $2, $3,$4,$5) RETURNING *",
            [username, email, hashedPassword,apiKey ,apiSecret]
        );
        const user = newUser.rows[0];
        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.status(201).json({ message: "User created successfully", token:token, user: { id: user.id, username: user.username, email: user.email } });   

        
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal server error" });
        
    }
   

});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await pool.query("SELECT * FROM crypto_users WHERE email = $1", [email]);
        if (response.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        const user = response.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token: token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// In your auth routes file

export default router;