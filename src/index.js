import * as core from "@actions/core";
import * as github from "@actions/github";
import { resultQG } from "./modules/api.js";
import { printReportConsole, printReportSummary, buildReportPR } from "./modules/report.js";

try {
    const projectKey = core.getInput('sonar-project-key') || "performa-neon.api-demo";
    const sonarUrl = core.getInput('sonar-host-url') || "https://sonarqube.in.devneon.com.br";
    const sonarToken = core.getInput('sonar-token') || "squ_a91a2ac9d5ba2164ba89058c5b12527205b2eb92";
    const githubToken = core.getInput('github-token')

    const analysisResult = await resultQG(projectKey, sonarUrl, sonarToken);
    //console.log(JSON.stringify(analysisResult,null,2));

    // Print report to console
    try {
        await printReportConsole(analysisResult);
    } catch (error) {
        console.log("----------- Error on buildReportConsole -----------");
        console.log(error);
    }

    //Print report to summary
    try {
        await printReportSummary(analysisResult);
    } catch (error) {
        console.log("----------- Error on buildReportSummary -----------");
        console.log(error);
    }

    //Print report to PR
    const isPR = github.context.eventName == "pull_request";
    if (isPR && githubToken) {
        const { context } = github;
        const octokit = github.getOctokit(githubToken);

        const reportBody = buildReportPR(analysisResult, sonarUrl, projectKey, context);
        //console.log(reportBody);
        
        await octokit.rest.issues.createComment({ owner: context.repo.owner, repo: context.repo.repo, issue_number: context.issue.number, body: reportBody });  

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
