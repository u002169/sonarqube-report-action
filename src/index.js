import * as core from "@actions/core";
import * as github from "@actions/github";
import { getResultQG, getDateAnalysis, getQualityGate } from "./modules/api.js";
import { buildPrintReportConsole, buildPrintReportSummary, buildReportPR } from "./modules/report.js";
import { printReportPR } from "./modules/print.js";

try {
    const analysisId = core.getInput('sonar-analysis-id') || "AZSCUMEmure-xcw1RbtP";
    const projectKey = core.getInput('sonar-project-key') || "performa-neon.api-demo";
    const sonarUrl = core.getInput('sonar-host-url') || "https://sonarqube.in.devneon.com.br";
    const sonarToken = core.getInput('sonar-token') || "squ_a91a2ac9d5ba2164ba89058c5b12527205b2eb92";
    const githubToken = core.getInput('github-token')

    const analysisResult = await getResultQG(analysisId, projectKey, sonarUrl, sonarToken);
    const dateAnalysis = await getDateAnalysis(analysisId, projectKey, sonarUrl, sonarToken);
    console.log(`Analysis Date: ${dateAnalysis}`);
    const qualityGate = await getQualityGate(projectKey, sonarUrl, sonarToken);
    console.log(`Quality Gate: ${qualityGate}`);

    //console.log(JSON.stringify(analysisResult,null,2));

    // Print report to console
    try {
        await buildPrintReportConsole(analysisResult, analysisId, dateAnalysis, qualityGate);
    } catch (error) {
        console.log("----------- Error on buildReportConsole -----------");
        console.log(error);
    }

    //Print report to summary
    try {
        await buildPrintReportSummary(analysisResult, analysisId, dateAnalysis, qualityGate);
    } catch (error) {
        console.log("----------- Error on buildReportSummary -----------");
        console.log(error);
    }

    //Print report to PR
    const isPR = github.context.eventName == "pull_request";
    if (isPR && githubToken) {
        const { context } = github;

        const reportBody = buildReportPR(analysisResult, analysisId, dateAnalysis, qualityGate, sonarUrl, projectKey, context);
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
