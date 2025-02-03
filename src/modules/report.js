import * as core from "@actions/core";
import { Table } from 'console-table-printer';
import { formatMetricKey, formatStringNumber, getComparatorSymbol, getStatusEmoji } from "./utils.js";

export const buildPrintReportConsole = async (analysisResult) => {

	const reportTable = new Table({
		charLength: { "🟢": 3, "🔴": 3, "🟡": 3, "❔": 3},
		columns: [
			{ name: "criterio", alignment: "left", title: "Critério"},
			{ name: "parecer", alignment: "center", title: "Parecer" },
			{ name: "resultado", alignment: "center", title: "Resultado" },
			{ name: "threshold", alignment: "center", title: "Threshold para Reprovação" },
		]
	});

	const rows = analysisResult.projectStatus.conditions.map(buildRowConsole);
	reportTable.addRows(rows);
	reportTable.printTable();
};

const buildRowConsole = (row) => {
	const newRow =
	{
		criterio: formatMetricKey(row.metricKey),
		parecer: getStatusEmoji(row.status),
		resultado: formatStringNumber(row.actualValue),
		threshold: `${getComparatorSymbol(row.comparator)} ${row.errorThreshold}`,
	}
	return newRow;
};

export const buildPrintReportSummary = async (analysisResult) => {

	let tableSummary = [];

	const header = [
		{ header: true, data: "Critério" },
		{ header: true,	data: "Parecer" },
		{ header: true,	data: "Resultado" },
		{ header: true,	data: "Threshold para Reprovação" },
	];

	tableSummary.push(header);
	tableSummary = tableSummary.concat(analysisResult.projectStatus.conditions.map(buildRowSummary));

	await core.summary
		.addHeading('SonarQube Report')
		.addTable(tableSummary)
		//.addLink('View staging deployment!', 'https://github.com')
		.write();
};

const buildRowSummary = (row) => {
	const newRow =
	[
		formatMetricKey(row.metricKey),
		getStatusEmoji(row.status),
		formatStringNumber(row.actualValue),
		`${getComparatorSymbol(row.comparator)} ${row.errorThreshold}`,
	]
	return newRow;
};

export const buildReportPR = (analysisResult, sonarUrl, projectKey, context ) => {
	const reportUrl = '${sonarUrl}/dashboard?id=${projectKey}';
	const projectStatus = getStatusEmoji(analysisResult.projectStatus.status) + analysisResult.projectStatus.status == "ERROR" ? "REPROVADO" : "";
	const resultTable = analysisResult.projectStatus.conditions.map(buildRowPR).join("\n");

	const resultContext = [
		`- **Parecer**: ${projectStatus} `,
		//`- **Data da análise**: ${analysisResult.projectStatus.analysisDate}`,
		`- Solicitado por @${context.actor} on \`${context.eventName}\``,
	];

	const report =
		`### SonarQube Report\n` +
		`${resultContext.join("\n")}` + 
		`\n \n` +
		
		`| Critério | Parecer | Resultado | Threshold para Reprovação |\n` +
		`|:--------:|:-------:|:---------:|:-------------------------:|\n` +
  		`${resultTable}` +
		
  		`\n \n` +
		`[Para análise detalhada, acesse o SonarQube](${reportUrl})\n` +
		`#### *Direcionado para a última análise, verifique se é o mesmo dia e horário do report`;

	return report;
};

const buildRowPR= (row) => {
	const rowValues = [
	  formatMetricKey(row.metricKey), // Metric
	  getStatusEmoji(row.status), // Status
	  formatStringNumber(row.actualValue), // Value
	  `${getComparatorSymbol(row.comparator)} ${row.errorThreshold}`, // Error Threshold
	];
  
	return "|" + rowValues.join("|") + "|";
  };



