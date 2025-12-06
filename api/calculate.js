/**
 * Vercel Serverless API for Revolving Credit Calculator
 * Calculates monthly interest, minimum payment, new balance, payoff time, and amortization schedule
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
    const { creditLimit, balance, interestRate, payment, gracePeriod } = req.body;

    // Validate inputs
    if (balance === undefined || balance === null || interestRate === undefined || interestRate === null || payment === undefined || payment === null) {
      res.status(400).json({ error: 'Missing required parameters: balance, interestRate, payment' });
      return;
    }

    const currentBalance = parseFloat(balance);
    const annualRate = parseFloat(interestRate);
    const monthlyPayment = parseFloat(payment);
    const grace = parseInt(gracePeriod) || 0;
    const limit = parseFloat(creditLimit) || 0;

    // Validate numeric values
    if (isNaN(currentBalance) || isNaN(annualRate) || isNaN(monthlyPayment)) {
      res.status(400).json({ error: 'Invalid numeric values provided' });
      return;
    }

    if (currentBalance < 0 || annualRate < 0 || monthlyPayment < 0) {
      res.status(400).json({ error: 'Values cannot be negative' });
      return;
    }

    if (currentBalance === 0) {
      res.status(200).json({
        monthlyInterest: 0,
        minimumPayment: 0,
        newBalance: 0,
        monthsToPayOff: 0,
        totalInterestPaid: 0,
        amortizationSchedule: []
      });
      return;
    }

    // Calculate monthly interest rate
    const monthlyRate = annualRate / 100 / 12;

    // Calculate monthly interest for current balance
    const monthlyInterest = currentBalance * monthlyRate;

    // Calculate minimum payment (typically 2% of balance or $25, whichever is greater, plus interest)
    const minimumPayment = Math.max(currentBalance * 0.02, 25) + monthlyInterest;

    // Calculate new balance after one payment
    const interestCharged = grace > 0 ? 0 : monthlyInterest;
    const newBalance = Math.max(0, currentBalance + interestCharged - monthlyPayment);

    // Calculate amortization schedule and months to pay off
    const amortizationSchedule = [];
    let remainingBalance = currentBalance;
    let month = 0;
    let totalInterestPaid = 0;
    const maxMonths = 600; // Safety limit (50 years)

    // Check if payment is sufficient to pay off debt
    if (monthlyPayment <= monthlyInterest && annualRate > 0) {
      res.status(400).json({
        error: 'Payment amount is too low to pay off the balance. It must be greater than the monthly interest.',
        monthlyInterest: parseFloat(monthlyInterest.toFixed(2)),
        minimumPayment: parseFloat(minimumPayment.toFixed(2))
      });
      return;
    }

    while (remainingBalance > 0.01 && month < maxMonths) {
      month++;
      
      // Apply grace period (no interest charged during grace period)
      const interestForMonth = month <= grace ? 0 : remainingBalance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestForMonth, remainingBalance);
      const actualPayment = principalPayment + interestForMonth;
      
      totalInterestPaid += interestForMonth;
      remainingBalance = remainingBalance - principalPayment;

      // Ensure remaining balance doesn't go negative
      if (remainingBalance < 0) {
        remainingBalance = 0;
      }

      amortizationSchedule.push({
        month: month,
        payment: parseFloat(actualPayment.toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestForMonth.toFixed(2)),
        remainingBalance: parseFloat(remainingBalance.toFixed(2))
      });

      // Break if balance is paid off
      if (remainingBalance <= 0.01) {
        break;
      }
    }

    const monthsToPayOff = month;

    // Return results
    res.status(200).json({
      monthlyInterest: parseFloat(monthlyInterest.toFixed(2)),
      minimumPayment: parseFloat(minimumPayment.toFixed(2)),
      newBalance: parseFloat(newBalance.toFixed(2)),
      monthsToPayOff: monthsToPayOff,
      totalInterestPaid: parseFloat(totalInterestPaid.toFixed(2)),
      amortizationSchedule: amortizationSchedule
    });

  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
