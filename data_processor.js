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


async function readEvents(){

    const map = {};
    const rl = jsonl.readlines('eventsPost.jsonl');
    while (true) {
        const {value, done} = await rl.next();
        if (done) break;

        map[value.userId] = map[value.userId] || 0;

        if(value.name === 'add_revenue') map[value.userId]+= value.value;
        else if(value.name === 'subtract_revenue') map[value.userId]-= value.value;
        else throw new Error('Error- calculate revenue');

    }

    calculateRevenue(map);

}

function calculateRevenue(map){
    
    for (const [userId, revenue] of Object.entries(map)) {
        updateDB(userId, revenue);
    }
}

async function updateDB(userId, revenue){
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const getQuery = `
            SELECT user_id, revenue
            FROM users_revenue
            WHERE user_id = $1
            FOR UPDATE ;`;

        const { rows } = await client.query(getQuery, [userId]);

        let userData;

        if (rows.length > 0) {
            userData = rows[0];
            userData.revenue = Number(userData.revenue) + revenue;
        }else{
            userData = {userId, revenue};
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