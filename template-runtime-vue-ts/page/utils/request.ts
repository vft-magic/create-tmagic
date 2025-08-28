import type { App } from 'vue';
import axios, { type AxiosResponse } from 'axios';

const requestHandler = function (config: Record<any, any>) {
  return config;
};

const responseHandler = function (response: AxiosResponse) {
  return response;
};

export const service = axios.create({
  withCredentials: true,
  timeout: 7000,
});

service.interceptors.request.use(requestHandler);
service.interceptors.response.use(responseHandler);

export default {
  install(app: App) {
    app.provide('request', service);
  },
};
