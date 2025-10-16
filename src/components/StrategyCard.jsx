import React from 'react';
import { formatCurrency } from '../utils/mortgageCalculations';

export default function StrategyCard({
  title,
  strategy,
  enableRentalComparison,
  rentalData,
  mortgagePayment
}) {
  if (!strategy) return null;

  // Define colors for each strategy
  const getStrategyColors = (strategyTitle) => {
    switch (strategyTitle) {
      case 'Traditional Method':
        return {
          border: 'border-red-500',
          accent: 'text-red-600',
          bg: 'bg-red-50'
        };
      case 'Extra Principal Method':
        return {
          border: 'border-blue-500',
          accent: 'text-blue-600',
          bg: 'bg-blue-50'
        };
      case 'LOC Strategy':
        return {
          border: 'border-green-500',
          accent: 'text-green-600',
          bg: 'bg-green-50'
        };
      case 'Investment Strategy':
        return {
          border: 'border-purple-500',
          accent: 'text-purple-600',
          bg: 'bg-purple-50'
        };
      default:
        return {
          border: 'border-gray-500',
          accent: 'text-gray-600',
          bg: 'bg-gray-50'
        };
    }
  };

  const colors = getStrategyColors(title);

  const formatMonths = (months) => {
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);
    if (remainingMonths === 0) {
      return `${years} years`;
    }
    return `${years} years ${remainingMonths} months`;
  };

  const renderRentalSection = () => {
    if (!enableRentalComparison || !rentalData) return null;

    return (
      <>
        <div className="flex justify-between">
          <span className="text-gray-600">Home Value:</span>
          <span className="font-semibold text-green-600">{formatCurrency(strategy.finalHomeValue)}</span>
        </div>

        {/* Rental Subsection */}
        <div className="pt-2 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Rental</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Investment Gain:</span>
              <span className={`font-semibold ${rentalData.investmentGain >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(rentalData.investmentGain)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rent Cost:</span>
              <span className="font-semibold text-red-600">{formatCurrency(rentalData.totalRent)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Total:</span>
              <span className={`font-bold ${rentalData.total >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(rentalData.total)}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${colors.border}`}>
      <h3 className={`text-lg font-semibold mb-4 ${colors.accent}`}>{title}</h3>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Monthly Payment:</span>
          <span className={`font-semibold ${colors.accent}`}>
            {formatCurrency(title === 'Extra Principal Method' && strategy.effectiveMonthlyPayment ? strategy.effectiveMonthlyPayment : mortgagePayment)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Payoff Time:</span>
          <span className={`font-semibold ${colors.accent}`}>{formatMonths(strategy.months)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Mortgage Interest:</span>
          <span className="font-semibold text-red-600">{formatCurrency(strategy.totalInterest)}</span>
        </div>

        {strategy.totalLocInterest !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-600">LOC Interest:</span>
            <span className="font-semibold text-red-600">{formatCurrency(strategy.totalLocInterest)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Tax Savings:</span>
          <span className="font-semibold text-green-600">{formatCurrency(strategy.totalTaxSavings)}</span>
        </div>

        {strategy.investmentGain !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-600">Investment Gains:</span>
            <span className="font-semibold text-green-600">{formatCurrency(strategy.investmentGain)}</span>
          </div>
        )}

        {enableRentalComparison && (
          <div className="flex justify-between">
            <span className="text-gray-600">Total Maintenance:</span>
            <span className="font-semibold text-red-600">{formatCurrency(strategy.totalMaintenance)}</span>
          </div>
        )}

        <div className="flex justify-between pt-2 border-t border-gray-200">
          <span className="text-gray-700 font-medium">Net Cost:</span>
          <span className="font-bold text-red-700">{formatCurrency(strategy.netCost)}</span>
        </div>

        {renderRentalSection()}
      </div>
    </div>
  );
}
