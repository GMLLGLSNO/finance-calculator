# CIMB Interest Calculator Endpoint

## Overview
The `/api/cimb` endpoint provides a simplified interest calculator that requires only:
- Loan amount
- Start date
- End date  
- Interest rate per month

This endpoint uses the same calculation method as the revolving credit calculator's date-based interest feature.

## API Endpoint

**URL:** `/api/cimb`  
**Method:** `POST`  
**Content-Type:** `application/json`

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `loanAmount` | number | Yes | The principal loan amount |
| `startDate` | string | Yes | Start date in ISO format (YYYY-MM-DD) |
| `endDate` | string | Yes | End date in ISO format (YYYY-MM-DD) |
| `interestRatePerMonth` | number | Yes | Interest rate per month as a percentage (e.g., 2.5 for 2.5%) |

## Example Request

```bash
curl -X POST http://localhost:3000/api/cimb \
  -H "Content-Type: application/json" \
  -d '{
    "loanAmount": 10000,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "interestRatePerMonth": 2.5
  }'
```

```javascript
// JavaScript example
const response = await fetch('/api/cimb', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    loanAmount: 10000,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    interestRatePerMonth: 2.5
  })
});

const data = await response.json();
console.log(data);
```

## Example Response

```json
{
  "loanAmount": 10000.00,
  "interestRatePerMonth": 2.50,
  "dateRange": "1/1/2024 to 1/31/2024",
  "startDate": "1/1/2024",
  "endDate": "1/31/2024",
  "days": 30,
  "interest": 246.58,
  "totalAmount": 10246.58
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `loanAmount` | number | The principal loan amount |
| `interestRatePerMonth` | number | The monthly interest rate percentage |
| `dateRange` | string | Human-readable date range |
| `startDate` | string | Start date in US format |
| `endDate` | string | End date in US format |
| `days` | number | Number of days between start and end date |
| `interest` | number | Interest amount calculated for the period |
| `totalAmount` | number | Loan amount + interest |

## Calculation Method

The CIMB endpoint uses the same calculation as the revolving credit calculator:

1. Convert monthly rate to annual rate: `annualRate = monthlyRate × 12`
2. Convert annual rate to daily rate: `dailyRate = annualRate / 100 / 365`
3. Calculate days between dates: `days = floor((endDate - startDate) / (1000 × 60 × 60 × 24))`
4. Calculate interest: `interest = loanAmount × dailyRate × days`

This follows the industry-standard 365-day convention for converting APR to daily rate.

## Error Responses

### 400 Bad Request

**Missing Parameters:**
```json
{
  "error": "Missing required parameters: loanAmount, startDate, endDate, interestRatePerMonth"
}
```

**Invalid Values:**
```json
{
  "error": "Values cannot be negative"
}
```

**Invalid Date Range:**
```json
{
  "error": "End date must be after start date"
}
```

### 405 Method Not Allowed

```json
{
  "error": "Method not allowed"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "..."
}
```

## Example Use Cases

### Calculate 1 month interest on RM 50,000 at 1.5% per month
```json
{
  "loanAmount": 50000,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "interestRatePerMonth": 1.5
}
```
Result: RM 616.44 interest

### Calculate 90-day interest on RM 100,000 at 2% per month
```json
{
  "loanAmount": 100000,
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "interestRatePerMonth": 2
}
```
Result: RM 5,917.81 interest

## Testing

To test the endpoint locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:3000/api/cimb \
  -H "Content-Type: application/json" \
  -d '{"loanAmount":1000,"startDate":"2024-01-01","endDate":"2024-01-31","interestRatePerMonth":2.5}'
```
