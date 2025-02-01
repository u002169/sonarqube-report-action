import * as core from "@actions/core";
import { Table } from 'console-table-printer';

export const buildReportConsole = async (analysisResult) => {

	const reportTable = new Table({
		charLength: { "🟢": 1, "🔴": 1, "🟡": 1, "❔": 1},
		columns: [
			{ name: "criterio", alignment: "left", title: "Critério"},
			{ name: "parecer", alignment: "center", title: "Parecer" },
			{ name: "resultado", alignment: "center", title: "Resultado" },
			{ name: "threshold", alignment: "center", title: "Threshold" },
		]
	});

	const rows = analysisResult.projectStatus.conditions.map(buildRow);
	reportTable.addRows(rows);
	reportTable.printTable();
};

export const buildReportSummary = async (analysisResult) => {

	let tableSummary = [];

	const header = [
		{ header: true, data: "Critério" },
		{ header: true,	data: "Parecer" },
		{ header: true,	data: "Resultado" },
		{ header: true,	data: "Threshold" },
	];

	tableSummary.push(header);
	tableSummary = tableSummary.concat(analysisResult.projectStatus.conditions.map(buildRowSummary));

	await core.summary
		.addHeading('SonarQube Report')
		.addTable(tableSummary)
		//.addLink('View staging deployment!', 'https://github.com')
		.write();
};

const buildRowSummary = (row, tableSummary) => {
	const newRow =
	[
		formatMetricKey(row.metricKey),
		getStatusEmoji(row.status),
		formatStringNumber(row.actualValue),
		`${getComparatorSymbol(row.comparator)} ${row.errorThreshold}`,
	]
	return newRow;
};

const buildRow = (row) => {
	const newRow =
	{
		criterio: formatMetricKey(row.metricKey),
		parecer: getStatusEmoji(row.status),
		resultado: formatStringNumber(row.actualValue),
		threshold: `${getComparatorSymbol(row.comparator)} ${row.errorThreshold}`,
	}
	return newRow;
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
