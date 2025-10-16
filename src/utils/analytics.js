// Google Analytics utility functions
// Replace 'GA_MEASUREMENT_ID' with your actual Google Analytics Measurement ID

export const GA_MEASUREMENT_ID = 'G-H9VWYRXQSS';

// Track page views
export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track mortgage calculator specific events
export const trackMortgageEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'Mortgage Calculator',
      ...parameters,
    });
  }
};

// Specific tracking functions for mortgage calculator
export const trackStrategyComparison = (strategy) => {
  trackMortgageEvent('strategy_selected', {
    strategy_name: strategy,
    event_label: `Strategy: ${strategy}`,
  });
};

export const trackInputChange = (field, value) => {
  trackMortgageEvent('input_changed', {
    field_name: field,
    field_value: value,
    event_label: `${field}: ${value}`,
  });
};

export const trackRentalToggle = (enabled) => {
  trackMortgageEvent('rental_comparison_toggled', {
    rental_enabled: enabled,
    event_label: `Rental comparison ${enabled ? 'enabled' : 'disabled'}`,
  });
};

export const trackChartInteraction = (chartType) => {
  trackMortgageEvent('chart_interacted', {
    chart_type: chartType,
    event_label: `Chart: ${chartType}`,
  });
};
