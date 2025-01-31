import axios from "axios";

export const resultQG = async (projectKey, sonarUrl, sonarToken) => {
    const api = `${sonarUrl}/api/qualitygates/project_status`
    const params = { projectKey };

    const response = await axios.get(api,
        {
            params,
            auth: {
                username: sonarToken,
                password: "",
            },
        });

    //console.log("response: ", JSON.stringify(response.data, null, 2));
    return response.data;
};