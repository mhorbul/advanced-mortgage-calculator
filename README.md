# Mortgage Payoff Strategy Calculator

A comprehensive React application that compares different mortgage payoff strategies with inflation adjustment to help you make informed financial decisions.

## 🎥 Inspiration

This application was inspired by the mortgage payoff strategies discussed in [this YouTube video](https://www.youtube.com/watch?v=AqOplfWlYY8). The video explores various approaches to paying off mortgages faster, including using personal lines of credit and comparing different strategies. This calculator brings those concepts to life with interactive calculations and visual comparisons.

## 🏠 Features

### Four Mortgage Payoff Strategies
1. **Traditional Method** - Follows standard amortization schedule
2. **Extra Principal Method** - Uses leftover income for additional principal payments
3. **Line of Credit Strategy** - Uses LOC to accelerate mortgage payoff
4. **Investment Method** - Invests leftover income while paying mortgage normally

### Key Capabilities
- **Inflation Adjustment** - Shows real (inflation-adjusted) costs and gains
- **Tax Benefits** - Accounts for mortgage interest tax deductions
- **Visual Comparisons** - Interactive charts showing balance over time
- **Best Strategy Detection** - Automatically identifies the optimal approach
- **Adjustable Parameters** - All inputs are customizable

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd morgage-calculator

# Install dependencies
yarn install
# or
npm install

# Start development server
yarn start
# or
npm start
```

The application will open at `http://localhost:3000`

## 📊 How to Use

### Input Parameters
- **Mortgage Balance** - Current mortgage amount
- **Mortgage Rate** - Annual interest rate (%)
- **Mortgage Term** - Loan duration in years
- **Monthly Income** - Your monthly income
- **Monthly Expenses** - Your monthly expenses
- **Line of Credit Limit** - Available LOC amount
- **LOC Rate** - Annual LOC interest rate (%)
- **Investment Return** - Expected annual investment return (%)
- **Tax Rate** - Your marginal tax rate (%)
- **Inflation Rate** - Expected annual inflation rate (%)

### Understanding the Results

Each strategy shows:
- **Nominal Values** - Actual dollar amounts
- **Real Values** - Inflation-adjusted purchasing power
- **Payoff Time** - How long to pay off the mortgage
- **Total Interest** - Interest paid over the loan term
- **Tax Savings** - Benefits from mortgage interest deduction
- **Net Cost/Position** - Final financial outcome

## 🏗️ Building for Production

### Create Static Build
```bash
yarn build
# or
npm run build
```

This creates a `build` folder with optimized static files ready for deployment.

### Deploy Options
- **Nginx** - Point nginx to the `build` folder
- **Apache** - Use the `build` folder as document root
- **GitHub Pages** - Use `yarn add --dev gh-pages && yarn run deploy`
- **Netlify/Vercel** - Deploy the `build` folder directly

## 🧮 Calculation Methodology

### Traditional Method
- Standard amortization schedule
- Fixed monthly payments
- Interest calculated on remaining balance

### Extra Principal Method
- Regular payments + leftover income toward principal
- Reduces total interest and payoff time
- Maintains tax benefits on mortgage interest

### Line of Credit Strategy
- Uses LOC to make lump-sum payments to mortgage
- Pays down LOC with leftover income
- Combines mortgage and LOC interest costs

### Investment Method
- Regular mortgage payments
- Invests leftover income at specified return rate
- Compares investment gains vs. mortgage interest costs

### Inflation Adjustment
All calculations include real (inflation-adjusted) values using:
```
Real Value = Nominal Value / (1 + inflation_rate)^months
```

## 🛠️ Technology Stack

- **React 18** - Frontend framework
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Create React App** - Build tooling

## 📁 Project Structure

```
morgage-calculator/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── MortgageCalculator.jsx
│   ├── App.js
│   ├── index.js
│   └── index.css
├── build/                 # Production build (generated)
├── package.json
├── .gitignore
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This calculator is for educational and planning purposes only. It does not constitute financial advice. Always consult with a qualified financial advisor before making major financial decisions.

## 🐛 Issues & Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🔮 Future Enhancements

- Additional payoff strategies
- More detailed tax calculations
- Export functionality for results
- Mobile app version
- Integration with real-time mortgage rates

---

**Happy calculating!** 🏡💰
