export const getStatusEmoji = (status) => {
	switch (status) {
		case "OK":
			return "🟢";
		case "ERROR":
			return "🔴";
		case "WARN":
			return "🟡";
		default:
			return "❔";
	}
}

export const formatMetricKey = (metricKey) => {
	const replacedString = metricKey.replace(/_/g, " ");
	return replacedString.charAt(0).toUpperCase() + replacedString.slice(1);
};

export const formatStringNumber = (value) => {
	const floatValue = parseFloat(value);
	const isValueInteger = floatValue % 1 === 0;
	return isValueInteger ? floatValue.toFixed(0) : floatValue.toFixed(2);
};

export const getComparatorSymbol = (comparator) => {
	switch (comparator) {
		case "GT":
			return ">";
		case "LT":
			return "<";
		default:
			return "";
	}
};