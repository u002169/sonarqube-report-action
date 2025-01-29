import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

try {
    const projectKey = core.getInput('sonar-project-key');
    const sonarUrl = core.getInput('sonar-host-url');
    const sonarToken = core.getInput('sonar-token');

    let api = `${sonarUrl}/api/qualitygates/project_status` 
    const params = { projectKey };

    const response = await axios.get( api, 
                    {
                        { projectKey } ,
                      auth: {
                        username: sonarToken,
                        password: "",
                      },
                    });
    const analysisResult = response.data;
    
    console.log("quality-gate-result: " + JSON.stringify(analysisResult));
    
    
    console.log(`Project Key: ${projectKey}`);
    console.log(`Sonar URL: ${sonarUrl}`);
    console.log(`Sonar Token: ${sonarToken}`);

} catch (error) {
    core.setFailed(error.message);
}
