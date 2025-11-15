// src/services/assessmentService.ts
import apiClient from './api';

export const assessmentService = {
  // Home/Dashboard
  getHome: () => apiClient.get('/home/'),
  // Assessment
  startAssessment: () => apiClient.post('/assessment/start/'),
  getTestResponse: (assessmentId: number, testType: string) => 
    apiClient.get(`/assessment/${assessmentId}/test/${testType}/`),
  saveProgress: (data: any) => apiClient.post('/assessment/save-progress/', data),
  submitTest: (data: any) => apiClient.post('/assessment/submit-test/', data),
  getHistory: () => apiClient.get('/assessment/history/'),
  getResponses: (assessmentId: number) => apiClient.get(`/assessment/${assessmentId}/responses/`),
  // Chatbot
  sendChatMessage: (data: any) => apiClient.post('/chatbot/message/', data),
  getChatHistory: (assessmentId?: number) => {
    if (assessmentId) {
      return apiClient.get(`/chatbot/history/?assessment_id=${assessmentId}`);
    }
    return apiClient.get('/chatbot/history/');
  },
  // Profile
  updateProfile: (profileData: any) => apiClient.patch('/profile/update/', profileData),
  deleteAccount: () => apiClient.delete('/profile/delete/'),
};
