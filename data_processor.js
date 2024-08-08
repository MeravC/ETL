const jsonl = require("node-jsonl");
const pkg = require('pg');

const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'merav',
    port: 5433,
});

readEvents();

async function readEvents() {
    try {
        const revenueMap = new Map();
        const rl = jsonl.readlines('eventsPost.jsonl');

        for await (const event of rl) {
            const { userId, name, value } = event;
            updateRevenueMap(revenueMap, userId, name, value);
        }

        await calculateRevenue(revenueMap);
    } catch (error) {
        console.error('Error reading events:', error);
        throw error;
    }
}

function updateRevenueMap(revenueMap, userId, name, value) {
    if (!revenueMap.has(userId)) {
        revenueMap.set(userId, 0);
    }

    if (name === 'add_revenue') {
        revenueMap.set(userId, revenueMap.get(userId) + value);
    } else if (name === 'subtract_revenue') {
        revenueMap.set(userId, revenueMap.get(userId) - value);
    } else {
        throw new Error('Error - invalid event name');
    }
}

async function calculateRevenue(revenueMap) {
    try {
        for (const [userId, revenue] of revenueMap) {
            await updateDB(userId, revenue);
        }
    } catch (error) {
        console.error('Error calculating revenue:', error);
        throw error;
    }
}

async function updateDB(userId, revenue) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const getQuery = `
        SELECT user_id, revenue
        FROM users_revenue
        WHERE user_id = $1
        FOR UPDATE;`;

        const { rows } = await client.query(getQuery, [userId]);

        let userData;
        if (rows.length > 0) {
            userData = rows[0];
            userData.revenue = Number(userData.revenue) + revenue;
        } else {
            userData = { userId, revenue };
        }

        const upsertQuery = `
        INSERT INTO users_revenue (user_id, revenue)
        VALUES ($1, $2)
        ON CONFLICT (user_id)
        DO UPDATE SET revenue = $2;`;

        await client.query(upsertQuery, [userId, userData.revenue]);
        await client.query('COMMIT');
        console.log('Query done, lock completed');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error', error);
        throw error;
    } finally {
        client.release();
    }
}