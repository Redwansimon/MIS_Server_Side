require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sql, MIS_DBpoolPromise, muadPoolPromise } = require('./db');
const jwt = require('jsonwebtoken');
const verifytoken = require('./middleware/auth');

const jwt_secret = process.env.jwt_secret;
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Server running successfully');
    console.log('server running successfully')


});


//Dashboard protected API Routes
app.get('/api/dashboard', verifytoken, async (req, res) => {

    res.json({
        message: "protected data",
        user: req.user
    })

})


// Login Route (NOW CONNECTED TO DB)
app.post('/api/login', async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "UserID and Password Required" })
    }


    try {
        const pool = await MIS_DBpoolPromise;

        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(`
                SELECT * FROM Users 
                WHERE username = @username AND password = @password
            `);


        if (result.recordset.length > 0) {

            const user = result.recordset[0];
            //JWT Token creation //


            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username
                },

                jwt_secret,

                { expiresIn: '1h' }
            );
            res.json({
                message: "login successfull",
                token: token
            })



        } else {

            res.json({
                message: 'Invalid credentials',

            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Server error'
        });

    }
});

//api for shopdetails route

app.get('/api/shop', async (req, res) => {

    try {

        const pool = await muadPoolPromise;
        const result = await pool.request()
            .query(`SELECT 
    STORE_CODE,
    STORE_NAME,
    ADDRESS1,
    
    CITY,
    PHONE,
    EMAIL,
    VATREGNO,
    STORETYPE,
    STATUS
FROM STORE;`)
        res.json(result.recordset);

    }
    catch (error) {
        res.status(500).json({
            message: 'server error'
        })
    }
})


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});