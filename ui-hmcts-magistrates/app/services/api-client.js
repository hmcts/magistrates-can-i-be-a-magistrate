const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4550';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  if (config.authToken) {
    config.headers.Authorization = `Bearer ${config.authToken}`;
  }
  return config;
});

// Vacancies
const getVacancies = async (params = {}) => {
  const response = await apiClient.get('/vacancies', { params });
  return response.data;
};

const getVacancy = async (id) => {
  const response = await apiClient.get(`/vacancies/${id}`);
  return response.data;
};

// Applications
const createApplication = async (vacancyId, authToken) => {
  const response = await apiClient.post('/applications', { vacancyId }, { authToken });
  return response.data;
};

const getApplication = async (id, authToken) => {
  const response = await apiClient.get(`/applications/${id}`, { authToken });
  return response.data;
};

const getMyApplications = async (authToken) => {
  const response = await apiClient.get('/applications', { authToken });
  return response.data;
};

const saveStep = async (applicationId, stepName, formData, authToken) => {
  const response = await apiClient.put(
    `/applications/${applicationId}/steps/${stepName}`,
    { formData },
    { authToken }
  );
  return response.data;
};

const getStep = async (applicationId, stepName, authToken) => {
  const response = await apiClient.get(
    `/applications/${applicationId}/steps/${stepName}`,
    { authToken }
  );
  return response.data;
};

const submitApplication = async (applicationId, authToken) => {
  const response = await apiClient.post(
    `/applications/${applicationId}/submit`,
    {},
    { authToken }
  );
  return response.data;
};

// Admin
const getAdminApplications = async (params, authToken) => {
  const response = await apiClient.get('/admin/applications', { params, authToken });
  return response.data;
};

const getAdminApplication = async (id, authToken) => {
  const response = await apiClient.get(`/admin/applications/${id}`, { authToken });
  return response.data;
};

const updateApplicationStatus = async (id, status, reason, authToken) => {
  const response = await apiClient.patch(
    `/admin/applications/${id}/status`,
    { status, reason },
    { authToken }
  );
  return response.data;
};

const getReportSummary = async (authToken) => {
  const response = await apiClient.get('/admin/reports/summary', { authToken });
  return response.data;
};

const exportApplicationsCsv = async (params, authToken) => {
  const response = await apiClient.get('/admin/applications/export/csv', {
    params,
    authToken,
    responseType: 'stream',
  });
  return response;
};

const exportApplicationPdf = async (id, authToken) => {
  const response = await apiClient.get(`/admin/applications/${id}/export/pdf`, {
    authToken,
    responseType: 'stream',
  });
  return response;
};

module.exports = {
  getVacancies,
  getVacancy,
  createApplication,
  getApplication,
  getMyApplications,
  saveStep,
  getStep,
  submitApplication,
  getAdminApplications,
  getAdminApplication,
  updateApplicationStatus,
  getReportSummary,
  exportApplicationsCsv,
  exportApplicationPdf,
};
