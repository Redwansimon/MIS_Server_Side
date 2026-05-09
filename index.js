
const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./db');
const jwt = require('jsonwebtoken');

const jwt_secret = 'mbrella_key';
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


// Login Route (NOW CONNECTED TO DB)
app.post('/api/login', async (req, res) => {

    const { username, password } = req.body;

    if(!username || !password){ 
       return res.status(400).json({message: "UserID and Password Required"})
    }


    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(`
                SELECT * FROM Users 
                WHERE username = @username AND password = @password
            `);
           

        if (result.recordset.length > 0) {

            const user = result.recordset[0];

            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username
                },

                jwt_secret,

                {expiresIn: '1h'}
            );
            res.json({
                message: "login successfull",
                token: token
            })

                // res.json({
                // message: 'Login successful',
                // user: result.recordset[0]

            // });

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


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});