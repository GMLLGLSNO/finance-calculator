/**
 * Frontend JavaScript for Revolving Credit Calculator
 * Handles form submission, API calls, and results display
 */

// Get DOM elements
const form = document.getElementById('creditForm');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const amortizationBody = document.getElementById('amortizationBody');

// Payment mode handling
const paymentModeRadios = document.querySelectorAll('input[name="paymentMode"]');
const monthlyPaymentGroup = document.getElementById('monthlyPaymentGroup');
const customPaymentGroup = document.getElementById('customPaymentGroup');
const customPaymentDateGroup = document.getElementById('customPaymentDateGroup');
const monthlyPaymentInput = document.getElementById('payment');
const customPaymentAmountInput = document.getElementById('customPaymentAmount');
const customPaymentDateInput = document.getElementById('customPaymentDate');

// Handle payment mode switching
paymentModeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'monthly') {
            monthlyPaymentGroup.classList.remove('hidden');
            customPaymentGroup.classList.add('hidden');
            customPaymentDateGroup.classList.add('hidden');
            monthlyPaymentInput.required = true;
            customPaymentAmountInput.required = false;
            customPaymentDateInput.required = false;
        } else {
            monthlyPaymentGroup.classList.add('hidden');
            customPaymentGroup.classList.remove('hidden');
            customPaymentDateGroup.classList.remove('hidden');
            monthlyPaymentInput.required = false;
            customPaymentAmountInput.required = true;
            customPaymentDateInput.required = true;
        }
    });
});

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

    // Display custom payment information if available
    const customPaymentSection = document.getElementById('customPaymentSection');
    if (data.customPayment) {
        document.getElementById('customPaymentDateDisplay').textContent = data.customPayment.paymentDate;
        document.getElementById('daysUntilPayment').textContent = data.customPayment.daysUntilPayment + ' days';
        document.getElementById('interestUntilPayment').textContent = formatCurrency(data.customPayment.interestUntilPayment);
        document.getElementById('balanceAtPayment').textContent = formatCurrency(data.customPayment.balanceAtPayment);
        document.getElementById('balanceAfterPayment').textContent = formatCurrency(data.customPayment.balanceAfterPayment);
        customPaymentSection.classList.remove('hidden');
    } else {
        customPaymentSection.classList.add('hidden');
    }

    // Display date interest calculation if available
    const dateInterestSection = document.getElementById('dateInterestSection');
    if (data.dateInterest) {
        document.getElementById('dateRange').textContent = data.dateInterest.dateRange;
        document.getElementById('daysBetween').textContent = data.dateInterest.days;
        document.getElementById('dateInterestAmount').textContent = formatCurrency(data.dateInterest.interest);
        dateInterestSection.classList.remove('hidden');
    } else {
        dateInterestSection.classList.add('hidden');
    }

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
    const gracePeriod = document.getElementById('gracePeriod').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Get payment mode
    const paymentMode = document.querySelector('input[name="paymentMode"]:checked').value;
    let payment, customPaymentAmount, customPaymentDate;
    
    if (paymentMode === 'monthly') {
        payment = document.getElementById('payment').value;
        if (!payment) {
            showError('Please enter the monthly payment amount.');
            return;
        }
    } else {
        customPaymentAmount = document.getElementById('customPaymentAmount').value;
        customPaymentDate = document.getElementById('customPaymentDate').value;
        if (!customPaymentAmount || !customPaymentDate) {
            showError('Please enter both payment amount and payment date for custom payment mode.');
            return;
        }
        // For custom mode, use the custom amount as the payment
        payment = customPaymentAmount;
    }

    // Validate required fields
    if (!balance || !interestRate) {
        showError('Please fill in all required fields (Balance and Interest Rate).');
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

    // Validate date range if dates are provided
    // Note: This validation is intentionally duplicated on the server side for security
    // Client-side validation provides immediate feedback, server-side ensures data integrity
    if ((startDate && !endDate) || (!startDate && endDate)) {
        showError('Please provide both start and end dates for interest calculation.');
        return;
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        showError('End date must be after start date.');
        return;
    }

    // Prepare request data
    const requestData = {
        creditLimit: creditLimit || 0,
        balance: balance,
        interestRate: interestRate,
        payment: payment,
        gracePeriod: gracePeriod || 0,
        startDate: startDate || null,
        endDate: endDate || null,
        paymentMode: paymentMode,
        customPaymentDate: paymentMode === 'custom' ? customPaymentDate : null
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
