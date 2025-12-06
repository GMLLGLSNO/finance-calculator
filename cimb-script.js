/**
 * Frontend JavaScript for CIMB Interest Calculator
 * Handles form submission, API calls, and results display
 */

// Get DOM elements
const form = document.getElementById('cimbForm');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');

// Form submission handler
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Hide previous results and errors
    resultsDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    
    // Get form values
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const interestRatePerMonth = parseFloat(document.getElementById('interestRatePerMonth').value);
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Validate inputs
    if (isNaN(loanAmount) || isNaN(interestRatePerMonth)) {
        showError('Please enter valid numeric values.');
        return;
    }
    
    if (!startDate || !endDate) {
        showError('Please select both start and end dates.');
        return;
    }
    
    try {
        // Make API call
        const response = await fetch('/cimb', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loanAmount: loanAmount,
                interestRatePerMonth: interestRatePerMonth,
                startDate: startDate,
                endDate: endDate
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Calculation failed');
        }
        
        // Display results
        displayResults(data);
        
    } catch (error) {
        showError(error.message || 'Failed to calculate interest. Please try again.');
    }
});

/**
 * Display calculation results
 */
function displayResults(data) {
    // Update result cards
    document.getElementById('displayLoanAmount').textContent = `RM ${data.loanAmount.toFixed(2)}`;
    document.getElementById('displayInterestRate').textContent = `${data.interestRatePerMonth.toFixed(2)}%`;
    document.getElementById('displayDays').textContent = `${data.days} days`;
    document.getElementById('displayInterest').textContent = `RM ${data.interest.toFixed(2)}`;
    document.getElementById('displayTotalAmount').textContent = `RM ${data.totalAmount.toFixed(2)}`;
    
    // Update date range
    document.getElementById('dateRange').textContent = data.dateRange;
    document.getElementById('displayStartDate').textContent = data.startDate;
    document.getElementById('displayEndDate').textContent = data.endDate;
    
    // Show results
    resultsDiv.classList.remove('hidden');
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Show error message
 */
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
