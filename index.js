const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const TEST_SERVER_URL = "http://20.244.56.144/test/";
const WINDOW_SIZE = 10;
const TIMEOUT = 500;  // 500 milliseconds

// Initialize window state with correct keys
const windowState = {
    'primes': [],
    'fibo': [],
    'even': [],
    'rand': []
};

async function fetchNumbersFromTestServer(numberId) {
    try {
        const response = await axios.get(`${TEST_SERVER_URL}${numberId}`, { timeout: TIMEOUT });
        return response.data.numbers || [];
    } catch (error) {
        return [];
    }
}

function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

app.get('/numbers/:numberId', async (req, res) => {
    const numberId = req.params.numberId;

    if (!['primes', 'fibo', 'even', 'rand'].includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    // Fetch new numbers
    const newNumbers = await fetchNumbersFromTestServer(numberId);
    const uniqueNewNumbers = [...new Set(newNumbers)];

    // Update window state
    const prevState = [...windowState[numberId]];
    const currentState = [...prevState, ...uniqueNewNumbers].slice(-WINDOW_SIZE);
    windowState[numberId] = currentState;

    // Calculate average
    const average = calculateAverage(currentState);

    // Respond with the required format
    res.json({
        numbers: uniqueNewNumbers,
        windowPrevState: prevState,
        windowCurrState: currentState,
        avg: average
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
