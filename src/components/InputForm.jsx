import React from 'react';
import { trackInputChange, trackRentalToggle } from '../utils/analytics';

export default function InputForm({ inputs, onInputChange, onCheckboxChange }) {
  const handleInputChange = (field, value) => {
    onInputChange(field, value);
    
    // Track input changes
    trackInputChange(field, value);
  };

  const handleCheckboxChange = (field, checked) => {
    onCheckboxChange(field, checked);

    // Track rental comparison toggle
    if (field === 'enableRentalComparison') {
      trackRentalToggle(checked);
    }
  };

  // Calculate validation warning
  const mortgagePayment = inputs.mortgageBalance && inputs.mortgageRate && inputs.mortgageYears
    ? (inputs.mortgageBalance * (inputs.mortgageRate / 100 / 12) * Math.pow(1 + inputs.mortgageRate / 100 / 12, inputs.mortgageYears * 12)) /
      (Math.pow(1 + inputs.mortgageRate / 100 / 12, inputs.mortgageYears * 12) - 1)
    : 0;

  const homeValue = inputs.mortgageBalance ? inputs.mortgageBalance / 0.8 : 0;
  const monthlyMaintenance = homeValue * (inputs.maintenanceRate / 100 / 12);
  const totalCosts = (inputs.monthlyExpenses || 0) + mortgagePayment + monthlyMaintenance;
  const costExceedsIncome = totalCosts > (inputs.monthlyIncome || 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">Mortgage Calculator Inputs</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mortgage Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">Mortgage Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mortgage Balance ($)
            </label>
            <input
              type="number"
              value={inputs.mortgageBalance}
              onChange={(e) => handleInputChange('mortgageBalance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="240000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.mortgageRate}
              onChange={(e) => handleInputChange('mortgageRate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term (years)
            </label>
            <input
              type="number"
              value={inputs.mortgageYears}
              onChange={(e) => handleInputChange('mortgageYears', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-5"
              placeholder="30"
            />
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">Financial Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Income ($)
            </label>
            <input
              type="number"
              value={inputs.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Expenses ($)
              <br />
              <span className="text-xs text-gray-500">(excluding mortgage & maintenance)</span>
            </label>
            <input
              type="number"
              value={inputs.monthlyExpenses}
              onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                costExceedsIncome ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="8000"
            />
            {costExceedsIncome && (
              <p className="text-red-600 text-xs mt-1">
                ⚠️ Total costs exceed income! Expenses + Mortgage + Maintenance = ${totalCosts.toLocaleString()} &gt; ${(inputs.monthlyIncome || 0).toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              value={inputs.taxRate}
              onChange={(e) => handleInputChange('taxRate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="22"
            />
          </div>
        </div>

        {/* Strategy Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">Strategy Options</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LOC Limit ($)
            </label>
            <input
              type="number"
              value={inputs.locLimit}
              onChange={(e) => handleInputChange('locLimit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LOC Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.locRate}
              onChange={(e) => handleInputChange('locRate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Return (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.investmentReturn}
              onChange={(e) => handleInputChange('investmentReturn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="8"
            />
          </div>
        </div>
      </div>

      {/* Maintenance Rate */}
      <div className="mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maintenance Rate (% of home value per year)
          </label>
          <input
            type="number"
            step="0.1"
            value={inputs.maintenanceRate}
            onChange={(e) => handleInputChange('maintenanceRate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1.5"
          />
        </div>
      </div>

      {/* Rental Comparison */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="enableRentalComparison"
            checked={inputs.enableRentalComparison}
            onChange={(e) => handleCheckboxChange('enableRentalComparison', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enableRentalComparison" className="text-sm font-medium text-gray-700">
            Enable Rental Comparison
          </label>
        </div>

        {inputs.enableRentalComparison && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Appreciation Rate (% per year)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.homeAppreciationRate}
                onChange={(e) => handleInputChange('homeAppreciationRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rental Discount (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.rentalDiscountPercent}
                onChange={(e) => handleInputChange('rentalDiscountPercent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
