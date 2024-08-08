const axios = require('axios');
const jsonl = require("node-jsonl");
const secret = 'secret';

readEvents();

async function readEvents() {
    try {
      const rl = jsonl.readlines('events.jsonl');
      for await (const event of rl) {
        await postRequest(event);
      }
    } catch (error) {
      console.error('Error reading events:', error);
      throw error;
    }
  }

async function postRequest(event) {
    const headers = {
        Authorization: secret,
        'Content-Type': 'application/json',
    };

    const request = {
        url: "http://localhost:8000/liveEvent",
        method: 'POST',
        headers,
        data: event,
    };

    try {
        const response = await axios(request);
        return response.data;
    } catch (error) {
        console.error('Error sending POST request:', error.message);
        throw error;
    }
}
