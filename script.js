

let CONGRESS_API_KEY;
let OPENAI_API_KEY;
const apiUrl = `https://api.congress.gov/v3/bill?api_key=${congressApiKey}`;
let bills = [];
let currentIndex = 0;

async function getLatestBills() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('API Response:', data);

        if (data && data.bills) {
            bills = data.bills;
            displayBill(bills[currentIndex]);
            updateButtons();
        } else {
            throw new Error('Unexpected API response structure');
        }
    } catch (error) {
        console.error('Error fetching the bills data:', error);
        document.getElementById('bill').innerHTML = '<p>Failed to load the latest bills.</p>';
    }
}

function displayBill(bill) {
    const billElement = document.getElementById('bill');
    billElement.innerHTML = `
        <h2>${bill.title}</h2>
        <p><strong>Bill ID:</strong> ${bill.bill_id}</p>
        <p><strong>Introduced Date:</strong> ${bill.introduced_date}</p>
        <p><strong>Latest Action:</strong> ${bill.latest_action}</p>
    `;
    getBillInsights(bill);
}

async function getBillInsights(bill) {
    const insightsElement = document.getElementById('insights');
    insightsElement.innerHTML = '<p>Loading insights...</p>';

    const prompt = `
        Summarize the following bill for the public:
        Title: ${bill.title}
        Introduced Date: ${bill.introduced_date}
        Latest Action: ${bill.latest_action}
        
        Provide the following details:
        - Costs associated
        - Sponsoring officials and short profiles
        - Arguments for the bill
        - Arguments against the bill
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${chatGptApiKey}`
            },
            body: JSON.stringify({
                model: 'text-davinci-003',
                prompt: prompt,
                max_tokens: 500
            })
        });

        const data = await response.json();
        console.log('OpenAI Response:', data);
        if (data && data.choices && data.choices.length > 0) {
            insightsElement.innerHTML = `<p>${data.choices[0].text.trim()}</p>`;
        } else {
            throw new Error('Unexpected OpenAI API response structure');
        }
    } catch (error) {
        console.error('Error fetching the insights:', error);
        insightsElement.innerHTML = '<p>Failed to load insights.</p>';
    }
}

function updateButtons() {
    document.getElementById('prevBtn').disabled = currentIndex === 0;
    document.getElementById('nextBtn').disabled = currentIndex === bills.length - 1;
}

function previousBill() {
    if (currentIndex > 0) {
        currentIndex--;
        displayBill(bills[currentIndex]);
        updateButtons();
    }
}

function nextBill() {
    if (currentIndex < bills.length - 1) {
        currentIndex++;
        displayBill(bills[currentIndex]);
        updateButtons();
    }
}

getLatestBills();
