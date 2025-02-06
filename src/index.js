import * as core from "@actions/core";
import * as github from "@actions/github";
import { getTaskInfos, getAnalysisResults, getQualityGate } from "./modules/api.js";
import { buildPrintReportConsole, buildPrintReportSummary, buildReportPR } from "./modules/report.js";
import { printReportPR } from "./modules/print.js";
import { sourceAnalysedMsg } from "./modules/utils.js";

try {
    const taskId = (core.getInput('sonar-task-id') || process.env["sonar-task-id"]).trim();
    const projectKey = (core.getInput('sonar-project-key') || process.env["sonar-project-key"]).trim();
    const sonarUrl = (core.getInput('sonar-host-url') || process.env["sonar-host-url"]).trim();
    const sonarToken = (core.getInput('sonar-token') || process.env["sonar-token"]).trim();
    const githubToken = core.getInput('github-token');

    //API analysis task infos
    const taskInfos = await getTaskInfos(taskId, sonarUrl, sonarToken);
    const analysisId = taskInfos.task.analysisId;
    const analysisDate = new Date(taskInfos.task.executedAt).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    console.log(`AnalysisId: ${analysisId}; analysisDate: ${analysisDate}`);

    //API analysis results by conditions and status
    const analysisResults = await getAnalysisResults(analysisId, sonarUrl, sonarToken);
    const sourceAnalysed = sourceAnalysedMsg(analysisResults);
    console.log(`AnalysisStatus: ${analysisResults.projectStatus.status}`);
    
    //API current project quality gate
    const qualityGate = await getQualityGate(projectKey, sonarUrl, sonarToken);
    console.log(`QualityGate: ${qualityGate}`);
    
    const dashSonar = `${sonarUrl}/dashboard?id=${projectKey}`;
    
    // Print report to console
    try {
        await buildPrintReportConsole(analysisResults, analysisId, analysisDate, qualityGate, sourceAnalysed, dashSonar);
    } catch (error) {
        console.log("!!!!!!!!!!!! Error on buildReportConsole !!!!!!!!!!!!");
        console.log(error);
    }

    //Print report to summary
    try {
        await buildPrintReportSummary(analysisResults, analysisId, analysisDate, qualityGate, sourceAnalysed, dashSonar);
    } catch (error) {
        console.log("!!!!!!!!!!!! Error on buildReportSummary !!!!!!!!!!!!");
        console.log(error);
    }

    //Print report to PR
    const isPR = github.context.eventName == "pull_request";
    if (isPR && githubToken) {
        const { context } = github;

        const reportBody = buildReportPR(analysisResults, analysisId, analysisDate, qualityGate, sourceAnalysed, dashSonar);

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
//console.log("taskInfos: " + JSON.stringify(taskInfos,null,2));