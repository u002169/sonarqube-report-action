import axios from "axios";

export const getResultQG = async (analysisId, projectKey, sonarUrl, sonarToken) => {
    const api = `${sonarUrl}/api/qualitygates/project_status`
    const params = analysisId ? { analysisId } : { projectKey };
    
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

export const getDateAnalysis = async (analysisId, projectKey, sonarUrl, sonarToken) => {
    const api = `${sonarUrl}/api/project_analyses/search`
    const params = { "project": projectKey };
    let analysis;
    
    const response = await axios.get(api,
        {
            params,
            auth: {
                username: sonarToken,
                password: "",
            },
        });

    if (analysisId)
        analysis = response.data.analyses.find(analysis => analysis.key === analysisId);
    else
        analysis = response.data.analyses[0];

    return analysis;
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