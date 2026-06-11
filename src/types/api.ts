export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorType?: string;
}

export interface LoginResponse {
  status: string;
  data: {
    authToken: string;
    userId: string;
    me: {
      _id: string;
      username: string;
      name?: string;
      emails?: Array<{ address: string; verified: boolean }>;
    };
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  count: number;
}