export const formatCurrency = (amount, currency = "INR") => {
  const formatOptions = {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  if (currency === "INR") {
    formatOptions.notation = "compact";
    formatOptions.compactDisplay = "short";
  }

  return new Intl.NumberFormat("en-IN", formatOptions).format(amount);
};
