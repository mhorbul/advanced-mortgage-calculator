// Mortgage calculation utilities
export const calculateMortgagePayment = (balance, rate, years) => {
  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;

  if (monthlyRate === 0) {
    return balance / totalMonths;
  }

  return balance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
         (Math.pow(1 + monthlyRate, totalMonths) - 1);
};

export const calculateInvestmentBalance = (monthlyContribution, months, annualRate) => {
  const monthlyRate = annualRate / 100 / 12;
  let balance = 0;

  for (let i = 0; i < months; i++) {
    balance += monthlyContribution;
    balance *= (1 + monthlyRate);
  }

  return balance;
};

export const calculateMortgageStrategies = (inputs) => {
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

  // Safe conversion for calculations
  const safeMortgageBalance = mortgageBalance === '' ? 0 : mortgageBalance;
  const safeMortgageRate = mortgageRate === '' ? 0 : mortgageRate;
  const safeMortgageYears = mortgageYears === '' ? 0 : mortgageYears;
  const safeMonthlyIncome = monthlyIncome === '' ? 0 : monthlyIncome;
  const safeMonthlyExpenses = monthlyExpenses === '' ? 0 : monthlyExpenses;
  const safeLocLimit = locLimit === '' ? 0 : locLimit;
  const safeLocRate = locRate === '' ? 0 : locRate;
  const safeTaxRate = taxRate === '' ? 0 : taxRate;
  const safeInvestmentReturn = investmentReturn === '' ? 0 : investmentReturn;
  const safeMaintenanceRate = maintenanceRate === '' ? 0 : maintenanceRate;
  const safeHomeAppreciationRate = homeAppreciationRate === '' ? 0 : homeAppreciationRate;
  const safeRentalDiscountPercent = rentalDiscountPercent === '' ? 0 : rentalDiscountPercent;

  const mortgagePayment = calculateMortgagePayment(safeMortgageBalance, safeMortgageRate, safeMortgageYears);
  const totalMonths = safeMortgageYears * 12;
  const mortgageMonthlyRate = safeMortgageRate / 100 / 12;
  const locMonthlyRate = safeLocRate / 100 / 12;
  const homeValue = safeMortgageBalance / 0.8; // Assuming 80% LTV

  // Calculate leftover money (income - expenses - mortgage payment - maintenance)
  const monthlyMaintenance = homeValue * (safeMaintenanceRate / 100 / 12);
  const leftover = safeMonthlyIncome - safeMonthlyExpenses - mortgagePayment - monthlyMaintenance;

  // Check if expenses + mortgage + maintenance exceed income
  const costExceedsIncome = (safeMonthlyExpenses + mortgagePayment + monthlyMaintenance) > safeMonthlyIncome;

  // Traditional Method
  let tradBalance = safeMortgageBalance;
  let tradTotalInterest = 0;
  let tradTotalTaxSavings = 0;
  let tradTotalMaintenance = 0;
  let tradMonths = 0;
  let tradCurrentHomeValue = homeValue;

  const tradData = [];

  while (tradBalance > 0 && tradMonths < totalMonths * 2) {
    const mortgageInterest = tradBalance * mortgageMonthlyRate;
    const taxSavings = (mortgageInterest * safeTaxRate) / 100;
    tradTotalInterest += mortgageInterest;
    tradTotalTaxSavings += taxSavings;

    const monthlyMaintenance = tradCurrentHomeValue * (safeMaintenanceRate / 100 / 12);
    tradTotalMaintenance += monthlyMaintenance;

    const principalPayment = mortgagePayment - mortgageInterest;
    tradBalance -= principalPayment;

    tradCurrentHomeValue *= (1 + safeHomeAppreciationRate / 100 / 12);
    tradMonths++;

    if (tradMonths % 12 === 0) {
      tradData.push({
        year: tradMonths / 12,
        traditional: Math.max(0, tradBalance)
      });
    }
  }

  const traditional = {
    totalInterest: tradTotalInterest,
    totalTaxSavings: tradTotalTaxSavings,
    totalMaintenance: tradTotalMaintenance,
    netInterest: tradTotalInterest - tradTotalTaxSavings,
    netCost: tradTotalInterest - tradTotalTaxSavings, // No LOC interest or investment gains
    finalHomeValue: tradCurrentHomeValue,
    months: tradMonths,
    netPosition: tradCurrentHomeValue - safeMortgageBalance - tradTotalInterest + tradTotalTaxSavings - tradTotalMaintenance
  };

  // Extra Principal Method
  let extraBalance = safeMortgageBalance;
  let extraTotalInterest = 0;
  let extraTotalTaxSavings = 0;
  let extraTotalMaintenance = 0;
  let extraMonths = 0;
  let extraCurrentHomeValue = homeValue;

  const extraData = [];

  while (extraBalance > 0 && extraMonths < totalMonths * 2) {
    const mortgageInterest = extraBalance * mortgageMonthlyRate;
    const taxSavings = (mortgageInterest * safeTaxRate) / 100;
    extraTotalInterest += mortgageInterest;
    extraTotalTaxSavings += taxSavings;

    const monthlyMaintenance = extraCurrentHomeValue * (safeMaintenanceRate / 100 / 12);
    extraTotalMaintenance += monthlyMaintenance;

    const principalPayment = mortgagePayment - mortgageInterest;
    extraBalance -= principalPayment;

    // Apply extra payment if we have leftover money
    if (leftover > 0) {
      const extraPayment = Math.min(leftover, extraBalance);
      extraBalance -= extraPayment;
    }

    extraCurrentHomeValue *= (1 + safeHomeAppreciationRate / 100 / 12);
    extraMonths++;

    if (extraMonths % 12 === 0) {
      extraData.push({
        year: extraMonths / 12,
        extraPayment: Math.max(0, extraBalance)
      });
    }
  }

  const extraPayment = {
    totalInterest: extraTotalInterest,
    totalTaxSavings: extraTotalTaxSavings,
    totalMaintenance: extraTotalMaintenance,
    netInterest: extraTotalInterest - extraTotalTaxSavings,
    netCost: extraTotalInterest - extraTotalTaxSavings, // No LOC interest or investment gains
    finalHomeValue: extraCurrentHomeValue,
    months: extraMonths,
    netPosition: extraCurrentHomeValue - safeMortgageBalance - extraTotalInterest + extraTotalTaxSavings - extraTotalMaintenance,
    effectiveMonthlyPayment: mortgagePayment + leftover // Base payment + extra principal
  };

  // Line of Credit Accelerated Method
  let accBalance = safeMortgageBalance;
  let locBalance = 0;
  let accTotalInterest = 0;
  let accTotalLocInterest = 0;
  let accTotalTaxSavings = 0;
  let accTotalMaintenance = 0;
  let accMonths = 0;
  let accCurrentHomeValue = homeValue;

  const accData = [];
  const debugData = []; // Debug output for LOC calculation

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

    // Ensure mortgage balance doesn't go negative
    if (accBalance < 0) {
      accBalance = 0;
    }

    // If we have leftover money, use it strategically
    if (leftover > 0) {
      // If no LOC balance and still have mortgage balance, take a LOC chunk
      if (locBalance === 0 && accBalance > 0) {
        const chunkSize = Math.min(safeLocLimit, accBalance);
        locBalance = chunkSize;
        accBalance -= chunkSize;
      }

      // Pay down LOC with leftover money
      if (locBalance > 0) {
        const locPayment = Math.min(leftover, locBalance);
        locBalance -= locPayment;

        // Ensure LOC balance doesn't go negative
        if (locBalance < 0) {
          locBalance = 0;
        }
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

    // Debug output for each month
    debugData.push({
      month: accMonths,
      mortgageBalance: accBalance,
      locBalance: locBalance,
      mortgageInterest: mortgageInterest,
      locInterest: locBalance > 0 ? locBalance * locMonthlyRate : 0,
      principalPayment: principalPayment,
      locPayment: leftover > 0 && locBalance > 0 ? Math.min(leftover, locBalance) : 0,
      leftover: leftover,
      totalBalance: accBalance + locBalance
    });

    if (accMonths % 12 === 0) {
      accData.push({
        year: accMonths / 12,
        accelerated: Math.max(0, accBalance + locBalance)
      });
    }
  }

  const accelerated = {
    totalInterest: accTotalInterest,
    totalLocInterest: accTotalLocInterest,
    totalTaxSavings: accTotalTaxSavings,
    totalMaintenance: accTotalMaintenance,
    netInterest: accTotalInterest + accTotalLocInterest - accTotalTaxSavings,
    netCost: accTotalInterest + accTotalLocInterest - accTotalTaxSavings, // Mortgage + LOC interest - tax savings
    finalHomeValue: accCurrentHomeValue,
    months: accMonths,
    netPosition: accCurrentHomeValue - safeMortgageBalance - accTotalInterest - accTotalLocInterest + accTotalTaxSavings - accTotalMaintenance,
    debugData: debugData // Debug output for LOC calculation
  };

  // Investment Method
  const invMonths = totalMonths;
  const invTotalInterest = traditional.totalInterest;
  const invTotalTaxSavings = traditional.totalTaxSavings;
  const invTotalMaintenance = traditional.totalMaintenance;
  const invFinalHomeValue = traditional.finalHomeValue;

  const investmentAmount = leftover;
  const investmentBalance = calculateInvestmentBalance(investmentAmount, invMonths, safeInvestmentReturn);
  const investmentGain = investmentBalance - (investmentAmount * invMonths);

  const investment = {
    totalInterest: invTotalInterest,
    totalTaxSavings: invTotalTaxSavings,
    totalMaintenance: invTotalMaintenance,
    netInterest: invTotalInterest - invTotalTaxSavings,
    netCost: invTotalInterest - invTotalTaxSavings - investmentGain, // Mortgage interest - tax savings - investment gains
    finalHomeValue: invFinalHomeValue,
    months: invMonths,
    investmentBalance,
    investmentGain,
    netPosition: invFinalHomeValue - safeMortgageBalance - invTotalInterest + invTotalTaxSavings - invTotalMaintenance + investmentGain
  };

  // Rental Comparison
  let rental = null;
  if (enableRentalComparison) {
    const rentalCost = mortgagePayment * (1 - safeRentalDiscountPercent / 100);
    const rentalPayment = rentalCost;
    const rentalMonths = Math.max(tradMonths, extraMonths, accMonths, invMonths);

    // Calculate rental investment for each strategy
    const tradRentalInvestmentAmount = leftover + (mortgagePayment - rentalPayment);
    const tradRentalInvestmentBalance = calculateInvestmentBalance(tradRentalInvestmentAmount, tradMonths, safeInvestmentReturn);
    const tradRentalInvestmentGain = tradRentalInvestmentBalance - (tradRentalInvestmentAmount * tradMonths);
    const tradRentalTotalRent = rentalPayment * tradMonths;
    const tradRentalTotal = tradRentalInvestmentGain - tradRentalTotalRent;

    const extraRentalInvestmentAmount = leftover + (mortgagePayment - rentalPayment);
    const extraRentalInvestmentBalance = calculateInvestmentBalance(extraRentalInvestmentAmount, extraMonths, safeInvestmentReturn);
    const extraRentalInvestmentGain = extraRentalInvestmentBalance - (extraRentalInvestmentAmount * extraMonths);
    const extraRentalTotalRent = rentalPayment * extraMonths;
    const extraRentalTotal = extraRentalInvestmentGain - extraRentalTotalRent;

    const accRentalInvestmentAmount = leftover + (mortgagePayment - rentalPayment);
    const accRentalInvestmentBalance = calculateInvestmentBalance(accRentalInvestmentAmount, accMonths, safeInvestmentReturn);
    const accRentalInvestmentGain = accRentalInvestmentBalance - (accRentalInvestmentAmount * accMonths);
    const accRentalTotalRent = rentalPayment * accMonths;
    const accRentalTotal = accRentalInvestmentGain - accRentalTotalRent;

    const invRentalInvestmentAmount = leftover + (mortgagePayment - rentalPayment);
    const invRentalInvestmentBalance = calculateInvestmentBalance(invRentalInvestmentAmount, invMonths, safeInvestmentReturn);
    const invRentalInvestmentGain = invRentalInvestmentBalance - (invRentalInvestmentAmount * invMonths);
    const invRentalTotalRent = rentalPayment * invMonths;
    const invRentalTotal = invRentalInvestmentGain - invRentalTotalRent;

    // For comparison purposes, we want just investment gain minus rent cost (no home appreciation)
    const rentalComparisonValue = Math.max(tradRentalInvestmentGain, extraRentalInvestmentGain, accRentalInvestmentGain, invRentalInvestmentGain) - (rentalPayment * Math.min(tradMonths, extraMonths, accMonths, invMonths));

    rental = {
      rentalCost,
      rentalPayment,
      rentalMonths,
      traditional: {
        investmentGain: tradRentalInvestmentGain,
        totalRent: tradRentalTotalRent,
        total: tradRentalTotal
      },
      extraPayment: {
        investmentGain: extraRentalInvestmentGain,
        totalRent: extraRentalTotalRent,
        total: extraRentalTotal
      },
      accelerated: {
        investmentGain: accRentalInvestmentGain,
        totalRent: accRentalTotalRent,
        total: accRentalTotal
      },
      investment: {
        investmentGain: invRentalInvestmentGain,
        totalRent: invRentalTotalRent,
        total: invRentalTotal
      },
      comparisonValue: rentalComparisonValue
    };
  }

  // Chart data
  const chartData = [];
  const maxYears = Math.max(tradMonths, extraMonths, accMonths) / 12;

  // Start with initial mortgage balance at year 0
  chartData.push({
    year: 0,
    traditional: safeMortgageBalance,
    extraPayment: safeMortgageBalance,
    accelerated: safeMortgageBalance
  });

  for (let year = 1; year <= maxYears; year++) {
    const tradEntry = tradData.find(d => d.year === year);
    const extraEntry = extraData.find(d => d.year === year);
    const accEntry = accData.find(d => d.year === year);

    chartData.push({
      year,
      traditional: tradEntry ? tradEntry.traditional : 0,
      extraPayment: extraEntry ? extraEntry.extraPayment : 0,
      accelerated: accEntry ? accEntry.accelerated : 0
    });
  }

  // Best strategy
  const strategies = [
    { name: 'Traditional', netWorth: traditional.netPosition },
    { name: 'Extra Principal', netWorth: extraPayment.netPosition },
    { name: 'LOC Strategy', netWorth: accelerated.netPosition },
    { name: 'Invest & Pay', netWorth: investment.netPosition }
  ];

  const bestStrategy = strategies.reduce((best, current) =>
    current.netWorth > best.netWorth ? current : best
  );

  return {
    traditional,
    extraPayment,
    accelerated,
    investment,
    rental,
    chartData,
    bestStrategy,
    leftover,
    costExceedsIncome,
    mortgagePayment,
    homeValue,
    monthlyMaintenance
  };
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
