import axios from "axios";
import https from 'https';

const agent: https.Agent = new https.Agent({
    rejectUnauthorized: false
});

export const biometricosApi = axios.create({
    baseURL: `${process.env.REACT_APP_URL_BIOMETRICS}`,
    httpsAgent: agent
});