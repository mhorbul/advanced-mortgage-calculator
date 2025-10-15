import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function MortgageCalculator() {
  const [inputs, setInputs] = useState({
    mortgageBalance: 200000,
    mortgageRate: 6.5,
    mortgageYears: 30,
    monthlyIncome: 5000,
    monthlyExpenses: 4000,
    locLimit: 10000,
    locRate: 15,
    taxRate: 24,
    investmentReturn: 8,
    inflationRate: 3,
    maintenanceRate: 1.5,
    homeAppreciationRate: 3.5,
    rentalDiscountPercent: 10,
    enableRentalComparison: false
  });

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
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
      inflationRate,
      maintenanceRate,
      homeAppreciationRate,
      rentalDiscountPercent,
      enableRentalComparison
    } = inputs;

    // Calculate home value from mortgage balance (80% LTV)
    const homeValue = mortgageBalance / 0.8;

    const mortgageMonthlyRate = mortgageRate / 100 / 12;
    const locMonthlyRate = locRate / 100 / 12;
    const investmentMonthlyRate = investmentReturn / 100 / 12;
    const inflationMonthlyRate = inflationRate / 100 / 12;
    const totalMonths = mortgageYears * 12;

    // Calculate traditional mortgage payment
    const mortgagePayment = mortgageBalance *
      (mortgageMonthlyRate * Math.pow(1 + mortgageMonthlyRate, totalMonths)) /
      (Math.pow(1 + mortgageMonthlyRate, totalMonths) - 1);

    // Calculate leftover after housing costs
    const leftover = monthlyIncome - monthlyExpenses - mortgagePayment;

    // Calculate net rent cost for each strategy (opportunity cost of not renting)
    let netRentCost = 0;
    let netRentCostReal = 0;
    let finalHomeValue = homeValue;
    let finalHomeValueReal = homeValue;

    if (enableRentalComparison) {
      // Calculate what you would have paid in rent over the mortgage term
      const rentalCost = mortgagePayment * (1 - rentalDiscountPercent / 100);
      const totalRentPaid = rentalCost * totalMonths;
      const rentInflationAdjustment = Math.pow(1 + inflationMonthlyRate, totalMonths);
      const realTotalRentPaid = totalRentPaid / rentInflationAdjustment;

      // Calculate home value at end of mortgage term
      finalHomeValue = homeValue * Math.pow(1 + homeAppreciationRate / 100 / 12, totalMonths);
      finalHomeValueReal = finalHomeValue / rentInflationAdjustment;

      // Net rent cost is the difference between what you paid in mortgage vs rent
      netRentCost = (mortgagePayment * totalMonths) - totalRentPaid;
      netRentCostReal = netRentCost / rentInflationAdjustment;
    }

    // Traditional Method (Scheduled Payments Only)
    let tradBalance = mortgageBalance;
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
      const taxSavings = (interest * taxRate) / 100;

      // Calculate maintenance costs
      const monthlyMaintenance = tradCurrentHomeValue * (maintenanceRate / 100 / 12);
      tradTotalMaintenance += monthlyMaintenance;

      tradTotalInterest += interest;
      tradTotalTaxSavings += taxSavings;
      tradTotalPayments += mortgagePayment;
      tradBalance -= principal;

      // Home appreciation
      tradCurrentHomeValue *= (1 + homeAppreciationRate / 100 / 12);

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

    // Calculate inflation-adjusted values for traditional method
    const tradInflationAdjustment = Math.pow(1 + inflationMonthlyRate, tradMonths);
    const tradRealInterest = tradTotalInterest / tradInflationAdjustment;
    const tradRealTaxSavings = tradTotalTaxSavings / tradInflationAdjustment;
    const tradRealMaintenance = tradTotalMaintenance / tradInflationAdjustment;
    const tradRealNetInterest = tradRealInterest - tradRealTaxSavings + tradRealMaintenance;

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
      const taxSavings = (interest * taxRate) / 100;

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

    // Calculate inflation-adjusted values for extra payment method
    const extraInflationAdjustment = Math.pow(1 + inflationMonthlyRate, extraMonths);
    const extraRealInterest = extraTotalInterest / extraInflationAdjustment;
    const extraRealTaxSavings = extraTotalTaxSavings / extraInflationAdjustment;
    const extraRealMaintenance = extraTotalMaintenance / extraInflationAdjustment;
    const extraRealNetInterest = extraRealInterest - extraRealTaxSavings + extraRealMaintenance;

    // Line of Credit Accelerated Method
    let accBalance = mortgageBalance;
    let locBalance = 0;
    let accTotalInterest = 0;
    let accTotalLocInterest = 0;
    let accTotalTaxSavings = 0;
    let accTotalPayments = 0;
    let accTotalMaintenance = 0;
    let accMonths = 0;
    let lastChunkMonth = 0;
    let accCurrentHomeValue = homeValue;

    const accData = [];

    while ((accBalance > 0 || locBalance > 0) && accMonths < totalMonths * 2) {
      // Check if we can use LOC chunk strategy
      if (locBalance === 0 && accBalance > 0 && (accMonths - lastChunkMonth) >= 1) {
        const chunkSize = Math.min(locLimit, accBalance);
        locBalance = chunkSize;
        accBalance -= chunkSize;
        lastChunkMonth = accMonths;
      }

      // Calculate maintenance costs
      const monthlyMaintenance = accCurrentHomeValue * (maintenanceRate / 100 / 12);
      accTotalMaintenance += monthlyMaintenance;

      // Calculate mortgage interest
      if (accBalance > 0) {
        const mortgageInterest = accBalance * mortgageMonthlyRate;
        const taxSavings = (mortgageInterest * taxRate) / 100;
        accTotalInterest += mortgageInterest;
        accTotalTaxSavings += taxSavings;
      }

      // Calculate LOC interest
      if (locBalance > 0) {
        const locInterest = locBalance * locMonthlyRate;
        accTotalLocInterest += locInterest;
        locBalance += locInterest;
      }

      // Apply leftover payment
      if (locBalance > 0) {
        const payment = Math.min(leftover, locBalance);
        locBalance -= payment;
        accTotalPayments += payment;
      } else if (accBalance > 0) {
        const interest = accBalance * mortgageMonthlyRate;
        const principal = Math.min(leftover - interest, accBalance);
        accBalance -= principal;
        accTotalPayments += leftover;
      }

      // Home appreciation
      accCurrentHomeValue *= (1 + homeAppreciationRate / 100 / 12);

      accMonths++;

      if (accMonths % 12 === 0) {
        accData.push({
          year: accMonths / 12,
          accelerated: Math.max(0, accBalance + locBalance)
        });
      }
    }

    // Calculate inflation-adjusted values for LOC method
    const accInflationAdjustment = Math.pow(1 + inflationMonthlyRate, accMonths);
    const accRealInterest = accTotalInterest / accInflationAdjustment;
    const accRealLocInterest = accTotalLocInterest / accInflationAdjustment;
    const accRealTaxSavings = accTotalTaxSavings / accInflationAdjustment;
    const accRealMaintenance = accTotalMaintenance / accInflationAdjustment;
    const accRealNetInterest = (accRealInterest + accRealLocInterest) - accRealTaxSavings + accRealMaintenance;

    // Investment Method (Pay mortgage normally, invest leftover)
    let invBalance = mortgageBalance;
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
      const taxSavings = (interest * taxRate) / 100;

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

    // Calculate inflation-adjusted values for investment method
    const invInflationAdjustment = Math.pow(1 + inflationMonthlyRate, invMonths);
    const invRealInterest = invTotalInterest / invInflationAdjustment;
    const invRealTaxSavings = invTotalTaxSavings / invInflationAdjustment;
    const invRealInvestmentBalance = finalInvestmentBalance / invInflationAdjustment;
    const invRealMaintenance = invTotalMaintenance / invInflationAdjustment;
    const invRealNetPosition = enableRentalComparison ? 
      invRealInvestmentBalance - (invRealInterest - invRealTaxSavings + invRealMaintenance) : 
      invRealInvestmentBalance - (invRealInterest - invRealTaxSavings);

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

        // Invest the difference between mortgage payment and rent
        const investmentAmount = mortgagePayment - rentalCost;
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

      // Calculate inflation-adjusted values for rental method
      const rentalInflationAdjustment = Math.pow(1 + inflationMonthlyRate, rentalMonths);
      const rentalRealTotalRent = rentalTotalRent / rentalInflationAdjustment;
      const rentalRealInvestmentBalance = rentalInvestmentBalance / rentalInflationAdjustment;
      const rentalRealHomeValue = currentHomeValue / rentalInflationAdjustment;

      // Net position: investment gains + home appreciation - rent paid
      // Note: We don't subtract maintenance because renter doesn't pay maintenance
      const rentalNetPosition = rentalRealInvestmentBalance + rentalRealHomeValue - rentalRealTotalRent;

      rental = {
        months: rentalMonths,
        years: (rentalMonths / 12).toFixed(1),
        totalRent: rentalTotalRent,
        totalInvestment: rentalTotalInvestment,
        investmentBalance: rentalInvestmentBalance,
        homeValue: currentHomeValue,
        netPosition: rentalNetPosition,
        monthlyRent: rentalCost,
        // Real (inflation-adjusted) values
        realTotalRent: rentalRealTotalRent,
        realInvestmentBalance: rentalRealInvestmentBalance,
        realHomeValue: rentalRealHomeValue,
        realNetPosition: rentalNetPosition
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
        finalHomeValue: finalHomeValue,
        // Real (inflation-adjusted) values
        realTotalInterest: tradRealInterest,
        realTotalTaxSavings: tradRealTaxSavings,
        realTotalMaintenance: tradRealMaintenance,
        realNetInterest: enableRentalComparison ? 
          tradRealInterest - tradRealTaxSavings + tradRealMaintenance : 
          tradRealInterest - tradRealTaxSavings,
        realNetRentCost: netRentCostReal,
        realFinalHomeValue: finalHomeValueReal,
        // Rental subsection data
        rental: enableRentalComparison ? {
          monthlyPayment: mortgagePayment * (1 - rentalDiscountPercent / 100),
          totalCost: (mortgagePayment * (1 - rentalDiscountPercent / 100)) * totalMonths,
          investmentGain: leftover * totalMonths * (1 + investmentMonthlyRate), // Always invest leftover when renting
          total: (mortgagePayment * (1 - rentalDiscountPercent / 100)) * totalMonths + (leftover * totalMonths * (1 + investmentMonthlyRate))
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
        finalHomeValue: finalHomeValue,
        // Real (inflation-adjusted) values
        realTotalInterest: extraRealInterest,
        realTotalTaxSavings: extraRealTaxSavings,
        realTotalMaintenance: extraRealMaintenance,
        realNetInterest: enableRentalComparison ? 
          extraRealInterest - extraRealTaxSavings + extraRealMaintenance : 
          extraRealInterest - extraRealTaxSavings,
        realNetRentCost: netRentCostReal,
        realFinalHomeValue: finalHomeValueReal,
        // Rental subsection data
        rental: enableRentalComparison ? {
          monthlyPayment: mortgagePayment * (1 - rentalDiscountPercent / 100),
          totalCost: (mortgagePayment * (1 - rentalDiscountPercent / 100)) * totalMonths,
          investmentGain: leftover * totalMonths * (1 + investmentMonthlyRate), // Always invest leftover when renting
          total: (mortgagePayment * (1 - rentalDiscountPercent / 100)) * totalMonths + (leftover * totalMonths * (1 + investmentMonthlyRate))
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
        finalHomeValue: finalHomeValue,
        // Real (inflation-adjusted) values
        realTotalInterest: accRealInterest + accRealLocInterest,
        realMortgageInterest: accRealInterest,
        realLocInterest: accRealLocInterest,
        realTotalTaxSavings: accRealTaxSavings,
        realTotalMaintenance: accRealMaintenance,
        realNetInterest: enableRentalComparison ? 
          (accRealInterest + accRealLocInterest) - accRealTaxSavings + accRealMaintenance : 
          (accRealInterest + accRealLocInterest) - accRealTaxSavings,
        realNetRentCost: netRentCostReal,
        realFinalHomeValue: finalHomeValueReal,
        // Rental subsection data
        rental: enableRentalComparison ? {
          monthlyPayment: mortgagePayment * (1 - rentalDiscountPercent / 100),
          totalCost: (mortgagePayment * (1 - rentalDiscountPercent / 100)) * totalMonths,
          investmentGain: leftover * totalMonths * (1 + investmentMonthlyRate), // Always invest leftover when renting
          total: (mortgagePayment * (1 - rentalDiscountPercent / 100)) * totalMonths + (leftover * totalMonths * (1 + investmentMonthlyRate))
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
        finalHomeValue: finalHomeValue,
        // Real (inflation-adjusted) values
        realTotalInterest: invRealInterest,
        realTotalTaxSavings: invRealTaxSavings,
        realTotalMaintenance: invRealMaintenance,
        realNetInterest: enableRentalComparison ? 
          invRealInterest - invRealTaxSavings + invRealMaintenance : 
          invRealInterest - invRealTaxSavings,
        realInvestmentBalance: invRealInvestmentBalance,
        realNetPosition: invRealNetPosition,
        realNetRentCost: netRentCostReal,
        realFinalHomeValue: finalHomeValueReal,
        // Rental subsection data
        rental: enableRentalComparison ? {
          monthlyPayment: mortgagePayment * (1 - rentalDiscountPercent / 100),
          totalCost: (mortgagePayment * (1 - rentalDiscountPercent / 100)) * totalMonths,
          investmentGain: leftover * totalMonths * (1 + investmentMonthlyRate), // Always invest leftover when renting
          total: (mortgagePayment * (1 - rentalDiscountPercent / 100)) * totalMonths + (leftover * totalMonths * (1 + investmentMonthlyRate))
        } : null
      },
      rental,
      chartData,
      leftover
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
      { name: 'Traditional', value: -calculations.traditional.realNetInterest, netWorth: -calculations.traditional.realNetInterest },
      { name: 'Extra Principal', value: -calculations.extraPayment.realNetInterest, netWorth: -calculations.extraPayment.realNetInterest },
      { name: 'LOC Strategy', value: -calculations.accelerated.realNetInterest, netWorth: -calculations.accelerated.realNetInterest },
      { name: 'Invest & Pay', value: calculations.investment.realNetPosition, netWorth: calculations.investment.realNetPosition }
    ];

    // Add rental strategy only if enabled
    if (calculations.rental) {
      strategies.push({ name: 'Rent & Invest', value: calculations.rental.realNetPosition, netWorth: calculations.rental.realNetPosition });
    }

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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Term (years)</label>
              <input
                type="number"
                value={inputs.mortgageYears}
                onChange={(e) => handleInputChange('mortgageYears', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
              <input
                type="number"
                value={inputs.monthlyExpenses}
                onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inflation Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.inflationRate}
                onChange={(e) => handleInputChange('inflationRate', e.target.value)}
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
              </div>
            )}

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
                Monthly Leftover (after housing): <span className="text-green-600">{formatCurrency(calculations.leftover)}</span>
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
              Net Position (Real): <span className="font-bold text-3xl">{formatCurrency(best.netWorth)}</span>
            </div>
            <div className="text-sm mt-2 text-green-100">
              {best.name === 'Invest & Pay'
                ? 'Investment gains exceed interest costs (inflation-adjusted)!'
                : best.name === 'Rent & Invest'
                ? 'Renting and investing beats homeownership!'
                : 'Minimizes total interest paid (inflation-adjusted)'}
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
                  <span className="font-semibold">{formatCurrency(calculations.traditional.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.traditional.totalInterest)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>{formatCurrency(calculations.traditional.realTotalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Savings:</span>
                  <span className="font-semibold text-green-600">-{formatCurrency(calculations.traditional.totalTaxSavings)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>-{formatCurrency(calculations.traditional.realTotalTaxSavings)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Maintenance:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(calculations.traditional.totalMaintenance)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Real (inflation-adjusted):</span>
                      <span>{formatCurrency(calculations.traditional.realTotalMaintenance)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Net Cost:</span>
                  <span className="font-bold text-red-700">{formatCurrency(calculations.traditional.netInterest)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span className="font-semibold">{formatCurrency(calculations.traditional.realNetInterest)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Value:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(calculations.traditional.finalHomeValue)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Real (inflation-adjusted):</span>
                      <span>{formatCurrency(calculations.traditional.realFinalHomeValue)}</span>
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
                          <span className="font-bold text-gray-800">{formatCurrency(calculations.traditional.rental.total)}</span>
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
                  <span className="font-semibold">{formatCurrency(calculations.extraPayment.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.extraPayment.totalInterest)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>{formatCurrency(calculations.extraPayment.realTotalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Savings:</span>
                  <span className="font-semibold text-green-600">-{formatCurrency(calculations.extraPayment.totalTaxSavings)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>-{formatCurrency(calculations.extraPayment.realTotalTaxSavings)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Maintenance:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(calculations.extraPayment.totalMaintenance)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Real (inflation-adjusted):</span>
                      <span>{formatCurrency(calculations.extraPayment.realTotalMaintenance)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Net Cost:</span>
                  <span className="font-bold text-blue-700">{formatCurrency(calculations.extraPayment.netInterest)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span className="font-semibold">{formatCurrency(calculations.extraPayment.realNetInterest)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Value:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(calculations.extraPayment.finalHomeValue)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Real (inflation-adjusted):</span>
                      <span>{formatCurrency(calculations.extraPayment.realFinalHomeValue)}</span>
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
                          <span className="font-bold text-gray-800">{formatCurrency(calculations.extraPayment.rental.total)}</span>
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
                  <span className="font-semibold text-xs">{formatCurrency(calculations.accelerated.mortgageInterest)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>{formatCurrency(calculations.accelerated.realMortgageInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">LOC Interest:</span>
                  <span className="font-semibold text-xs">{formatCurrency(calculations.accelerated.locInterest)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>{formatCurrency(calculations.accelerated.realLocInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.accelerated.totalInterest)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>{formatCurrency(calculations.accelerated.realTotalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Savings:</span>
                  <span className="font-semibold text-green-600">-{formatCurrency(calculations.accelerated.totalTaxSavings)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>-{formatCurrency(calculations.accelerated.realTotalTaxSavings)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Maintenance:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(calculations.accelerated.totalMaintenance)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Real (inflation-adjusted):</span>
                      <span>{formatCurrency(calculations.accelerated.realTotalMaintenance)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Net Cost:</span>
                  <span className="font-bold text-green-700">{formatCurrency(calculations.accelerated.netInterest)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span className="font-semibold">{formatCurrency(calculations.accelerated.realNetInterest)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Value:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(calculations.accelerated.finalHomeValue)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Real (inflation-adjusted):</span>
                      <span>{formatCurrency(calculations.accelerated.realFinalHomeValue)}</span>
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
                          <span className="font-bold text-gray-800">{formatCurrency(calculations.accelerated.rental.total)}</span>
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
                  <span className="font-semibold">{formatCurrency(calculations.investment.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest Paid:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(calculations.investment.totalInterest)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>{formatCurrency(calculations.investment.realTotalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Savings:</span>
                  <span className="font-semibold text-green-600">-{formatCurrency(calculations.investment.totalTaxSavings)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>-{formatCurrency(calculations.investment.realTotalTaxSavings)}</span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Maintenance:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(calculations.investment.totalMaintenance)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Real (inflation-adjusted):</span>
                      <span>{formatCurrency(calculations.investment.realTotalMaintenance)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment Gains:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(calculations.investment.investmentBalance)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span>{formatCurrency(calculations.investment.realInvestmentBalance)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Net Position:</span>
                  <span className={`font-bold ${calculations.investment.netPosition > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(calculations.investment.netPosition)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Real (inflation-adjusted):</span>
                  <span className={`font-semibold ${calculations.investment.realNetPosition > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.investment.realNetPosition)}
                  </span>
                </div>
                {inputs.enableRentalComparison && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Value:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(calculations.investment.finalHomeValue)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Real (inflation-adjusted):</span>
                      <span>{formatCurrency(calculations.investment.realFinalHomeValue)}</span>
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
                          <span className="font-bold text-gray-800">{formatCurrency(calculations.investment.rental.total)}</span>
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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Final Net Position Comparison (Real Values)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { strategy: 'Traditional', value: -calculations.traditional.realNetInterest },
                { strategy: 'Extra Principal', value: -calculations.extraPayment.realNetInterest },
                { strategy: 'LOC Strategy', value: -calculations.accelerated.realNetInterest },
                { strategy: 'Invest & Pay', value: calculations.investment.realNetPosition },
                ...(calculations.rental ? [{ strategy: 'Rent & Invest', value: calculations.rental.realNetPosition }] : [])
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strategy" angle={-20} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Net Position ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Real values adjusted for {inputs.inflationRate}% inflation. Positive values = money gained. Negative values = interest cost after tax savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}