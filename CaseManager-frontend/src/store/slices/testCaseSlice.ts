import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 定义测试用例类型
export interface TestCase {
  _id: string;
  title: string;
  description?: string;
  preconditions?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'deprecated';
  type: 'functional' | 'performance' | 'security' | 'usability' | 'other';
  steps: {
    stepNumber: number;
    description: string;
    expectedResult: string;
  }[];
  directory: string;
  caseLibrary: string;
  tags?: string[];
  attachments?: string[];
  automationStatus: 'not-automated' | 'automated' | 'in-progress';
  automationScript?: string;
  creator: string;
  lastUpdatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// 定义状态类型
interface TestCaseState {
  testCases: TestCase[];
  currentTestCase: TestCase | null;
  loading: boolean;
  error: string | null;
  totalTestCases: number;
}

// 初始状态
const initialState: TestCaseState = {
  testCases: [],
  currentTestCase: null,
  loading: false,
  error: null,
  totalTestCases: 0
};

// API基础URL
const API_URL = 'http://localhost:5000/api';

// 异步Action: 获取所有测试用例
export const fetchTestCases = createAsyncThunk(
  'testCases/fetchAll',
  async (params: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    directory?: string; 
    caseLibrary?: string;
    priority?: string;
    type?: string;
    status?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        directory, 
        caseLibrary,
        priority,
        type,
        status
      } = params;
      
      let url = `${API_URL}/test-cases?page=${page}&limit=${limit}`;
      
      if (search) url += `&search=${search}`;
      if (directory) url += `&directory=${directory}`;
      if (caseLibrary) url += `&caseLibrary=${caseLibrary}`;
      if (priority) url += `&priority=${priority}`;
      if (type) url += `&type=${type}`;
      if (status) url += `&status=${status}`;
      
      const response = await axios.get(url);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取测试用例列表失败');
    }
  }
);

// 异步Action: 获取单个测试用例
export const fetchTestCase = createAsyncThunk(
  'testCases/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/test-cases/${id}`);
      return response.data.data.testCase;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取测试用例详情失败');
    }
  }
);

// 异步Action: 创建测试用例
export const createTestCase = createAsyncThunk(
  'testCases/create',
  async (testCaseData: Partial<TestCase>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/test-cases`, testCaseData);
      return response.data.data.testCase;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建测试用例失败');
    }
  }
);

// 异步Action: 更新测试用例
export const updateTestCase = createAsyncThunk(
  'testCases/update',
  async ({ id, testCaseData }: { id: string; testCaseData: Partial<TestCase> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/test-cases/${id}`, testCaseData);
      return response.data.data.testCase;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新测试用例失败');
    }
  }
);

// 异步Action: 删除测试用例
export const deleteTestCase = createAsyncThunk(
  'testCases/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/test-cases/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除测试用例失败');
    }
  }
);

// 创建Slice
const testCaseSlice = createSlice({
  name: 'testCases',
  initialState,
  reducers: {
    clearTestCaseError: (state) => {
      state.error = null;
    },
    setCurrentTestCase: (state, action) => {
      state.currentTestCase = action.payload;
    }
  },
  extraReducers: (builder) => {
    // 获取所有测试用例
    builder.addCase(fetchTestCases.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestCases.fulfilled, (state, action) => {
      state.loading = false;
      state.testCases = action.payload.testCases;
      state.totalTestCases = action.payload.pagination.total;
    });
    builder.addCase(fetchTestCases.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取单个测试用例
    builder.addCase(fetchTestCase.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestCase.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTestCase = action.payload;
    });
    builder.addCase(fetchTestCase.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 创建测试用例
    builder.addCase(createTestCase.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTestCase.fulfilled, (state, action) => {
      state.loading = false;
      state.testCases.push(action.payload);
    });
    builder.addCase(createTestCase.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 更新测试用例
    builder.addCase(updateTestCase.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTestCase.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.testCases.findIndex(testCase => testCase._id === action.payload._id);
      if (index !== -1) {
        state.testCases[index] = action.payload;
      }
      if (state.currentTestCase && state.currentTestCase._id === action.payload._id) {
        state.currentTestCase = action.payload;
      }
    });
    builder.addCase(updateTestCase.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 删除测试用例
    builder.addCase(deleteTestCase.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTestCase.fulfilled, (state, action) => {
      state.loading = false;
      state.testCases = state.testCases.filter(testCase => testCase._id !== action.payload);
      if (state.currentTestCase && state.currentTestCase._id === action.payload) {
        state.currentTestCase = null;
      }
    });
    builder.addCase(deleteTestCase.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { clearTestCaseError, setCurrentTestCase } = testCaseSlice.actions;

// 导出Reducer
export default testCaseSlice.reducer;
