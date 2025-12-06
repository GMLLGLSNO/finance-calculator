# Revolving Credit Calculator 💳

A web-based revolving credit calculator that helps you understand your credit card payments, interest charges, and payoff timeline. Built with a serverless architecture using Vercel.

## Features

- **Interactive Form**: Input your credit limit, balance, interest rate, payment amount, and grace period
- **Detailed Results**:
  - Monthly interest calculation
  - Recommended minimum payment
  - New balance after payment
  - Time to pay off debt
  - Total interest to be paid
- **Amortization Schedule**: Month-by-month breakdown showing payment, principal, interest, and remaining balance
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Serverless Backend**: Fast and scalable API powered by Vercel Functions

## How It Works

1. Enter your current credit card information:
   - **Credit Limit** (optional): Your total available credit
   - **Current Balance** (required): How much you currently owe
   - **Annual Interest Rate** (required): Your APR percentage
   - **Monthly Payment** (required): How much you plan to pay each month
   - **Grace Period** (optional): Number of months with no interest (e.g., 0% intro APR)

2. Click "Calculate" to see your results

3. Review the results:
   - See how much interest you'll pay each month
   - Compare your payment to the recommended minimum
   - Understand how long it will take to pay off your balance
   - Explore the detailed amortization schedule

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js (Vercel Serverless Functions)
- **Deployment**: Vercel
- **API**: RESTful API endpoint at `/api/calculate`

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/GMLLGLSNO/finance-calculator.git
   cd finance-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Deployment

Deploy to Vercel with one click or use the Vercel CLI:

```bash
npm run deploy
```

## API Documentation

### POST /api/calculate

Calculate revolving credit payment schedule.

**Request Body:**
```json
{
  "creditLimit": 5000,      // Optional: Total credit limit
  "balance": 3000,          // Required: Current balance
  "interestRate": 18.99,    // Required: Annual interest rate (%)
  "payment": 150,           // Required: Monthly payment amount
  "gracePeriod": 0          // Optional: Months with no interest
}
```

**Response:**
```json
{
  "monthlyInterest": 47.48,
  "minimumPayment": 107.48,
  "newBalance": 2897.48,
  "monthsToPayOff": 24,
  "totalInterestPaid": 600.52,
  "amortizationSchedule": [
    {
      "month": 1,
      "payment": 150.00,
      "principal": 102.52,
      "interest": 47.48,
      "remainingBalance": 2897.48
    },
    // ... more months
  ]
}
```

## Tips for Users

💡 **Paying more than the minimum saves money!** The more you pay each month, the less interest you'll accumulate and the faster you'll be debt-free.

💡 **Watch out for low payments**: If your payment is less than or equal to the monthly interest, your balance will never decrease.

💡 **Take advantage of grace periods**: 0% APR promotional periods can help you pay down principal faster.

## License

MIT