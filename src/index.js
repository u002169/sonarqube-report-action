import * as core from "@actions/core";
import * as github from "@actions/github";
import { getAnalysisInfos, getAnalysisResults, getQualityGate } from "./modules/api.js";
import { buildPrintReportConsole, buildPrintReportSummary, buildReportPR } from "./modules/report.js";
import { printReportPR } from "./modules/print.js";
import { sourceAnalysedMsg } from "./modules/utils.js";

try {
    const taskId = core.getInput('sonar-task-id') || process.env["sonar-task-id"];
    const projectKey = core.getInput('sonar-project-key') || process.env["sonar-project-key"];
    const sonarUrl = core.getInput('sonar-host-url') || process.env["sonar-host-url"];
    const sonarToken = core.getInput('sonar-token') || process.env["sonar-token"];
    const githubToken = core.getInput('github-token');

    const taskInfos = await getTaskInfos(taskId, sonarUrl, sonarToken);
    const analysisId = taskInfos.analysisId;
    const analysisResults = await getAnalysisResults(analysisId, sonarUrl, sonarToken);
    const qualityGate = await getQualityGate(projectKey, sonarUrl, sonarToken);
    
    const analysisDate = new Date(taskInfos.executedAt).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const dashSonar = `${sonarUrl}/dashboard?id=${projectKey}`;
    const sourceAnalysed = sourceAnalysedMsg(analysisResults);

    console.log("CHEGUEI AQUI");

    // Print report to console
    try {
        await buildPrintReportConsole(analysisResults, analysisKey, analysisDate, qualityGate, sourceAnalysed, dashSonar);
    } catch (error) {
        console.log("!!!!!!!!!!!! Error on buildReportConsole !!!!!!!!!!!!");
        console.log(error);
    }

    //Print report to summary
    try {
        await buildPrintReportSummary(analysisResults, analysisKey, analysisDate, qualityGate, sourceAnalysed, dashSonar);
    } catch (error) {
        console.log("!!!!!!!!!!!! Error on buildReportSummary !!!!!!!!!!!!");
        console.log(error);
    }

    //Print report to PR
    const isPR = github.context.eventName == "pull_request";
    if (isPR && githubToken) {
        const { context } = github;

        const reportBody = buildReportPR(analysisResults, analysisKey, analysisDate, qualityGate, sourceAnalysed, dashSonar);

        await printReportPR(reportBody, context, githubToken);

        if (analysisResults.projectStatus.status === "ERROR") {
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
