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
        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
        }

        if (end <= start) {
            throw new Error('End date must be after start date');
        }

        // Calculate days between dates
        // Uses simple date arithmetic for date-only inputs (no time components)
        const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
        
        // Calculate daily interest rate from monthly rate
        // Convert monthly percentage rate to daily rate using standard 365-day convention
        // This matches the revolving credit calculation approach
        const annualRate = interestRatePerMonth * 12;
        const dailyRate = annualRate / 100 / 365;
        
        // Calculate interest for the period
        const periodInterest = loanAmount * dailyRate * daysDiff;
        
        // Format date range
        const dateRange = `${start.toLocaleDateString('en-US')} to ${end.toLocaleDateString('en-US')}`;
        
        // Prepare result data
        const data = {
            loanAmount: Number(loanAmount.toFixed(2)),
            interestRatePerMonth: Number(interestRatePerMonth.toFixed(2)),
            dateRange: dateRange,
            startDate: start.toLocaleDateString('en-US'),
            endDate: end.toLocaleDateString('en-US'),
            days: daysDiff,
            interest: Number(periodInterest.toFixed(2)),
            totalAmount: Number((loanAmount + periodInterest).toFixed(2))
        };
        
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
    document.getElementById('displayLoanAmount').textContent = data.loanAmount.toFixed(2);
    document.getElementById('displayInterestRate').textContent = `${data.interestRatePerMonth.toFixed(2)}%`;
    document.getElementById('displayDays').textContent = `${data.days} days`;
    document.getElementById('displayInterest').textContent = data.interest.toFixed(2);
    document.getElementById('displayTotalAmount').textContent = data.totalAmount.toFixed(2);
    
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
