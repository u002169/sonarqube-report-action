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
    if (!taskInfos.task.analysisId || !taskInfos.task.executedAt) 
        throw new Error(`Result taskInfos invalid: ${JSON.stringify(taskInfos,null,2)}`);
    const analysisId = taskInfos.task.analysisId;
    const analysisDate = new Date(taskInfos.task.executedAt).toLocaleString().replace(/T/, ' ').replace(/\..+/, '');

    //API analysis results by conditions and status
    const analysisResults = await getAnalysisResults(analysisId, sonarUrl, sonarToken);
    if (!analysisResults.projectStatus.status || !analysisResults.projectStatus.conditions) 
        throw new Error(`Result analysisResults invalid: ${JSON.stringify(analysisResults,null,2)}`);
    const sourceAnalysed = sourceAnalysedMsg(analysisResults);
    
    //API current project quality gate
    let qualityGate = await getQualityGate(projectKey, sonarUrl, sonarToken);
    if (!qualityGate.qualityGate.name) 
        throw new Error(`Result qualityGate invalid: ${JSON.stringify(qualityGate,null,2)}`);
    qualityGate = qualityGate.qualityGate.name;
    
    const dashSonar = `${sonarUrl}/dashboard?id=${projectKey}`;
    
    // Print report to console
    try {
        await buildPrintReportConsole(analysisResults, analysisId, analysisDate, qualityGate, sourceAnalysed, dashSonar);
    } catch (error) {
        console.log("********* Error on ReportConsole *********");
        console.log(error);
    }

    //Print report to summary
    try {
        await buildPrintReportSummary(analysisResults, analysisId, analysisDate, qualityGate, sourceAnalysed, dashSonar);
    } catch (error) {
        console.log("********* Error on ReportSummary *********");
        console.log(error);
    }

    //Print report to PR
    try {
        const isPR = github.context.eventName == "pull_request";
        if (isPR) {
            const { context } = github;
            const reportBody = buildReportPR(analysisResults, analysisId, analysisDate, qualityGate, sourceAnalysed, dashSonar);
            await printReportPR(reportBody, context, githubToken);
        }
    } catch (error) {
        console.log("********* Error on ReportPR *********");
        console.log(error);
    }

    if (analysisResults.projectStatus.status === "ERROR") {
        let resultMessage = `Reprovado na avaliação do Quality Gate no SonarQube.`;
        core.setFailed(resultMessage);
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
