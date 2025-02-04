import * as core from "@actions/core";
import { Table } from 'console-table-printer';
import { formatMetricKey, formatStringNumber, getComparatorSymbol, getStatusEmoji } from "./utils.js";

export const buildPrintReportConsole = async (analysisResult, analysisId, dateAnalysis, qualityGate, sourceAnalysed) => {
	const reportTable = new Table({
		charLength: { "🟢": 2, "🔴": 2, "🟡": 2, "❔": 2, "❌": 2 },
		columns: [
			{ name: "criterio", alignment: "left", title: "Critério" },
			{ name: "parecer", alignment: "center", title: "Parecer" },
			{ name: "resultado", alignment: "center", title: "Resultado" },
			{ name: "threshold", alignment: "center", title: "Threshold para Reprovação" },
		]
	});

	const rows = analysisResult.projectStatus.conditions.map((row) => {
		const newRow =
		{
			criterio: formatMetricKey(row.metricKey),
			parecer: getStatusEmoji(row.status),
			resultado: formatStringNumber(row.actualValue),
			threshold: `${getComparatorSymbol(row.comparator)} ${row.errorThreshold}`,
		}
		return newRow;
	});

	console.log("----------------------------------------------------------------");
	console.log("                        SonarQube Report                        ");
	console.log("----------------------------------------------------------------");
	console.log( `Data da análise: ${dateAnalysis}` )
	console.log( `ID da Análise: ${analysisId}` )
	console.log( `Quality Gate: ${qualityGate}` )
	console.log( `Fonte analisado: ${sourceAnalysed}` );
	reportTable.addRows(rows);
	reportTable.printTable();
};

export const buildPrintReportSummary = async (analysisResult, analysisId, dateAnalysis, qualityGate) => {
	let tableSummary = [];
	const header = [
		{ header: true, data: "Critério" },
		{ header: true, data: "Parecer" },
		{ header: true, data: "Resultado" },
		{ header: true, data: "Threshold para Reprovação" },
	];

	const rows = analysisResult.projectStatus.conditions.map((row) => {
		const newRow =
			[
				formatMetricKey(row.metricKey),
				getStatusEmoji(row.status),
				formatStringNumber(row.actualValue),
				`${getComparatorSymbol(row.comparator)} ${row.errorThreshold}`,
			]
		return newRow;
	})

	tableSummary.push(header);
	tableSummary = tableSummary.concat(rows);

	await core.summary
		.addHeading('SonarQube Report', 2)
		.addRaw( `Data da análise: ${dateAnalysis}` )
		.addBreak()
		.addRaw( `ID da Análise: ${analysisId}` )
		.addBreak()
		.addRaw( `Quality Gate: ${qualityGate}` )
		.addBreak()
		.addRaw( `Fonte analisado: ${sourceAnalysed}` )
		.addBreak()
		.addTable(tableSummary)
		//.addLink('View staging deployment!', 'https://github.com')
		.write();
};

export const buildReportPR = (analysisResult, analysisId, dateAnalysis, qualityGate, sonarUrl, projectKey, context) => {
	const reportUrl = '${sonarUrl}/dashboard?id=${projectKey}';
	const projectStatus = getStatusEmoji(analysisResult.projectStatus.status) + (analysisResult.projectStatus.status == "ERROR" ? "REPROVADO" : "OK");
	
	const resultTable = analysisResult.projectStatus.conditions.map((row) => {
		const rowValues = [
			formatMetricKey(row.metricKey), // Metric
			getStatusEmoji(row.status), // Status
			formatStringNumber(row.actualValue), // Value
			`${getComparatorSymbol(row.comparator)} ${row.errorThreshold}`, // Error Threshold
		];
		return "|" + rowValues.join("|") + "|";
	}).join("\n");

	const resultContext = [
		`- **Parecer**: ${projectStatus} `,
		`- **Data da análise**: ${dateAnalysis}`,
		analysisId ? `- **ID da Análise**: ${analysisId}`: "",
		`- **Quality Gate**: ${qualityGate}`,
		`- **Fonte analisado**: ${sourceAnalysed}`,
		//`- Solicitado por @${context.actor} on \`${context.eventName}\``,
	];

	const report =
		`## SonarQube Report\n` +
		`${resultContext.join("\n")}` +
		`\n \n` +
		`| Critério | Parecer | Resultado | Threshold para Reprovação |\n` +
		`|:--------:|:-------:|:---------:|:-------------------------:|\n` +
		`${resultTable}` +
		`\n \n` +
		`[Para análise detalhada, acesse o SonarQube](${reportUrl})\n` +
		`#### *No dash do Sonar abre na última análise, verifique se é o mesmo dia e horário da análise do report`;

	return report;
};
