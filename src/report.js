import * as core from "@actions/core";
import { Table } from 'console-table-printer';

export const buildReportConsole = async (analysisResult) => {

	const reportTable = new Table({
		columns: [
			{
				name: "metricKey",
				alignment: "left",
				title: "Critério"
			},
			{
				name: "status",
				alignment: "center",
				title: "Parecer"
			},
			{
				name: "actualValue",
				alignment: "center",
				title: "Resultado"
			},
			{
				name: "errorThreshold",
				alignment: "center",
				title: "Threshold"
			},
		],
	});

	const rows = analysisResult.projectStatus.conditions.map(buildRow);
	reportTable.addRows(rows);
	reportTable.printTable();
};

export const buildReportSummary = async (analysisResult) => {

	const header = [
		{
			header: true,
			data: "Critério"
		},
		{
			header: true,
			data: "Parecer"
		},
		{
			header: true,
			data: "Resultado"
		},
		{
			header: true,
			data: "Threshold"
		},
	];

	const rows = analysisResult.projectStatus.conditions.map(buildRow);

	await core.summary
		.addHeading('SonarQube Report')
		.addTable([
			header,
			rows
		])
		.write()
};

const buildRow = (row) => {
	const newRow =
	{
		metricKey: formatMetricKey(row.metricKey),
		status: getStatusEmoji(row.status),
		actualValue: formatStringNumber(row.actualValue),
		errorThreshold: `${getComparatorSymbol(row.comparator)} ${row.errorThreshold}`,
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
