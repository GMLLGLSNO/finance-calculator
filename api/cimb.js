/**
 * Vercel Serverless API for CIMB Interest Calculator
 * Calculates interest for a loan amount between two dates with monthly interest rate
 */

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { loanAmount, startDate, endDate, interestRatePerMonth } = req.body;

    // Validate inputs
    if (loanAmount === undefined || loanAmount === null || 
        interestRatePerMonth === undefined || interestRatePerMonth === null ||
        startDate === undefined || startDate === null || !startDate ||
        endDate === undefined || endDate === null || !endDate) {
      res.status(400).json({ 
        error: 'Missing required parameters: loanAmount, startDate, endDate, interestRatePerMonth' 
      });
      return;
    }

    const amount = parseFloat(loanAmount);
    const monthlyRate = parseFloat(interestRatePerMonth);

    // Validate numeric values
    if (isNaN(amount) || isNaN(monthlyRate)) {
      res.status(400).json({ error: 'Invalid numeric values provided' });
      return;
    }

    if (amount < 0 || monthlyRate < 0) {
      res.status(400).json({ error: 'Values cannot be negative' });
      return;
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    if (end <= start) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }

    // Calculate days between dates
    // Uses simple date arithmetic for date-only inputs (no time components)
    const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    
    // Calculate daily interest rate from monthly rate
    // Convert monthly percentage rate to daily rate using standard 365-day convention
    // This matches the revolving credit calculation approach
    const annualRate = monthlyRate * 12;
    const dailyRate = annualRate / 100 / 365;
    
    // Calculate interest for the period
    const periodInterest = amount * dailyRate * daysDiff;
    
    // Format date range
    const dateRange = `${start.toLocaleDateString('en-US')} to ${end.toLocaleDateString('en-US')}`;
    
    // Return results
    res.status(200).json({
      loanAmount: Number(amount.toFixed(2)),
      interestRatePerMonth: Number(monthlyRate.toFixed(2)),
      dateRange: dateRange,
      startDate: start.toLocaleDateString('en-US'),
      endDate: end.toLocaleDateString('en-US'),
      days: daysDiff,
      interest: Number(periodInterest.toFixed(2)),
      totalAmount: Number((amount + periodInterest).toFixed(2))
    });

  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
