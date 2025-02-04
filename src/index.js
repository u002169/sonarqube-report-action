import * as core from "@actions/core";
import * as github from "@actions/github";
import { getResultQG, getDateAnalysis, getQualityGate } from "./modules/api.js";
import { buildPrintReportConsole, buildPrintReportSummary, buildReportPR } from "./modules/report.js";
import { printReportPR } from "./modules/print.js";
import { sourceAnalysedMsg } from "./modules/utils.js";

try {
    const analysisId = core.getInput('sonar-analysis-id') || process.env["sonar-analysis-id"] ? process.env["sonar-analysis-id"].trim() : null;
    const projectKey = core.getInput('sonar-project-key') || process.env["sonar-project-key"].trim();
    const sonarUrl = core.getInput('sonar-host-url') || process.env["sonar-host-url"].trim();
    const sonarToken = core.getInput('sonar-token') || process.env["sonar-token"].trim();
    const githubToken = core.getInput('github-token');

    // console.log(`Analysis ID: ${analysisId}`);
    // console.log(`Project Key: ${projectKey}`);
    // console.log(`SonarQube URL: ${sonarUrl}`);
    // console.log(`SonarQube Token: ${sonarToken}`);

    const analysisResult = await getResultQG(analysisId, projectKey, sonarUrl, sonarToken);
    //console.log(JSON.stringify(analysisResult,null,2));
    const dateAnalysis = await getDateAnalysis(analysisId, projectKey, sonarUrl, sonarToken);
    //console.log(`Analysis Date: ${dateAnalysis}`);
    const qualityGate = await getQualityGate(projectKey, sonarUrl, sonarToken);
    //console.log(`Quality Gate: ${qualityGate}`);
    const sourceAnalysed = sourceAnalysedMsg(analysisResult);
    console.log(`Source Analysed: ${sourceAnalysed}`);

    // Print report to console
    try {
        await buildPrintReportConsole(analysisResult, analysisId, dateAnalysis, qualityGate, sourceAnalysed);
    } catch (error) {
        console.log("----------- Error on buildReportConsole -----------");
        console.log(error);
    }

    //Print report to summary
    try {
        await buildPrintReportSummary(analysisResult, analysisId, dateAnalysis, qualityGate, sourceAnalysed);
    } catch (error) {
        console.log("----------- Error on buildReportSummary -----------");
        console.log(error);
    }

    //Print report to PR
    const isPR = github.context.eventName == "pull_request";
    if (isPR && githubToken) {
        const { context } = github;

        const reportBody = buildReportPR(analysisResult, analysisId, dateAnalysis, qualityGate, sourceAnalysed, sonarUrl, projectKey, context);
        //console.log(reportBody);

        await printReportPR(reportBody, context, githubToken);

        if (analysisResult.projectStatus.status === "ERROR") {
            let resultMessage = `Reprovado na avaliação do Quality Gate no SonarQube.`;
            console.error(resultMessage);
            core.setFailed(resultMessage);
        }
    }

} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
        core.setFailed(error.message);
    } else {
        console.error("Unexpected error");
        core.setFailed("Unexpected error");
    }
}
