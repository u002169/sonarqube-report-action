import axios from "axios";

export const getTaskInfos = async (taskId, sonarUrl, sonarToken) => {
    const api = `${sonarUrl}/api/ce/task`
    const params = { "id": taskId };
    const response = await requestGet(api, params, sonarToken);
    return response.data;
};

export const getAnalysisResults = async (analysisId, sonarUrl, sonarToken) => {
    const api = `${sonarUrl}/api/qualitygates/project_status`
    const params = { analysisId };
    const response = await requestGet(api, params, sonarToken);
    return response.data;
};

export const getQualityGate = async (projectKey, sonarUrl, sonarToken) => {
    const api = `${sonarUrl}/api/qualitygates/get_by_project`
    const params = { "project": projectKey };
    const response = await requestGet(api, params, sonarToken);
    return response.data.qualityGate.name;
};

const requestGet = async (api, params, sonarToken) => {
    const response = await axios.get(api,
        {
            params,
            auth: {
                username: sonarToken,
                password: "",
            },
        });

    return response;
};

// export const getAnalysisInfos = async (analysisId, projectKey, sonarUrl, sonarToken) => {
//     const api = `${sonarUrl}/api/project_analyses/search`
//     const params = { "project": projectKey };
//     let analysis;
//     const response = request(api, params, sonarToken);

//     if (analysisId)
//         analysis = response.data.analyses.find(analysis => analysis.key === analysisId);
//     else
//         analysis = response.data.analyses[0];

//     return analysis;
// };
