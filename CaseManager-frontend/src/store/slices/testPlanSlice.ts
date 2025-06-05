import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 定义测试计划类型
export interface TestPlan {
  _id: string;
  name: string;
  description?: string;
  project?: string;
  iteration?: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in-progress' | 'completed' | 'cancelled';
  progress: number;
  testCases: {
    testCase: string;
    status: 'pending' | 'passed' | 'failed' | 'blocked' | 'skipped';
    assignee?: string;
    executedBy?: string;
    executedAt?: string;
    notes?: string;
  }[];
  creator: string;
  createdAt: string;
  updatedAt: string;
}

// 定义状态类型
interface TestPlanState {
  testPlans: TestPlan[];
  currentTestPlan: TestPlan | null;
  loading: boolean;
  error: string | null;
  totalTestPlans: number;
}

// 初始状态
const initialState: TestPlanState = {
  testPlans: [],
  currentTestPlan: null,
  loading: false,
  error: null,
  totalTestPlans: 0
};

// API基础URL
const API_URL = 'http://localhost:5000/api';

// 异步Action: 获取所有测试计划
export const fetchTestPlans = createAsyncThunk(
  'testPlans/fetchAll',
  async (params: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string;
    project?: string;
    iteration?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status,
        project,
        iteration
      } = params;
      
      let url = `${API_URL}/test-plans?page=${page}&limit=${limit}`;
      
      if (search) url += `&search=${search}`;
      if (status) url += `&status=${status}`;
      if (project) url += `&project=${project}`;
      if (iteration) url += `&iteration=${iteration}`;
      
      const response = await axios.get(url);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取测试计划列表失败');
    }
  }
);

// 异步Action: 获取单个测试计划
export const fetchTestPlan = createAsyncThunk(
  'testPlans/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/test-plans/${id}`);
      return response.data.data.testPlan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取测试计划详情失败');
    }
  }
);

// 异步Action: 创建测试计划
export const createTestPlan = createAsyncThunk(
  'testPlans/create',
  async (testPlanData: Partial<TestPlan>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/test-plans`, testPlanData);
      return response.data.data.testPlan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建测试计划失败');
    }
  }
);

// 异步Action: 更新测试计划
export const updateTestPlan = createAsyncThunk(
  'testPlans/update',
  async ({ id, testPlanData }: { id: string; testPlanData: Partial<TestPlan> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/test-plans/${id}`, testPlanData);
      return response.data.data.testPlan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新测试计划失败');
    }
  }
);

// 异步Action: 删除测试计划
export const deleteTestPlan = createAsyncThunk(
  'testPlans/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/test-plans/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除测试计划失败');
    }
  }
);

// 异步Action: 添加测试用例到测试计划
export const addTestCaseToTestPlan = createAsyncThunk(
  'testPlans/addTestCase',
  async ({ testPlanId, testCaseData }: { 
    testPlanId: string; 
    testCaseData: { 
      testCase: string; 
      status?: string; 
      assignee?: string; 
    } 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/test-plans/${testPlanId}/test-cases`, testCaseData);
      return response.data.data.testPlan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '添加测试用例失败');
    }
  }
);

// 异步Action: 从测试计划中移除测试用例
export const removeTestCaseFromTestPlan = createAsyncThunk(
  'testPlans/removeTestCase',
  async ({ testPlanId, testCaseId }: { testPlanId: string; testCaseId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/test-plans/${testPlanId}/test-cases/${testCaseId}`);
      return response.data.data.testPlan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '移除测试用例失败');
    }
  }
);

// 异步Action: 更新测试计划中的测试用例状态
export const updateTestCaseStatus = createAsyncThunk(
  'testPlans/updateTestCaseStatus',
  async ({ 
    testPlanId, 
    testCaseId, 
    statusData 
  }: { 
    testPlanId: string; 
    testCaseId: string; 
    statusData: { 
      status: string; 
      notes?: string; 
    } 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/test-plans/${testPlanId}/test-cases/${testCaseId}/status`, 
        statusData
      );
      return response.data.data.testPlan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新测试用例状态失败');
    }
  }
);

// 创建Slice
const testPlanSlice = createSlice({
  name: 'testPlans',
  initialState,
  reducers: {
    clearTestPlanError: (state) => {
      state.error = null;
    },
    setCurrentTestPlan: (state, action) => {
      state.currentTestPlan = action.payload;
    }
  },
  extraReducers: (builder) => {
    // 获取所有测试计划
    builder.addCase(fetchTestPlans.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestPlans.fulfilled, (state, action) => {
      state.loading = false;
      state.testPlans = action.payload.testPlans;
      state.totalTestPlans = action.payload.pagination.total;
    });
    builder.addCase(fetchTestPlans.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取单个测试计划
    builder.addCase(fetchTestPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestPlan.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTestPlan = action.payload;
    });
    builder.addCase(fetchTestPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 创建测试计划
    builder.addCase(createTestPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTestPlan.fulfilled, (state, action) => {
      state.loading = false;
      state.testPlans.push(action.payload);
    });
    builder.addCase(createTestPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 更新测试计划
    builder.addCase(updateTestPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTestPlan.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.testPlans.findIndex(testPlan => testPlan._id === action.payload._id);
      if (index !== -1) {
        state.testPlans[index] = action.payload;
      }
      if (state.currentTestPlan && state.currentTestPlan._id === action.payload._id) {
        state.currentTestPlan = action.payload;
      }
    });
    builder.addCase(updateTestPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 删除测试计划
    builder.addCase(deleteTestPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTestPlan.fulfilled, (state, action) => {
      state.loading = false;
      state.testPlans = state.testPlans.filter(testPlan => testPlan._id !== action.payload);
      if (state.currentTestPlan && state.currentTestPlan._id === action.payload) {
        state.currentTestPlan = null;
      }
    });
    builder.addCase(deleteTestPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 添加测试用例到测试计划
    builder.addCase(addTestCaseToTestPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addTestCaseToTestPlan.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.testPlans.findIndex(testPlan => testPlan._id === action.payload._id);
      if (index !== -1) {
        state.testPlans[index] = action.payload;
      }
      if (state.currentTestPlan && state.currentTestPlan._id === action.payload._id) {
        state.currentTestPlan = action.payload;
      }
    });
    builder.addCase(addTestCaseToTestPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 从测试计划中移除测试用例
    builder.addCase(removeTestCaseFromTestPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeTestCaseFromTestPlan.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.testPlans.findIndex(testPlan => testPlan._id === action.payload._id);
      if (index !== -1) {
        state.testPlans[index] = action.payload;
      }
      if (state.currentTestPlan && state.currentTestPlan._id === action.payload._id) {
        state.currentTestPlan = action.payload;
      }
    });
    builder.addCase(removeTestCaseFromTestPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 更新测试计划中的测试用例状态
    builder.addCase(updateTestCaseStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTestCaseStatus.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.testPlans.findIndex(testPlan => testPlan._id === action.payload._id);
      if (index !== -1) {
        state.testPlans[index] = action.payload;
      }
      if (state.currentTestPlan && state.currentTestPlan._id === action.payload._id) {
        state.currentTestPlan = action.payload;
      }
    });
    builder.addCase(updateTestCaseStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { clearTestPlanError, setCurrentTestPlan } = testPlanSlice.actions;

// 导出Reducer
export default testPlanSlice.reducer;
