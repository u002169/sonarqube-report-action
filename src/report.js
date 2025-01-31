export const buildReportLog = (analysisResult, sonarUrl, projectKey, context) => {

	const resultTable = analysisResult.projectStatus.conditions.map(buildRow).join("\n");

	const report =
		"|----------------------------------------------------------------------------|\n" +
		"| Critério                         | Parecer      | Resultado    | Threshold |\n" +
		"|----------------------------------|--------------|--------------|-----------|\n" +
		resultTable + "\n" +
		"|----------------------------------------------------------------------------|\n";
  
	return report;
};

export const buildReportPR = (analysisResult, sonarUrl, projectKey, context) => {

	const reportUrl = '${sonarUrl}/dashboard?id=${projectKey}';
	const projectStatus = getStatusEmoji(analysisResult.projectStatus.status);
	const resultTable = analysisResult.projectStatus.conditions.map(buildRow).join("\n");

	const resultContext = [
		`- **Parecer final**: ${projectStatus}`,
		`- Solicitado por @${context.actor} on \`${context.eventName}\``,
	];

	const report =
		`### SonarQube Quality Gate Result
		${resultContext.join("\n")}
  
		| Metric | Status | Value | Error Threshold |
		|:------:|:------:|:-----:|:---------------:|
  		${resultTable}
  
		[Para análise detalhada, acesse o SonarQube](${reportUrl})
		#### *Direcionado para a última análise, verifique se é o mesmo dia e horário do report`;

	return report;
};


export const getStatusEmoji = (status) => {
	switch (status) {
		case "OK":
			return "🟢 OK";
		case "ERROR":
			return "🔴 REPROVADO";
		case "WARN":
			return "🟡 Warning";
		default: // "NONE" and others
			return "❔";
	}
}

const buildRow = (condition) => {
	const rowValues = [
		formatMetricKey(condition.metricKey), // Metric
		getStatusEmoji(condition.status), // Status
		formatStringNumber(condition.actualValue), // Value
		`${getComparatorSymbol(condition.comparator)} ${condition.errorThreshold}`, // Error Threshold
	];

	return "|" + rowValues.join("|") + "|";
};

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
