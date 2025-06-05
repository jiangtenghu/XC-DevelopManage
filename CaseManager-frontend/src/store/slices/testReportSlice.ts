import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 定义测试报告类型
export interface TestReport {
  _id: string;
  title: string;
  description?: string;
  testPlan: string;
  project?: string;
  iteration?: string;
  summary: {
    totalTestCases: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    pending: number;
    passRate: number;
  };
  defectSummary?: {
    totalDefects: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    reopened: number;
  };
  testCaseResults: {
    testCase: string;
    status: 'passed' | 'failed' | 'blocked' | 'skipped' | 'pending';
    executedBy?: string;
    executedAt?: string;
    notes?: string;
    defects?: string[];
  }[];
  attachments?: string[];
  exportFormats?: string[];
  creator: string;
  createdAt: string;
  updatedAt: string;
}

// 定义状态类型
interface TestReportState {
  testReports: TestReport[];
  currentTestReport: TestReport | null;
  loading: boolean;
  error: string | null;
  totalTestReports: number;
}

// 初始状态
const initialState: TestReportState = {
  testReports: [],
  currentTestReport: null,
  loading: false,
  error: null,
  totalTestReports: 0
};

// API基础URL
const API_URL = 'http://localhost:5000/api';

// 异步Action: 获取所有测试报告
export const fetchTestReports = createAsyncThunk(
  'testReports/fetchAll',
  async (params: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    testPlan?: string;
    project?: string;
    iteration?: string;
    creator?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        testPlan,
        project,
        iteration,
        creator
      } = params;
      
      let url = `${API_URL}/test-reports?page=${page}&limit=${limit}`;
      
      if (search) url += `&search=${search}`;
      if (testPlan) url += `&testPlan=${testPlan}`;
      if (project) url += `&project=${project}`;
      if (iteration) url += `&iteration=${iteration}`;
      if (creator) url += `&creator=${creator}`;
      
      const response = await axios.get(url);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取测试报告列表失败');
    }
  }
);

// 异步Action: 获取单个测试报告
export const fetchTestReport = createAsyncThunk(
  'testReports/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/test-reports/${id}`);
      return response.data.data.testReport;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取测试报告详情失败');
    }
  }
);

// 异步Action: 创建测试报告
export const createTestReport = createAsyncThunk(
  'testReports/create',
  async (testReportData: Partial<TestReport>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/test-reports`, testReportData);
      return response.data.data.testReport;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建测试报告失败');
    }
  }
);

// 异步Action: 更新测试报告
export const updateTestReport = createAsyncThunk(
  'testReports/update',
  async ({ id, testReportData }: { id: string; testReportData: Partial<TestReport> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/test-reports/${id}`, testReportData);
      return response.data.data.testReport;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新测试报告失败');
    }
  }
);

// 异步Action: 删除测试报告
export const deleteTestReport = createAsyncThunk(
  'testReports/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/test-reports/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除测试报告失败');
    }
  }
);

// 异步Action: 导出测试报告
export const exportTestReport = createAsyncThunk(
  'testReports/export',
  async ({ id, format }: { id: string; format: 'pdf' | 'excel' | 'html' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/test-reports/${id}/export/${format}`, {
        responseType: 'blob'
      });
      
      // 创建Blob URL并触发下载
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
              'text/html' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-report-${id}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { id, format };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '导出测试报告失败');
    }
  }
);

// 异步Action: 上传附件
export const uploadAttachment = createAsyncThunk(
  'testReports/uploadAttachment',
  async ({ testReportId, formData }: { testReportId: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/test-reports/${testReportId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data.testReport;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '上传附件失败');
    }
  }
);

// 异步Action: 从测试计划生成测试报告
export const generateFromTestPlan = createAsyncThunk(
  'testReports/generateFromTestPlan',
  async ({ testPlanId, reportData }: { 
    testPlanId: string; 
    reportData: { 
      title: string; 
      description?: string; 
    } 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/test-reports/generate/${testPlanId}`, reportData);
      return response.data.data.testReport;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '生成测试报告失败');
    }
  }
);

// 创建Slice
const testReportSlice = createSlice({
  name: 'testReports',
  initialState,
  reducers: {
    clearTestReportError: (state) => {
      state.error = null;
    },
    setCurrentTestReport: (state, action) => {
      state.currentTestReport = action.payload;
    }
  },
  extraReducers: (builder) => {
    // 获取所有测试报告
    builder.addCase(fetchTestReports.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestReports.fulfilled, (state, action) => {
      state.loading = false;
      state.testReports = action.payload.testReports;
      state.totalTestReports = action.payload.pagination.total;
    });
    builder.addCase(fetchTestReports.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取单个测试报告
    builder.addCase(fetchTestReport.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestReport.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTestReport = action.payload;
    });
    builder.addCase(fetchTestReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 创建测试报告
    builder.addCase(createTestReport.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTestReport.fulfilled, (state, action) => {
      state.loading = false;
      state.testReports.push(action.payload);
    });
    builder.addCase(createTestReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 更新测试报告
    builder.addCase(updateTestReport.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTestReport.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.testReports.findIndex(testReport => testReport._id === action.payload._id);
      if (index !== -1) {
        state.testReports[index] = action.payload;
      }
      if (state.currentTestReport && state.currentTestReport._id === action.payload._id) {
        state.currentTestReport = action.payload;
      }
    });
    builder.addCase(updateTestReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 删除测试报告
    builder.addCase(deleteTestReport.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTestReport.fulfilled, (state, action) => {
      state.loading = false;
      state.testReports = state.testReports.filter(testReport => testReport._id !== action.payload);
      if (state.currentTestReport && state.currentTestReport._id === action.payload) {
        state.currentTestReport = null;
      }
    });
    builder.addCase(deleteTestReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 导出测试报告
    builder.addCase(exportTestReport.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(exportTestReport.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(exportTestReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 上传附件
    builder.addCase(uploadAttachment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(uploadAttachment.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.testReports.findIndex(testReport => testReport._id === action.payload._id);
      if (index !== -1) {
        state.testReports[index] = action.payload;
      }
      if (state.currentTestReport && state.currentTestReport._id === action.payload._id) {
        state.currentTestReport = action.payload;
      }
    });
    builder.addCase(uploadAttachment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 从测试计划生成测试报告
    builder.addCase(generateFromTestPlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(generateFromTestPlan.fulfilled, (state, action) => {
      state.loading = false;
      state.testReports.push(action.payload);
      state.currentTestReport = action.payload;
    });
    builder.addCase(generateFromTestPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { clearTestReportError, setCurrentTestReport } = testReportSlice.actions;

// 导出Reducer
export default testReportSlice.reducer;
