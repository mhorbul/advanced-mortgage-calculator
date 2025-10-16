import React from 'react';
import { formatCurrency } from '../utils/mortgageCalculations';

export default function BestStrategyBanner({ bestStrategy }) {
  if (!bestStrategy) return null;

  // Get the actual netCost from the strategy name
  const getNetCost = (strategyName) => {
    // This will be passed from the parent component
    return Math.abs(bestStrategy.netWorth); // netWorth is negative netCost
  };

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
      <h2 className="text-2xl font-bold mb-2">Best Strategy: {bestStrategy.name}</h2>
      <div className="text-lg">
        Net Cost: <span className="font-bold text-3xl">{formatCurrency(getNetCost(bestStrategy.name))}</span>
      </div>
      <div className="text-sm mt-2 text-green-100">
        {bestStrategy.name === 'Invest & Pay'
          ? 'Investment gains exceed interest costs!'
          : 'Minimizes total interest paid'}
      </div>
    </div>
  );
}
