import axios from 'axios';
import { Contract, Analytics, ContractType } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const contractAPI = {
  // Get all contracts
  getContracts: async (params: {
    userId?: string;
    search?: string;
    contractType?: string;
    extractionStatus?: string;
  }): Promise<Contract[]> => {
    const response = await api.get('/contracts', { params });
    return response.data;
  },

  // Upload contracts
  uploadContracts: async (files: FileList, userId: string): Promise<Contract[]> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('userId', userId);

    const response = await api.post('/contracts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete contract
  deleteContract: async (contractId: string): Promise<void> => {
    await api.delete(`/contracts/${contractId}`);
  },

  // Download contract
  downloadContract: async (contractId: string, filename: string): Promise<void> => {
    const response = await api.get(`/contracts/${contractId}/download`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Get analytics
  getAnalytics: async (userId?: string): Promise<Analytics> => {
    const response = await api.get('/analytics/summary', {
      params: userId ? { userId } : {},
    });
    return response.data;
  },

  // Get contract types
  getContractTypes: async (userId?: string): Promise<ContractType[]> => {
    const response = await api.get('/analytics/contract-types', {
      params: userId ? { userId } : {},
    });
    return response.data;
  },
};
