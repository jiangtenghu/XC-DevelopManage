import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { ApiResponse } from '../types';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    // 如果返回的状态码不是200，说明接口请求有问题，直接抛出错误
    if (res.code !== 200) {
      message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          message.error('登录已过期，请重新登录');
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误，请稍后再试');
          break;
        default:
          message.error(data.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络错误，请检查您的网络连接');
    } else {
      message.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);

// 封装GET请求
export const get = <T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.get(url, { params, ...config });
};

// 封装POST请求
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.post(url, data, config);
};

// 封装PUT请求
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.put(url, data, config);
};

// 封装DELETE请求
export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return api.delete(url, config);
};

export default api;
