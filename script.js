/**
 * Frontend JavaScript for Revolving Credit Calculator
 * Handles form submission, API calls, and results display
 */

// Get DOM elements
const form = document.getElementById('creditForm');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const amortizationBody = document.getElementById('amortizationBody');

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format number with commas
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
}

// Hide error message
function hideError() {
    errorDiv.classList.add('hidden');
}

// Display results
function displayResults(data) {
    // Update summary cards
    document.getElementById('monthlyInterest').textContent = formatCurrency(data.monthlyInterest);
    document.getElementById('minimumPayment').textContent = formatCurrency(data.minimumPayment);
    document.getElementById('newBalance').textContent = formatCurrency(data.newBalance);
    document.getElementById('totalInterest').textContent = formatCurrency(data.totalInterestPaid);
    
    // Format payoff time
    const months = data.monthsToPayOff;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    let payoffText = '';
    
    if (years > 0) {
        payoffText = `${years} year${years > 1 ? 's' : ''}`;
        if (remainingMonths > 0) {
            payoffText += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
        }
    } else {
        payoffText = `${months} month${months > 1 ? 's' : ''}`;
    }
    
    document.getElementById('payoffTime').textContent = payoffText;

    // Clear and populate amortization table
    amortizationBody.innerHTML = '';
    
    data.amortizationSchedule.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.month}</td>
            <td>${formatCurrency(row.payment)}</td>
            <td>${formatCurrency(row.principal)}</td>
            <td>${formatCurrency(row.interest)}</td>
            <td>${formatCurrency(row.remainingBalance)}</td>
        `;
        amortizationBody.appendChild(tr);
    });

    // Show results
    resultsDiv.classList.remove('hidden');
    hideError();
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const creditLimit = document.getElementById('creditLimit').value;
    const balance = document.getElementById('balance').value;
    const interestRate = document.getElementById('interestRate').value;
    const payment = document.getElementById('payment').value;
    const gracePeriod = document.getElementById('gracePeriod').value;

    // Validate required fields
    if (!balance || !interestRate || !payment) {
        showError('Please fill in all required fields (Balance, Interest Rate, and Payment).');
        return;
    }

    // Validate that values are positive
    if (parseFloat(balance) < 0 || parseFloat(interestRate) < 0 || parseFloat(payment) < 0) {
        showError('Values cannot be negative.');
        return;
    }

    // Validate that payment is greater than 0
    if (parseFloat(payment) <= 0) {
        showError('Payment must be greater than zero.');
        return;
    }

    // Prepare request data
    const requestData = {
        creditLimit: creditLimit || 0,
        balance: balance,
        interestRate: interestRate,
        payment: payment,
        gracePeriod: gracePeriod || 0
    };

    try {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Calculating...';
        submitButton.disabled = true;

        // Make API call
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        // Restore button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;

        if (!response.ok) {
            showError(data.error || 'An error occurred during calculation.');
            return;
        }

        // Display results
        displayResults(data);

    } catch (error) {
        console.error('Error:', error);
        showError('Failed to connect to the calculation service. Please try again.');
        
        // Restore button state
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Calculate';
        submitButton.disabled = false;
    }
});

// Add input validation
const numericInputs = document.querySelectorAll('input[type="number"]');
numericInputs.forEach(input => {
    input.addEventListener('input', function() {
        // Ensure non-negative values
        const value = parseFloat(this.value);
        if (!isNaN(value) && value < 0) {
            this.value = 0;
        }
    });
});

// Initialize - hide results on page load
resultsDiv.classList.add('hidden');
errorDiv.classList.add('hidden');
