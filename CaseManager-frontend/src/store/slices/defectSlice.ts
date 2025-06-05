import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 定义缺陷类型
export interface Defect {
  _id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'trivial';
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'reopened';
  type: 'bug' | 'enhancement' | 'feature' | 'task';
  project?: string;
  iteration?: string;
  testCase?: string;
  testPlan?: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  environment?: string;
  version?: string;
  assignee?: string;
  reporter: string;
  attachments?: string[];
  comments?: {
    user: string;
    content: string;
    createdAt: string;
  }[];
  history?: {
    user: string;
    field: string;
    oldValue: string;
    newValue: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// 定义状态类型
interface DefectState {
  defects: Defect[];
  currentDefect: Defect | null;
  loading: boolean;
  error: string | null;
  totalDefects: number;
  statusStats: any[];
  priorityStats: any[];
  severityStats: any[];
}

// 初始状态
const initialState: DefectState = {
  defects: [],
  currentDefect: null,
  loading: false,
  error: null,
  totalDefects: 0,
  statusStats: [],
  priorityStats: [],
  severityStats: []
};

// API基础URL
const API_URL = 'http://localhost:5000/api';

// 异步Action: 获取所有缺陷
export const fetchDefects = createAsyncThunk(
  'defects/fetchAll',
  async (params: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string;
    priority?: string;
    severity?: string;
    type?: string;
    project?: string;
    iteration?: string;
    assignee?: string;
    reporter?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status,
        priority,
        severity,
        type,
        project,
        iteration,
        assignee,
        reporter
      } = params;
      
      let url = `${API_URL}/defects?page=${page}&limit=${limit}`;
      
      if (search) url += `&search=${search}`;
      if (status) url += `&status=${status}`;
      if (priority) url += `&priority=${priority}`;
      if (severity) url += `&severity=${severity}`;
      if (type) url += `&type=${type}`;
      if (project) url += `&project=${project}`;
      if (iteration) url += `&iteration=${iteration}`;
      if (assignee) url += `&assignee=${assignee}`;
      if (reporter) url += `&reporter=${reporter}`;
      
      const response = await axios.get(url);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取缺陷列表失败');
    }
  }
);

// 异步Action: 获取单个缺陷
export const fetchDefect = createAsyncThunk(
  'defects/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/defects/${id}`);
      return response.data.data.defect;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取缺陷详情失败');
    }
  }
);

// 异步Action: 创建缺陷
export const createDefect = createAsyncThunk(
  'defects/create',
  async (defectData: Partial<Defect>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/defects`, defectData);
      return response.data.data.defect;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建缺陷失败');
    }
  }
);

// 异步Action: 更新缺陷
export const updateDefect = createAsyncThunk(
  'defects/update',
  async ({ id, defectData }: { id: string; defectData: Partial<Defect> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/defects/${id}`, defectData);
      return response.data.data.defect;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新缺陷失败');
    }
  }
);

// 异步Action: 删除缺陷
export const deleteDefect = createAsyncThunk(
  'defects/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/defects/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除缺陷失败');
    }
  }
);

// 异步Action: 添加评论
export const addComment = createAsyncThunk(
  'defects/addComment',
  async ({ defectId, commentData }: { 
    defectId: string; 
    commentData: { 
      content: string; 
    } 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/defects/${defectId}/comments`, commentData);
      return response.data.data.defect;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '添加评论失败');
    }
  }
);

// 异步Action: 上传附件
export const uploadAttachment = createAsyncThunk(
  'defects/uploadAttachment',
  async ({ defectId, formData }: { defectId: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/defects/${defectId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data.defect;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '上传附件失败');
    }
  }
);

// 异步Action: 获取缺陷统计信息
export const fetchDefectStats = createAsyncThunk(
  'defects/fetchStats',
  async (params: { project?: string; iteration?: string } = {}, { rejectWithValue }) => {
    try {
      const { project, iteration } = params;
      let url = `${API_URL}/defects/stats`;
      
      if (project) url += `?project=${project}`;
      if (iteration) url += project ? `&iteration=${iteration}` : `?iteration=${iteration}`;
      
      const response = await axios.get(url);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取缺陷统计失败');
    }
  }
);

// 创建Slice
const defectSlice = createSlice({
  name: 'defects',
  initialState,
  reducers: {
    clearDefectError: (state) => {
      state.error = null;
    },
    setCurrentDefect: (state, action) => {
      state.currentDefect = action.payload;
    }
  },
  extraReducers: (builder) => {
    // 获取所有缺陷
    builder.addCase(fetchDefects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDefects.fulfilled, (state, action) => {
      state.loading = false;
      state.defects = action.payload.defects;
      state.totalDefects = action.payload.pagination.total;
    });
    builder.addCase(fetchDefects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取单个缺陷
    builder.addCase(fetchDefect.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDefect.fulfilled, (state, action) => {
      state.loading = false;
      state.currentDefect = action.payload;
    });
    builder.addCase(fetchDefect.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 创建缺陷
    builder.addCase(createDefect.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createDefect.fulfilled, (state, action) => {
      state.loading = false;
      state.defects.push(action.payload);
    });
    builder.addCase(createDefect.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 更新缺陷
    builder.addCase(updateDefect.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateDefect.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.defects.findIndex(defect => defect._id === action.payload._id);
      if (index !== -1) {
        state.defects[index] = action.payload;
      }
      if (state.currentDefect && state.currentDefect._id === action.payload._id) {
        state.currentDefect = action.payload;
      }
    });
    builder.addCase(updateDefect.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 删除缺陷
    builder.addCase(deleteDefect.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteDefect.fulfilled, (state, action) => {
      state.loading = false;
      state.defects = state.defects.filter(defect => defect._id !== action.payload);
      if (state.currentDefect && state.currentDefect._id === action.payload) {
        state.currentDefect = null;
      }
    });
    builder.addCase(deleteDefect.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 添加评论
    builder.addCase(addComment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addComment.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.defects.findIndex(defect => defect._id === action.payload._id);
      if (index !== -1) {
        state.defects[index] = action.payload;
      }
      if (state.currentDefect && state.currentDefect._id === action.payload._id) {
        state.currentDefect = action.payload;
      }
    });
    builder.addCase(addComment.rejected, (state, action) => {
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
      const index = state.defects.findIndex(defect => defect._id === action.payload._id);
      if (index !== -1) {
        state.defects[index] = action.payload;
      }
      if (state.currentDefect && state.currentDefect._id === action.payload._id) {
        state.currentDefect = action.payload;
      }
    });
    builder.addCase(uploadAttachment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取缺陷统计信息
    builder.addCase(fetchDefectStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDefectStats.fulfilled, (state, action) => {
      state.loading = false;
      state.statusStats = action.payload.statusStats;
      state.priorityStats = action.payload.priorityStats;
      state.severityStats = action.payload.severityStats;
    });
    builder.addCase(fetchDefectStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { clearDefectError, setCurrentDefect } = defectSlice.actions;

// 导出Reducer
export default defectSlice.reducer;
