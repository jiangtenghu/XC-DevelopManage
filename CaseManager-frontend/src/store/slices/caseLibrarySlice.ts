import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

// 定义用例库类型
interface CaseLibrary {
  id: string;
  name: string;
  code: string;
  description: string;
  isPublic: boolean;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

// 定义用例库状态
interface CaseLibraryState {
  libraries: CaseLibrary[];
  currentLibrary: CaseLibrary | null;
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: CaseLibraryState = {
  libraries: [],
  currentLibrary: null,
  loading: false,
  error: null,
};

// 获取所有用例库
export const fetchCaseLibraries = createAsyncThunk(
  'caseLibrary/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/case-libraries`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用例库失败');
    }
  }
);

// 获取单个用例库
export const fetchCaseLibrary = createAsyncThunk(
  'caseLibrary/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/case-libraries/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用例库详情失败');
    }
  }
);

// 创建用例库
export const createCaseLibrary = createAsyncThunk(
  'caseLibrary/create',
  async (libraryData: Partial<CaseLibrary>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/case-libraries`, libraryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建用例库失败');
    }
  }
);

// 更新用例库
export const updateCaseLibrary = createAsyncThunk(
  'caseLibrary/update',
  async (
    { id, libraryData }: { id: string; libraryData: Partial<CaseLibrary> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`${API_URL}/case-libraries/${id}`, libraryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新用例库失败');
    }
  }
);

// 删除用例库
export const deleteCaseLibrary = createAsyncThunk(
  'caseLibrary/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/case-libraries/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除用例库失败');
    }
  }
);

// 创建用例库Slice
const caseLibrarySlice = createSlice({
  name: 'caseLibrary',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentLibrary: (state, action: PayloadAction<CaseLibrary | null>) => {
      state.currentLibrary = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取所有用例库
      .addCase(fetchCaseLibraries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaseLibraries.fulfilled, (state, action: PayloadAction<CaseLibrary[]>) => {
        state.loading = false;
        state.libraries = action.payload;
      })
      .addCase(fetchCaseLibraries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 获取单个用例库
      .addCase(fetchCaseLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaseLibrary.fulfilled, (state, action: PayloadAction<CaseLibrary>) => {
        state.loading = false;
        state.currentLibrary = action.payload;
      })
      .addCase(fetchCaseLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 创建用例库
      .addCase(createCaseLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCaseLibrary.fulfilled, (state, action: PayloadAction<CaseLibrary>) => {
        state.loading = false;
        state.libraries.push(action.payload);
      })
      .addCase(createCaseLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 更新用例库
      .addCase(updateCaseLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCaseLibrary.fulfilled, (state, action: PayloadAction<CaseLibrary>) => {
        state.loading = false;
        const index = state.libraries.findIndex((lib) => lib.id === action.payload.id);
        if (index !== -1) {
          state.libraries[index] = action.payload;
        }
        if (state.currentLibrary?.id === action.payload.id) {
          state.currentLibrary = action.payload;
        }
      })
      .addCase(updateCaseLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 删除用例库
      .addCase(deleteCaseLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCaseLibrary.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.libraries = state.libraries.filter((lib) => lib.id !== action.payload);
        if (state.currentLibrary?.id === action.payload) {
          state.currentLibrary = null;
        }
      })
      .addCase(deleteCaseLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentLibrary } = caseLibrarySlice.actions;
export default caseLibrarySlice.reducer;
