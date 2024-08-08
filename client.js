const axios = require('axios');
const jsonl = require("node-jsonl");
const secret = 'secret';

readEvents();


async function readEvents() {
    const rl = jsonl.readlines('events.jsonl');
    while (true) {
        const { value, done } = await rl.next();

        if (done) break;
        await postRequest(value);

    }
}

async function postRequest(event) {
    const headers = {
        Authorization: secret,
        'Content-Type': 'application/json',
    };

    const requestOptions = {
        url: "http://localhost:8000/liveEvent",
        method: 'POST',
        headers,
        data: event,
    };

    try {
        const response = await axios(requestOptions);
        return response.data;
    } catch (error) {
        console.error('Error sending POST request:', error.message);
        throw error;
    }
}
