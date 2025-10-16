import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function MortgageCalculator() {
  const [inputs, setInputs] = useState({
    mortgageBalance: 240000,
    mortgageRate: 6.5,
    mortgageYears: 30,
    monthlyIncome: 10000,
    monthlyExpenses: 8000,
    locLimit: 10000,
    locRate: 10,
    taxRate: 22,
    investmentReturn: 8,
    maintenanceRate: 1.5,
    homeAppreciationRate: 3.5,
    rentalDiscountPercent: 10,
    enableRentalComparison: false
  });

  const handleInputChange = (field, value) => {
    // Handle empty string as empty string, not 0
    if (value === '') {
      setInputs(prev => ({ ...prev, [field]: '' }));
    } else {
      const numValue = parseFloat(value);
      setInputs(prev => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
    }
  };

  const handleCheckboxChange = (field, checked) => {
    setInputs(prev => ({ ...prev, [field]: checked }));
  };

  const calculations = useMemo(() => {
    const {
      mortgageBalance,
      mortgageRate,
      mortgageYears,
      monthlyIncome,
      monthlyExpenses,
      locLimit,
      locRate,
      taxRate,
      investmentReturn,
      maintenanceRate,
      homeAppreciationRate,
      rentalDiscountPercent,
      enableRentalComparison
    } = inputs;

    // Convert empty strings to 0 for calculations
    const safeMortgageBalance = mortgageBalance === '' ? 0 : mortgageBalance;
    const safeMortgageRate = mortgageRate === '' ? 0 : mortgageRate;
    const safeMortgageYears = mortgageYears === '' ? 0 : mortgageYears;
    const safeMonthlyIncome = monthlyIncome === '' ? 0 : monthlyIncome;
    const safeMonthlyExpenses = monthlyExpenses === '' ? 0 : monthlyExpenses;
    const safeMaintenanceRate = maintenanceRate === '' ? 0 : maintenanceRate;
    const safeLocLimit = locLimit === '' ? 0 : locLimit;
    const safeLocRate = locRate === '' ? 0 : locRate;
    const safeInvestmentReturn = investmentReturn === '' ? 0 : investmentReturn;
    const safeTaxRate = taxRate === '' ? 0 : taxRate;
    const safeHomeAppreciationRate = homeAppreciationRate === '' ? 0 : homeAppreciationRate;
    const safeRentalDiscountPercent = rentalDiscountPercent === '' ? 0 : rentalDiscountPercent;

    // Calculate home value from mortgage balance (80% LTV)
    const homeValue = safeMortgageBalance / 0.8;

    const mortgageMonthlyRate = safeMortgageRate / 100 / 12;
    const locMonthlyRate = safeLocRate / 100 / 12;
    const investmentMonthlyRate = safeInvestmentReturn / 100 / 12;
    const totalMonths = safeMortgageYears * 12;

    // Calculate traditional mortgage payment
    const mortgagePayment = safeMortgageBalance *
      (mortgageMonthlyRate * Math.pow(1 + mortgageMonthlyRate, totalMonths)) /
      (Math.pow(1 + mortgageMonthlyRate, totalMonths) - 1);

    // Calculate monthly maintenance cost
    const monthlyMaintenanceCost = (homeValue * safeMaintenanceRate / 100) / 12;

    // Calculate total monthly costs
    const totalMonthlyCosts = safeMonthlyExpenses + mortgagePayment + monthlyMaintenanceCost;

    // Calculate leftover after all costs
    const leftover = safeMonthlyIncome - totalMonthlyCosts;

    // Validation: warn if total costs exceed income
    const costExceedsIncome = totalMonthlyCosts > safeMonthlyIncome;

    // Calculate rental-specific values when rental comparison is enabled
    let rentalPayment = 0;
    let mortgageRentSavings = 0;
    let rentalInvestmentAmount = 0;

    if (enableRentalComparison) {
      rentalPayment = mortgagePayment * (1 - safeRentalDiscountPercent / 100);
      mortgageRentSavings = mortgagePayment - rentalPayment;
      rentalInvestmentAmount = leftover + mortgageRentSavings;
    }

    // Function to calculate investment balance with compound interest (same as investment strategy)
    const calculateInvestmentBalance = (monthlyContribution, months) => {
      let balance = 0;
      for (let i = 0; i < months; i++) {
        balance = balance * (1 + investmentMonthlyRate) + monthlyContribution;
      }
      return balance;
    };

    // Calculate net rent cost for each strategy (opportunity cost of not renting)
    let netRentCost = 0;
    let netRentCostReal = 0;
    let finalHomeValue = homeValue;
    let finalHomeValueReal = homeValue;

    if (enableRentalComparison) {
      // Calculate what you would have paid in rent over the mortgage term
      const rentalCost = mortgagePayment * (1 - safeRentalDiscountPercent / 100);
      const totalRentPaid = rentalCost * totalMonths;

      // Calculate home value at end of mortgage term
      finalHomeValue = homeValue * Math.pow(1 + safeHomeAppreciationRate / 100 / 12, totalMonths);
      finalHomeValueReal = finalHomeValue;

      // Net rent cost is the difference between what you paid in mortgage vs rent
      netRentCost = (mortgagePayment * totalMonths) - totalRentPaid;
      netRentCostReal = netRentCost;
    }

    // Traditional Method (Scheduled Payments Only)
    let tradBalance = safeMortgageBalance;
    let tradTotalInterest = 0;
    let tradTotalTaxSavings = 0;
    let tradTotalPayments = 0;
    let tradTotalMaintenance = 0;
    let tradMonths = 0;
    let tradCurrentHomeValue = homeValue;
    const tradData = [];

    while (tradBalance > 0 && tradMonths < totalMonths * 2) {
      const interest = tradBalance * mortgageMonthlyRate;
      const principal = Math.min(mortgagePayment - interest, tradBalance);
      const taxSavings = (interest * safeTaxRate) / 100;

      // Calculate maintenance costs
      const monthlyMaintenance = tradCurrentHomeValue * (safeMaintenanceRate / 100 / 12);
      tradTotalMaintenance += monthlyMaintenance;

      tradTotalInterest += interest;
      tradTotalTaxSavings += taxSavings;
      tradTotalPayments += mortgagePayment;
      tradBalance -= principal;

      // Home appreciation
      tradCurrentHomeValue *= (1 + safeHomeAppreciationRate / 100 / 12);

      tradMonths++;

      if (tradMonths % 12 === 0) {
        tradData.push({
          year: tradMonths / 12,
          traditional: Math.max(0, tradBalance),
          extraPayment: 0,
          accelerated: 0,
          investment: 0
        });
      }
    }


    // Extra Payment Method (Leftover goes to principal)
    let extraBalance = mortgageBalance;
    let extraTotalInterest = 0;
    let extraTotalTaxSavings = 0;
    let extraTotalPayments = 0;
    let extraTotalMaintenance = 0;
    let extraMonths = 0;
    let extraCurrentHomeValue = homeValue;
    const extraData = [];

    while (extraBalance > 0 && extraMonths < totalMonths * 2) {
      const interest = extraBalance * mortgageMonthlyRate;
      const taxSavings = (interest * safeTaxRate) / 100;

      // Calculate maintenance costs
      const monthlyMaintenance = extraCurrentHomeValue * (maintenanceRate / 100 / 12);
      extraTotalMaintenance += monthlyMaintenance;

      extraTotalInterest += interest;
      extraTotalTaxSavings += taxSavings;

      // Apply regular payment plus leftover toward principal
      const totalPayment = mortgagePayment + leftover;
      extraTotalPayments += totalPayment;
      const principal = Math.min(totalPayment - interest, extraBalance);
      extraBalance -= principal;

      // Home appreciation
      extraCurrentHomeValue *= (1 + homeAppreciationRate / 100 / 12);

      extraMonths++;

      if (extraMonths % 12 === 0) {
        extraData.push({
          year: extraMonths / 12,
          extraPayment: Math.max(0, extraBalance)
        });
      }
    }


    // Line of Credit Accelerated Method
    let accBalance = safeMortgageBalance;
    let locBalance = 0;
    let accTotalInterest = 0;
    let accTotalLocInterest = 0;
    let accTotalTaxSavings = 0;
    let accTotalPayments = 0;
    let accTotalMaintenance = 0;
    let accMonths = 0;
    let accCurrentHomeValue = homeValue;

    const accData = [];

    while (accBalance > 0 && accMonths < totalMonths * 2) {
      // Calculate mortgage interest and payment
      const mortgageInterest = accBalance * mortgageMonthlyRate;
      const taxSavings = (mortgageInterest * safeTaxRate) / 100;
      accTotalInterest += mortgageInterest;
      accTotalTaxSavings += taxSavings;

      // Calculate maintenance costs
      const monthlyMaintenance = accCurrentHomeValue * (safeMaintenanceRate / 100 / 12);
      accTotalMaintenance += monthlyMaintenance;

      // Apply regular mortgage payment
      const principalPayment = mortgagePayment - mortgageInterest;
      accBalance -= principalPayment;
      accTotalPayments += mortgagePayment;

      // If we have leftover money, use it to pay down LOC
      if (leftover > 0) {
        // If no LOC balance, take a new LOC chunk
        if (locBalance === 0 && accBalance > 0) {
          const chunkSize = Math.min(safeLocLimit, accBalance);
          locBalance = chunkSize;
          accBalance -= chunkSize;
        }

        // Pay down LOC with leftover money
        if (locBalance > 0) {
          const locPayment = Math.min(leftover, locBalance);
          locBalance -= locPayment;
          accTotalPayments += locPayment;
        }
      }

      // Calculate LOC interest on remaining balance (accrues monthly)
      if (locBalance > 0) {
        const locInterest = locBalance * locMonthlyRate;
        accTotalLocInterest += locInterest;
        locBalance += locInterest; // Interest gets added to LOC balance
      }

      // Home appreciation
      accCurrentHomeValue *= (1 + safeHomeAppreciationRate / 100 / 12);

      accMonths++;

      if (accMonths % 12 === 0) {
        accData.push({
          year: accMonths / 12,
          accelerated: Math.max(0, accBalance + locBalance)
        });
      }
    }


    // Investment Method (Pay mortgage normally, invest leftover)
    let invBalance = safeMortgageBalance;
    let invTotalInterest = 0;
    let invTotalTaxSavings = 0;
    let invTotalPayments = 0;
    let invTotalMaintenance = 0;
    let invMonths = 0;
    let investmentBalance = 0;
    let invCurrentHomeValue = homeValue;
    const invData = [];

    while (invBalance > 0 && invMonths < totalMonths * 2) {
      const interest = invBalance * mortgageMonthlyRate;
      const principal = Math.min(mortgagePayment - interest, invBalance);
      const taxSavings = (interest * safeTaxRate) / 100;

      // Calculate maintenance costs
      const monthlyMaintenance = invCurrentHomeValue * (maintenanceRate / 100 / 12);
      invTotalMaintenance += monthlyMaintenance;

      invTotalInterest += interest;
      invTotalTaxSavings += taxSavings;
      invTotalPayments += mortgagePayment;
      invBalance -= principal;

      // Invest leftover and apply returns
      investmentBalance = investmentBalance * (1 + investmentMonthlyRate) + leftover;

      // Home appreciation
      invCurrentHomeValue *= (1 + homeAppreciationRate / 100 / 12);

      invMonths++;

      if (invMonths % 12 === 0) {
        invData.push({
          year: invMonths / 12,
          investment: Math.max(0, invBalance)
        });
      }
    }

    const finalInvestmentBalance = investmentBalance;


    // Rental Strategy (Rent instead of buying) - Only if enabled
    let rental = null;
    if (enableRentalComparison) {
      const monthlyMaintenanceRate = maintenanceRate / 100 / 12;
      const homeAppreciationMonthlyRate = homeAppreciationRate / 100 / 12;

      // Calculate rental cost (mortgage payment minus discount)
      const rentalCost = mortgagePayment * (1 - rentalDiscountPercent / 100);

      let rentalTotalRent = 0;
      let rentalTotalInvestment = 0;
      let rentalMonths = 0;
      let rentalInvestmentBalance = 0;
      let currentHomeValue = homeValue;
      const rentalData = [];

      // Calculate for the mortgage term period only
      while (rentalMonths < totalMonths) {
        // Pay rent
        rentalTotalRent += rentalCost;

        // Invest the difference between mortgage payment and rent PLUS leftover money
        // When renting, you have leftover money available for investment
        const investmentAmount = (mortgagePayment - rentalCost) + leftover;
        rentalInvestmentBalance = rentalInvestmentBalance * (1 + investmentMonthlyRate) + investmentAmount;
        rentalTotalInvestment += investmentAmount;

        // Home appreciation (for comparison)
        currentHomeValue *= (1 + homeAppreciationMonthlyRate);

        rentalMonths++;

        if (rentalMonths % 12 === 0) {
          rentalData.push({
            year: rentalMonths / 12,
            rental: 0 // No mortgage balance for rental
          });
        }
      }

      // Net position: investment gains + home appreciation - rent paid
      // Note: We don't subtract maintenance because renter doesn't pay maintenance
      const rentalNetPosition = rentalInvestmentBalance + currentHomeValue - rentalTotalRent;

      // For comparison purposes, we want just investment gain minus rent cost (no home appreciation)
      const rentalComparisonValue = rentalInvestmentBalance - rentalTotalRent;

      rental = {
        months: rentalMonths,
        years: (rentalMonths / 12).toFixed(1),
        totalRent: rentalTotalRent,
        totalInvestment: rentalTotalInvestment,
        investmentBalance: rentalInvestmentBalance,
        homeValue: currentHomeValue,
        netPosition: rentalNetPosition,
        comparisonValue: rentalComparisonValue, // For chart comparison
        monthlyRent: rentalCost
      };
    }

    // Merge data arrays
    const maxYears = Math.max(tradData.length, extraData.length, accData.length, invData.length);
    const chartData = [];
    for (let i = 0; i < maxYears; i++) {
      chartData.push({
        year: i + 1,
        traditional: tradData[i]?.traditional || 0,
        extraPayment: extraData[i]?.extraPayment || 0,
        accelerated: accData[i]?.accelerated || 0,
        investment: invData[i]?.investment || 0,
        rental: enableRentalComparison ? 0 : undefined
      });
    }

    return {
      traditional: {
        months: tradMonths,
        years: (tradMonths / 12).toFixed(1),
        totalInterest: tradTotalInterest,
        totalTaxSavings: tradTotalTaxSavings,
        totalMaintenance: tradTotalMaintenance,
        netInterest: enableRentalComparison ?
          tradTotalInterest - tradTotalTaxSavings + tradTotalMaintenance :
          tradTotalInterest - tradTotalTaxSavings,
        monthlyPayment: mortgagePayment,
        netRentCost: netRentCost,
        finalHomeValue: homeValue * Math.pow(1 + homeAppreciationRate / 100 / 12, tradMonths), // Home value at traditional payoff time
        // Rental subsection data
        rental: enableRentalComparison ? {
          monthlyPayment: rentalPayment,
          totalCost: rentalPayment * tradMonths,
          investmentGain: calculateInvestmentBalance(rentalInvestmentAmount, tradMonths), // Traditional: compound interest for tradMonths
          total: calculateInvestmentBalance(rentalInvestmentAmount, tradMonths) - (rentalPayment * tradMonths) // Investment Gain - Rental Cost
        } : null
      },
      extraPayment: {
        months: extraMonths,
        years: (extraMonths / 12).toFixed(1),
        totalInterest: extraTotalInterest,
        totalTaxSavings: extraTotalTaxSavings,
        totalMaintenance: extraTotalMaintenance,
        netInterest: enableRentalComparison ?
          extraTotalInterest - extraTotalTaxSavings + extraTotalMaintenance :
          extraTotalInterest - extraTotalTaxSavings,
        monthlyPayment: mortgagePayment + leftover,
        netRentCost: netRentCost,
        finalHomeValue: homeValue * Math.pow(1 + homeAppreciationRate / 100 / 12, extraMonths), // Home value at extra payment payoff time
        // Rental subsection data
        rental: enableRentalComparison ? {
          monthlyPayment: rentalPayment,
          totalCost: rentalPayment * extraMonths,
          investmentGain: calculateInvestmentBalance(rentalInvestmentAmount, extraMonths), // Extra Payment: compound interest for extraMonths
          total: calculateInvestmentBalance(rentalInvestmentAmount, extraMonths) - (rentalPayment * extraMonths) // Investment Gain - Rental Cost
        } : null
      },
      accelerated: {
        months: accMonths,
        years: (accMonths / 12).toFixed(1),
        totalInterest: accTotalInterest + accTotalLocInterest,
        mortgageInterest: accTotalInterest,
        locInterest: accTotalLocInterest,
        totalTaxSavings: accTotalTaxSavings,
        totalMaintenance: accTotalMaintenance,
        netInterest: enableRentalComparison ?
          accTotalInterest + accTotalLocInterest - accTotalTaxSavings + accTotalMaintenance :
          accTotalInterest + accTotalLocInterest - accTotalTaxSavings,
        netRentCost: netRentCost,
        finalHomeValue: homeValue * Math.pow(1 + homeAppreciationRate / 100 / 12, accMonths), // Home value at LOC strategy payoff time
        // Rental subsection data
        rental: enableRentalComparison ? {
          monthlyPayment: rentalPayment,
          totalCost: rentalPayment * accMonths,
          investmentGain: calculateInvestmentBalance(rentalInvestmentAmount, accMonths), // LOC Strategy: compound interest for accMonths
          total: calculateInvestmentBalance(rentalInvestmentAmount, accMonths) - (rentalPayment * accMonths) // Investment Gain - Rental Cost
        } : null
      },
      investment: {
        months: invMonths,
        years: (invMonths / 12).toFixed(1),
        totalInterest: invTotalInterest,
        totalTaxSavings: invTotalTaxSavings,
        totalMaintenance: invTotalMaintenance,
        netInterest: enableRentalComparison ?
          invTotalInterest - invTotalTaxSavings + invTotalMaintenance :
          invTotalInterest - invTotalTaxSavings,
        monthlyPayment: mortgagePayment,
        investmentBalance: finalInvestmentBalance,
        netPosition: enableRentalComparison ?
          finalInvestmentBalance - (invTotalInterest - invTotalTaxSavings + invTotalMaintenance) :
          finalInvestmentBalance - (invTotalInterest - invTotalTaxSavings),
        netRentCost: netRentCost,
        finalHomeValue: homeValue * Math.pow(1 + homeAppreciationRate / 100 / 12, invMonths), // Home value at investment strategy payoff time
        // Rental subsection data
        rental: enableRentalComparison ? {
          monthlyPayment: rentalPayment,
          totalCost: rentalPayment * invMonths,
          investmentGain: calculateInvestmentBalance(rentalInvestmentAmount, invMonths), // Investment Strategy: compound interest for invMonths
          total: calculateInvestmentBalance(rentalInvestmentAmount, invMonths) - (rentalPayment * invMonths) // Investment Gain - Rental Cost
        } : null
      },
      rental,
      chartData,
      leftover,
      costExceedsIncome
    };
  }, [inputs]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getBestStrategy = () => {
    const strategies = [
      { name: 'Traditional', value: -calculations.traditional.netInterest, netWorth: -calculations.traditional.netInterest },
      { name: 'Extra Principal', value: -calculations.extraPayment.netInterest, netWorth: -calculations.extraPayment.netInterest },
      { name: 'LOC Strategy', value: -calculations.accelerated.netInterest, netWorth: -calculations.accelerated.netInterest },
      { name: 'Invest & Pay', value: calculations.investment.netPosition, netWorth: calculations.investment.netPosition }
    ];

    // Note: Rental strategy is not included in "Best Strategy" comparison
    // It's only shown in the comparison chart for reference

    return strategies.reduce((best, current) =>
      current.netWorth > best.netWorth ? current : best
    );
  };

  const best = getBestStrategy();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mortgage Payoff Strategy Comparison</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Inputs */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Input Parameters</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Balance</label>
              <input
                type="number"
                value={inputs.mortgageBalance}
                onChange={(e) => handleInputChange('mortgageBalance', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {calculations.costExceedsIncome && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  <strong>Warning:</strong> Mortgage amount too high. Total costs exceed income.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.mortgageRate}
                onChange={(e) => handleInputChange('mortgageRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {calculations.costExceedsIncome && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  <strong>Warning:</strong> Mortgage rate too high. Total costs exceed income.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Term (years)</label>
              <input
                type="number"
                value={inputs.mortgageYears}
                onChange={(e) => handleInputChange('mortgageYears', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {calculations.costExceedsIncome && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  <strong>Warning:</strong> Mortgage term too short. Total costs exceed income.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income</label>
              <input
                type="number"
                value={inputs.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Expenses</label>
              <p className="text-xs text-gray-500 mb-1">(excluding mortgage payment and maintenance)</p>
              <input
                type="number"
                value={inputs.monthlyExpenses}
                onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {calculations.costExceedsIncome && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  <strong>Warning:</strong> Total monthly costs exceed income. Expenses + Mortgage Payment + Maintenance should not be greater than income.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Rate (% of home value/year)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.maintenanceRate}
                onChange={(e) => handleInputChange('maintenanceRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">For owned properties only</p>
              {calculations.costExceedsIncome && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  <strong>Warning:</strong> Maintenance rate too high. Total costs exceed income.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line of Credit Limit</label>
              <input
                type="number"
                value={inputs.locLimit}
                onChange={(e) => handleInputChange('locLimit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LOC Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.locRate}
                onChange={(e) => handleInputChange('locRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investment Return (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.investmentReturn}
                onChange={(e) => handleInputChange('investmentReturn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.taxRate}
                onChange={(e) => handleInputChange('taxRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>


            <div className="pt-2 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Rental Comparison</h3>
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="enableRentalComparison"
                  checked={inputs.enableRentalComparison}
                  onChange={(e) => handleCheckboxChange('enableRentalComparison', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableRentalComparison" className="ml-2 text-sm font-medium text-gray-700">
                  Enable Rental Comparison
                </label>
              </div>
              {inputs.enableRentalComparison && (
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Calculated Home Value (80% LTV): <span className="text-blue-600">{formatCurrency(inputs.mortgageBalance / 0.8)}</span>
                </div>
              )}
            </div>


            {inputs.enableRentalComparison && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Appreciation Rate (%/year)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.homeAppreciationRate}
                    onChange={(e) => handleInputChange('homeAppreciationRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rental Discount (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.rentalDiscountPercent}
                    onChange={(e) => handleInputChange('rentalDiscountPercent', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Rent cost as % less than mortgage payment</p>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700">
                Monthly Leftover (after all costs): <span className="text-green-600">{formatCurrency(calculations.leftover)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Best Strategy Banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Best Strategy: {best.name}</h2>
            <div className="text-lg">
              {best.netWorth >= 0 ? 'Net Position' : 'Net Cost'}: <span className="font-bold text-3xl">{formatCurrency(best.netWorth >= 0 ? best.netWorth : Math.abs(best.netWorth))}</span>
            </div>
            <div className="text-sm mt-2 text-green-100">
              {best.name === 'Invest & Pay'
                ? 'Investment gains exceed interest costs!'
                : 'Minimizes total interest paid'}
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Traditional Method */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Traditional</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payoff Time:</span>
                  <span className="font-semibold">{calculations.traditional.years} yrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.traditional.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.traditional.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Savings:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(calculations.traditional.totalTaxSavings)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Maintenance:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(calculations.traditional.totalMaintenance)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Net Cost:</span>
                  <span className="font-bold text-red-700">{formatCurrency(calculations.traditional.netInterest)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Value:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(calculations.traditional.finalHomeValue)}</span>
                    </div>

                    {/* Rental Subsection */}
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Rental</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Payment:</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(calculations.traditional.rental.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(calculations.traditional.rental.totalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Investment Gain:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(calculations.traditional.rental.investmentGain)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-gray-100">
                          <span className="text-gray-700 font-medium">Total:</span>
                          <span className={`font-bold ${calculations.traditional.rental.total >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(calculations.traditional.rental.total)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Extra Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-5 border-2 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Extra Principal</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payoff Time:</span>
                  <span className="font-semibold text-blue-600">{calculations.extraPayment.years} yrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.extraPayment.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.extraPayment.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Savings:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(calculations.extraPayment.totalTaxSavings)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Maintenance:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(calculations.extraPayment.totalMaintenance)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Net Cost:</span>
                  <span className="font-bold text-red-700">{formatCurrency(calculations.extraPayment.netInterest)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Value:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(calculations.extraPayment.finalHomeValue)}</span>
                    </div>

                    {/* Rental Subsection */}
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Rental</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Payment:</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(calculations.extraPayment.rental.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(calculations.extraPayment.rental.totalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Investment Gain:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(calculations.extraPayment.rental.investmentGain)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-gray-100">
                          <span className="text-gray-700 font-medium">Total:</span>
                          <span className={`font-bold ${calculations.extraPayment.rental.total >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(calculations.extraPayment.rental.total)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* LOC Method */}
            <div className="bg-white rounded-lg shadow-md p-5 border-2 border-green-500">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">LOC Strategy</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payoff Time:</span>
                  <span className="font-semibold text-green-600">{calculations.accelerated.years} yrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Mortgage Interest:</span>
                  <span className="font-semibold text-xs text-red-600">{formatCurrency(calculations.accelerated.mortgageInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">LOC Interest:</span>
                  <span className="font-semibold text-xs text-red-600">{formatCurrency(calculations.accelerated.locInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.accelerated.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Savings:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(calculations.accelerated.totalTaxSavings)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Maintenance:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(calculations.accelerated.totalMaintenance)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Net Cost:</span>
                  <span className="font-bold text-red-700">{formatCurrency(calculations.accelerated.netInterest)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Value:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(calculations.accelerated.finalHomeValue)}</span>
                    </div>

                    {/* Rental Subsection */}
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Rental</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Payment:</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(calculations.accelerated.rental.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(calculations.accelerated.rental.totalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Investment Gain:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(calculations.accelerated.rental.investmentGain)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-gray-100">
                          <span className="text-gray-700 font-medium">Total:</span>
                          <span className={`font-bold ${calculations.accelerated.rental.total >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(calculations.accelerated.rental.total)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Investment Method */}
            <div className="bg-white rounded-lg shadow-md p-5 border-2 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Invest & Pay Mortgage</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payoff Time:</span>
                  <span className="font-semibold">{calculations.investment.years} yrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.investment.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest Paid:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.investment.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Savings:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(calculations.investment.totalTaxSavings)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Maintenance:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(calculations.investment.totalMaintenance)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment Gains:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(calculations.investment.investmentBalance)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">{calculations.investment.netPosition >= 0 ? 'Net Position' : 'Net Cost'}:</span>
                  <span className={`font-bold ${calculations.investment.netPosition > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(calculations.investment.netPosition >= 0 ? calculations.investment.netPosition : Math.abs(calculations.investment.netPosition))}
                  </span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Value:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(calculations.investment.finalHomeValue)}</span>
                    </div>

                    {/* Rental Subsection */}
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Rental</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Payment:</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(calculations.investment.rental.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(calculations.investment.rental.totalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Investment Gain:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(calculations.investment.rental.investmentGain)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-gray-100">
                          <span className="text-gray-700 font-medium">Total:</span>
                          <span className={`font-bold ${calculations.investment.rental.total >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(calculations.investment.rental.total)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Balance Over Time Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Mortgage Balance Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={calculations.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="traditional" stroke="#ef4444" strokeWidth={2} name="Traditional" />
                <Line type="monotone" dataKey="extraPayment" stroke="#3b82f6" strokeWidth={2} name="Extra Principal" />
                <Line type="monotone" dataKey="accelerated" stroke="#10b981" strokeWidth={2} name="LOC Strategy" />
                <Line type="monotone" dataKey="investment" stroke="#a855f7" strokeWidth={2} name="Invest & Pay" />
                {calculations.rental && <Line type="monotone" dataKey="rental" stroke="#f97316" strokeWidth={2} name="Rent & Invest" />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Net Position Comparison */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Final Net Position Comparison</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { strategy: 'Traditional', value: -calculations.traditional.netInterest },
                { strategy: 'Extra Principal', value: -calculations.extraPayment.netInterest },
                { strategy: 'LOC Strategy', value: -calculations.accelerated.netInterest },
                { strategy: 'Invest & Pay', value: calculations.investment.netPosition },
                ...(calculations.rental ? [{ strategy: 'Rent & Invest', value: calculations.rental.comparisonValue }] : [])
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strategy" angle={-20} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Net Position/Cost ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Positive values = money gained. Negative values = interest cost after tax savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}