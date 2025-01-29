import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

try {
    const projectKey = core.getInput('sonar-project-key');
    const sonarUrl = core.getInput('sonar-host-url');
    const sonarToken = core.getInput('sonar-token');

    const params = {
        projectKey
    };

    const analysisResult = axios.get(
        `${sonarUrl}/api/qualitygates/project_status`,
        {
          params,
          auth: {
            username: sonarToken,
            password: "",
          },
        }
    );

    console.log("quality-gate-result: " + JSON.stringify(analysisResult));
    
    
    console.log(`Project Key: ${projectKey}`);
    console.log(`Sonar URL: ${sonarUrl}`);
    console.log(`Sonar Token: ${sonarToken}`);

} catch (error) {
    core.setFailed(error.message);
}
