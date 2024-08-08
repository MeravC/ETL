const pkg = require('pg');
const { Client } = pkg;
const express = require('express');
const app = express();
app.use(express.json());

const port = 8000;

app.listen(port, () => {
    console.log(`My app listening on port ${port}`);
});

app.post('/liveEvent', authentication, (req, res) => {

    try {
        res.status(201).json({ message: 'Event sent to process' });

        const event = JSON.stringify(req.body) + '\r\n';
        const fs = require('fs');
        fs.appendFile('eventsPost.jsonl', event, (err) => {
            if (err) throw err;
            console.log('Text appended to file');
        });

    } catch (error) {
        res.status(401).json({ message: error });
    }
});

app.get('/userEvents/:userid', async (req, res) => {
    try {
        const userId = req.params && req.params.userid;
        const result = await getRevenueByUserId(userId);
        if (!result) {
            throw new Error('Error Get results');
        }
        res.send(result);
    } catch (err) {
        res.status(400).json({
            message: 'Unable to get data',
        });
    }
});

async function getRevenueByUserId(userId) {
    const connectionString =
        'postgresql://postgres:merav@localhost:5433/postgres';

    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        const selectQuery = `
          SELECT user_id, revenue
          FROM users_revenue
          WHERE user_id = $1;`;

        const { rows } = await client.query(selectQuery, [userId]);

        if (!rows) {
            throw new Error('Error while getting user data');
        }
        return rows[0];
    } catch (err) {
        throw new Error(err);
    } finally {
        await client.end();
    }
}


function authentication(req, res, next) {
    const authHeader = req.headers.authorization;

    // if (!authHeader) {
    //     let err = new Error('You are not authenticated!');
    //     // res.setHeader('WWW-Authenticate', 'Basic');
    //     err.status = 401;
    //     return next(err)
    // }

    if (authHeader === 'secret') {
        next();
    } else {
        let err = new Error('You are not authenticated!');
        // res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
    }
}


