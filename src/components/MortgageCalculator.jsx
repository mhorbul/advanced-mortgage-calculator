import React, { useState, useMemo, useEffect } from 'react';
import { trackPageView, trackStrategyComparison } from '../utils/analytics';
import { calculateMortgageStrategies } from '../utils/mortgageCalculations';
import InputForm from './InputForm';
import BestStrategyBanner from './BestStrategyBanner';
import StrategyCard from './StrategyCard';
import ChartsSection from './ChartsSection';

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

  // Track page view on component mount
  useEffect(() => {
    trackPageView('/mortgage-calculator');
  }, []);

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
    return calculateMortgageStrategies(inputs);
  }, [inputs]);

  // Track best strategy changes
  useEffect(() => {
    if (calculations && calculations.bestStrategy) {
      trackStrategyComparison(calculations.bestStrategy.name);
    }
  }, [calculations?.bestStrategy?.name]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mortgage Payoff Strategy Calculator</h1>
          <p className="text-lg text-gray-600">
            Compare different mortgage payoff strategies and find the best approach for your financial situation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <InputForm
              inputs={inputs}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Best Strategy Banner */}
            <BestStrategyBanner bestStrategy={calculations.bestStrategy} />

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StrategyCard
                title="Traditional Method"
                strategy={calculations.traditional}
                enableRentalComparison={inputs.enableRentalComparison}
                rentalData={calculations.rental?.traditional}
                mortgagePayment={calculations.mortgagePayment}
              />

              <StrategyCard
                title="Extra Principal Method"
                strategy={calculations.extraPayment}
                enableRentalComparison={inputs.enableRentalComparison}
                rentalData={calculations.rental?.extraPayment}
                mortgagePayment={calculations.mortgagePayment}
              />

              <StrategyCard
                title="LOC Strategy"
                strategy={calculations.accelerated}
                enableRentalComparison={inputs.enableRentalComparison}
                rentalData={calculations.rental?.accelerated}
                mortgagePayment={calculations.mortgagePayment}
              />

              <StrategyCard
                title="Investment Strategy"
                strategy={calculations.investment}
                enableRentalComparison={inputs.enableRentalComparison}
                rentalData={calculations.rental?.investment}
                mortgagePayment={calculations.mortgagePayment}
              />
            </div>

            {/* Charts Section */}
            <ChartsSection calculations={calculations} />
          </div>
        </div>
      </div>
    </div>
  );
}