const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Paystack } = require('@paystack/paystack-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize the Paystack SDK with your secret key from the .env file
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

// POST route to initialize a transaction
app.post('/pay', async (req, res) => {
    try {
        const { email, amount } = req.body;

        if (!email || !amount) {
            return res.status(400).json({ success: false, error: 'Email and amount are required' });
        }

        // Call Paystack to initialize transaction (amount is multiplied by 100 to convert to kobo)
        const response = await paystack.transaction.initialize({
            email: email,
            amount: amount * 100 
        });

        if (!response.status) {
            return res.status(400).json({ success: false, error: response.message });
        }

        // Return the secure checkout link and reference to the client
        res.status(200).json({
            success: true,
            authorization_url: response.data.authorization_url,
            reference: response.data.reference
        });

    } catch (error) {
        console.error('Paystack SDK Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Paystack backend server running on http://localhost:${PORT}`);
});