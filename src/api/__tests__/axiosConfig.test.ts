/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { apiClient } from '../axiosConfig';
import { API_BASE_URL } from '../../constants/api';

describe('axiosConfig', () => {

  describe('axios instance creation', () => {
    it('should have correct configuration', () => {
      expect(apiClient.defaults.baseURL).toBe(API_BASE_URL);
      expect(apiClient.defaults.timeout).toBe(10000);
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('interceptors', () => {
    it('should have interceptors configured', () => {
      expect((apiClient.interceptors.request as any).handlers.length).toBeGreaterThan(0);
      expect((apiClient.interceptors.response as any).handlers.length).toBeGreaterThan(0);
    });

    // Test the core transformation functions directly by importing them
    it('should convert response data from snake_case to camelCase', async () => {
      // Create a mock response with snake_case data
      const mockResponse = {
        data: {
          first_name: 'Luke',
          birth_year: '19BBY',
          eye_color: 'blue',
          character_details: [
            { first_name: 'Luke' },
            { first_name: 'Leia' }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      // Test that the response interceptor converts snake_case to camelCase
      const interceptedResponse = (apiClient.interceptors.response as any).handlers[0].fulfilled(mockResponse);
      
      expect(interceptedResponse.data.firstName).toBe('Luke');
      expect(interceptedResponse.data.birthYear).toBe('19BBY');
      expect(interceptedResponse.data.eyeColor).toBe('blue');
      expect(interceptedResponse.data.characterDetails).toEqual([
        { firstName: 'Luke' },
        { firstName: 'Leia' }
      ]);
    });

    it('should convert request data from camelCase to snake_case', () => {
      const mockConfig = {
        data: {
          firstName: 'Luke',
          birthYear: '19BBY',
          eyeColor: 'blue'
        },
        params: {
          firstName: 'Luke',
          birthYear: '19BBY'
        }
      };

      const interceptedConfig = (apiClient.interceptors.request as any).handlers[0].fulfilled(mockConfig);
      
      expect(interceptedConfig.data.first_name).toBe('Luke');
      expect(interceptedConfig.data.birth_year).toBe('19BBY');
      expect(interceptedConfig.data.eye_color).toBe('blue');
      
      expect(interceptedConfig.params.first_name).toBe('Luke');
      expect(interceptedConfig.params.birth_year).toBe('19BBY');
    });

    it('should handle arrays in transformations', () => {
      // Test array handling in toCamelCase (response interceptor)
      const responseWithArray = {
        data: [
          { first_name: 'Luke', last_name: 'Skywalker' },
          { birth_year: '19BBY', eye_color: 'blue' }
        ]
      };

      const result = (apiClient.interceptors.response as any).handlers[0].fulfilled(responseWithArray);
      expect(result.data).toEqual([
        { firstName: 'Luke', lastName: 'Skywalker' },
        { birthYear: '19BBY', eyeColor: 'blue' }
      ]);

      // Test array handling in toSnakeCase (request interceptor)
      const requestWithArray = {
        data: [
          { firstName: 'Luke', lastName: 'Skywalker' },
          { birthYear: '19BBY', eyeColor: 'blue' }
        ]
      };

      const requestResult = (apiClient.interceptors.request as any).handlers[0].fulfilled(requestWithArray);
      expect(requestResult.data).toEqual([
        { first_name: 'Luke', last_name: 'Skywalker' },
        { birth_year: '19BBY', eye_color: 'blue' }
      ]);
    });

    it('should preserve Date objects and primitives', () => {
      const testDate = new Date('2023-01-01');
      const responseWithDate = {
        data: { 
          created_date: testDate,
          simple_string: 'test',
          number_value: 123,
          null_value: null
        }
      };

      const result = (apiClient.interceptors.response as any).handlers[0].fulfilled(responseWithDate);
      expect(result.data.createdDate).toBe(testDate);
      expect(result.data.simpleString).toBe('test');
      expect(result.data.numberValue).toBe(123);
      expect(result.data.nullValue).toBe(null);
    });
  });

  describe('error handling', () => {
    it('should handle response errors', async () => {
      const error = new Error('Network error');
      const rejectedPromise = (apiClient.interceptors.response as any).handlers[0].rejected(error);
      
      await expect(rejectedPromise).rejects.toBe(error);
    });

    it('should handle request errors', async () => {
      const error = new Error('Request error');
      const rejectedPromise = (apiClient.interceptors.request as any).handlers[0].rejected(error);
      
      await expect(rejectedPromise).rejects.toBe(error);
    });
  });

  describe('config handling edge cases', () => {
    it('should handle request config without data or params', () => {
      const config = { url: '/api/test' };
      const result = (apiClient.interceptors.request as any).handlers[0].fulfilled(config);

      expect(result).toEqual(config);
    });

    it('should handle response without data', () => {
      const response = { status: 200, statusText: 'OK', headers: {}, config: {} };
      const result = (apiClient.interceptors.response as any).handlers[0].fulfilled(response);

      expect(result).toEqual(response);
    });

    it('should handle non-object response data', () => {
      const response = { 
        data: 'simple string',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };
      const result = (apiClient.interceptors.response as any).handlers[0].fulfilled(response);

      expect(result.data).toBe('simple string');
    });
  });
});
