import * as core from "@actions/core";
import * as github from "@actions/github";
import { resultQG } from "./api.js";
import { buildReportConsole, buildReportSummary } from "./report.js";



try {
    const projectKey = core.getInput('sonar-project-key') || "performa-neon.api-demo";
    const sonarUrl = core.getInput('sonar-host-url') || "https://sonarqube.in.devneon.com.br";
    const sonarToken = core.getInput('sonar-token') || "squ_a91a2ac9d5ba2164ba89058c5b12527205b2eb92";

    const analysisResult = await resultQG(projectKey, sonarUrl, sonarToken);
    //console.log(JSON.stringify(analysisResult,null,2));

    await buildReportConsole(analysisResult);
    await buildReportSummary(analysisResult);
    


    const { context } = github;



} catch (error) {
    core.setFailed(error.message);
}
