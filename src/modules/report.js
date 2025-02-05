import * as core from "@actions/core";
import { Table } from 'console-table-printer';
import { formatMetricKey, formatStringNumber, getComparatorSymbol, getStatusEmoji, getStatusAnalysis, getTypeMetric } from "./utils.js";
const  linkGuiaSonar='https://neon.go/sonar-guia';

export const buildPrintReportConsole = async (analysisResult, analysisId, dateAnalysis, qualityGate, sourceAnalysed, dashSonar) => {
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
			threshold: `${getComparatorSymbol(row.comparator)} ${row.errorThreshold} ${getTypeMetric(row.metricKey)}`,
		}
		return newRow;
	});

	console.log("");
	console.log("------------------------------------------------------------------------------------------");
	console.log("                                     SonarQube Report                                     ");
	console.log("------------------------------------------------------------------------------------------");
	console.log( `Parecer: ${ getStatusAnalysis( analysisResult.projectStatus.status ) }` )
	if ( analysisResult.projectStatus.status == "ERROR" ){
		console.log( `💡 Acesse o guia para identificar a causa da reprovação: 💡` );
		console.log( `${linkGuiaSonar}` );      
	}  
	console.log( `Dashboard de análise no Sonar:` )
    	console.log( `${dashSonar}` );

	reportTable.addRows(rows);
	reportTable.printTable();

	console.log( `Data da análise: ${dateAnalysis}` )
	console.log( `ID: ${analysisId}` )
	console.log( `Quality Gate: ${qualityGate}` )
	console.log( `Fonte analisado: ${sourceAnalysed}` );
	console.log("------------------------------------------------------------------------------------------");
	console.log("");
};

export const buildPrintReportSummary = async (analysisResult, analysisId, dateAnalysis, qualityGate, sourceAnalysed, dashSonar) => {
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
				`${getComparatorSymbol(row.comparator)} ${row.errorThreshold} ${getTypeMetric(row.metricKey)}`,
			]
		return newRow;
	})

	tableSummary.push(header);
	tableSummary = tableSummary.concat(rows);

	await core.summary
		.addHeading('SonarQube Report', 2)
		.addRaw( `Parecer: ${ getStatusAnalysis( analysisResult.projectStatus.status ) }` )
		.addBreak();
	if ( analysisResult.projectStatus.status == "ERROR" ){
		await core.summary.addRaw( `💡 Acesse o guia para identificar a causa da reprovação: 💡` )
		.addBreak();
	}
	await core.summary
		.addLink( `${linkGuiaSonar}` )
		.addBreak()
		.addRaw( `Dashboard de análise no Sonar:` )
		.addBreak()
		.addLink( `${dashSonar}` )
		.addBreak()

		.addTable(tableSummary)

		.addRaw( `Data da análise: ${dateAnalysis}` )
		.addBreak()
		.addRaw( `ID: ${analysisId}`, true )
		.addBreak()
		.addRaw( `Quality Gate: ${qualityGate}` )
		.addBreak()
		.addRaw( `Fonte analisado: ${sourceAnalysed}` )
		//.addLink('View staging deployment!', 'https://github.com')
		.write();
};

export const buildReportPR = (analysisResult, analysisId, dateAnalysis, qualityGate, sourceAnalysed, dashSonar) => {
	const resultTable = analysisResult.projectStatus.conditions.map((row) => {
		const rowValues = [
			formatMetricKey(row.metricKey),
			getStatusEmoji(row.status),
			formatStringNumber(row.actualValue), 
			`${getComparatorSymbol(row.comparator)} ${row.errorThreshold} ${getTypeMetric(row.metricKey)}`,
		];
		return "|" + rowValues.join("|") + "|";
	}).join("\n");

	let report =
		`## SonarQube Report\n` +
		`**Parecer: ${ getStatusAnalysis( analysisResult.projectStatus.status ) }**\n`;
	if ( analysisResult.projectStatus.status == "ERROR" ){
		report +=
		`💡 Acesse o guia para identificar a causa da reprovação: 💡\n` +
		`${linkGuiaSonar}\n`;
	}
	report +=
		`Dashboard de análise no Sonar:\n` +
		`${dashSonar}\n` +
		`\n`+
		
		`| Critério | Parecer | Resultado | Threshold para Reprovação |\n` +
		`|:--------:|:-------:|:---------:|:-------------------------:|\n` +
		`${resultTable}` +
		
		`\n \n` +
		`Data da análise: ${dateAnalysis}\n` +
		`ID: ${analysisId}\n` +
		`Quality Gate: ${qualityGate}\n` +
		`Fonte analisado: ${sourceAnalysed}\n`
		//`- Solicitado por @${context.actor} on \`${context.eventName}\``,
		//`#### *No dash do Sonar abre na última análise, verifique se é o mesmo dia e horário da análise do report`;

	return report;
};
