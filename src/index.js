import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";
import { buildReportLog } from "./report.js";

import { printTable } from 'console-table-printer';
import { Table } from 'console-table-printer';

try {
    const projectKey = core.getInput('sonar-project-key') || "performa-neon.api-demo";
    const sonarUrl = core.getInput('sonar-host-url') || "https://sonarqube.in.devneon.com.br";
    const sonarToken = core.getInput('sonar-token') || "squ_a91a2ac9d5ba2164ba89058c5b12527205b2eb92";

    core.inpu

    let api = `${sonarUrl}/api/qualitygates/project_status` 
    const params = { projectKey };

    const response = await axios.get( api, 
                { params ,
                  auth: {
                      username: sonarToken,
                      password: "",
                },});
    const analysisResult = response.data;
    //console.log(JSON.stringify(analysisResult,null,2));
    const { context } = github;
    
    const reportBody = buildReportLog( analysisResult, sonarUrl, projectKey, context );

    console.log("reportBody: ")
    console.table(reportBody);

    
        
    console.log(`Project Key: ${projectKey}`);
    console.log(`Sonar URL: ${sonarUrl}`);
    console.log(`Sonar Token: ${sonarToken}`);



    //Create a table
    const testCases = [
    { Rank: 3, text: 'I would like some Yellow', value: 100 },
    { Rank: 4, text: 'I hope batch update is working', value: 300 },
    ];

    testCases.push({ Rank: 5, text: 'I hope batch update is working', value: 300 });

    //print
    printTable(testCases);


    //Create a table
    const p = new Table();

    // add rows with color
    p.addRow({ Record: 'a', text: 'red wine please', value: 10.212 });
    p.addRow({ Record: 'b', text: 'green gemuse please', value: 20.0 });
    p.addRows([
    // adding multiple rows are possible
    { Record: 'c', text: 'gelb bananen bitte', value: 100 },
    { Record: 'd', text: 'update is working', value: 300 },
    ]);

    //print
    p.printTable();

} catch (error) {
    core.setFailed(error.message);
}
