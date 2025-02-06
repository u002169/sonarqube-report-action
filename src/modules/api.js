import axios from "axios";

export const getTaskInfos = async (taskId, sonarUrl, sonarToken) => {
    const api = `${sonarUrl}/api/ce/task`
    const params = { "id": taskId };
    
    const response = await axios.get(api,
        {
            params,
            auth: {
                username: sonarToken,
                password: "",
            },
        });

    console.log(JSON.stringify(response,null,2));

    return response.data;
};

export const getAnalysisResults = async (analysisId, sonarUrl, sonarToken) => {
    const api = `${sonarUrl}/api/qualitygates/project_status`
    const params = { analysisId };
    
    const response = await axios.get(api,
        {
            params,
            auth: {
                username: sonarToken,
                password: "",
            },
        });
    return response.data;
};



export const getQualityGate = async (projectKey, sonarUrl, sonarToken) => {
    const api = `${sonarUrl}/api/qualitygates/get_by_project`
    const params = { "project": projectKey };
    
    const response = await axios.get(api,
        {
            params,
            auth: {
                username: sonarToken,
                password: "",
            },
        });

    return response.data.qualityGate.name;
};

// export const getAnalysisInfos = async (analysisId, projectKey, sonarUrl, sonarToken) => {
//     const api = `${sonarUrl}/api/project_analyses/search`
//     const params = { "project": projectKey };
//     let analysis;
    
//     const response = await axios.get(api,
//         {
//             params,
//             auth: {
//                 username: sonarToken,
//                 password: "",
//             },
//         });

//     if (analysisId)
//         analysis = response.data.analyses.find(analysis => analysis.key === analysisId);
//     else
//         analysis = response.data.analyses[0];

//     return analysis;
// };
