import React from "react";

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string | number;
    message: string;
  };
  status: number;
  success: boolean;
}

export interface ApiRequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, any>;
  timeout?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7015/api";
const DEFAULT_TIMEOUT = 30000;

function buildUrl(endpoint: string, params?: Record<string, any>): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;

  const url = new URL(cleanEndpoint, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  return Promise.race([fetch(url, options), new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeout))]);
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  let data: any;

  try {
    data = isJson ? await response.json() : await response.text();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      error: {
        code: data?.code || response.status,
        message: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
      },
    };
  }

  return {
    success: true,
    status: response.status,
    data,
  };
}

class ApiClient {
  async get<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, token, timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
    const url = buildUrl(endpoint, params);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    };

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "GET",
          headers,
          ...fetchOptions,
        },
        timeout
      );

      return handleResponse<T>(response);
    } catch (error) {
      const isTimeout = error instanceof Error && error.message === "Request timeout";
      return {
        success: false,
        status: 0,
        error: {
          code: isTimeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  async post<T = any>(endpoint: string, body?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { token, timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
    const url = buildUrl(endpoint);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    };

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "POST",
          headers,
          body: body ? JSON.stringify(body) : undefined,
          ...fetchOptions,
        },
        timeout
      );

      return handleResponse<T>(response);
    } catch (error) {
      const isTimeout = error instanceof Error && error.message === "Request timeout";
      return {
        success: false,
        status: 0,
        error: {
          code: isTimeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  async put<T = any>(endpoint: string, body?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { token, timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
    const url = buildUrl(endpoint);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    };

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "PUT",
          headers,
          body: body ? JSON.stringify(body) : undefined,
          ...fetchOptions,
        },
        timeout
      );

      return handleResponse<T>(response);
    } catch (error) {
      const isTimeout = error instanceof Error && error.message === "Request timeout";
      return {
        success: false,
        status: 0,
        error: {
          code: isTimeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  async delete<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { token, timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
    const url = buildUrl(endpoint);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    };

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "DELETE",
          headers,
          ...fetchOptions,
        },
        timeout
      );

      return handleResponse<T>(response);
    } catch (error) {
      const isTimeout = error instanceof Error && error.message === "Request timeout";
      return {
        success: false,
        status: 0,
        error: {
          code: isTimeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  async patch<T = any>(endpoint: string, body?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { token, timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
    const url = buildUrl(endpoint);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    };

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "PATCH",
          headers,
          body: body ? JSON.stringify(body) : undefined,
          ...fetchOptions,
        },
        timeout
      );

      return handleResponse<T>(response);
    } catch (error) {
      const isTimeout = error instanceof Error && error.message === "Request timeout";
      return {
        success: false,
        status: 0,
        error: {
          code: isTimeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  async uploadFiles<T = any>(files: File[], uploadType: number = 1, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { token, timeout = DEFAULT_TIMEOUT, params, ...fetchOptions } = options;
    const url = buildUrl("files/uploads", { uploadType, ...params });

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "POST",
          headers,
          body: formData,
          ...fetchOptions,
        },
        timeout
      );

      return handleResponse<T>(response);
    } catch (error) {
      const isTimeout = error instanceof Error && error.message === "Request timeout";
      return {
        success: false,
        status: 0,
        error: {
          code: isTimeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }
}

export const api = new ApiClient();
