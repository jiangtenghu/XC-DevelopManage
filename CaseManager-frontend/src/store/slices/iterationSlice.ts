import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// 生成临时ID的辅助函数
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

// 定义迭代类型
export interface Iteration {
  _id: string;
  name: string;
  description?: string;
  project: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  goals?: string;
  capacity?: number;
  completedPercentage?: number;
  creator: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 定义状态类型
interface IterationState {
  iterations: Iteration[];
  currentIteration: Iteration | null;
  loading: boolean;
  error: string | null;
  totalIterations: number;
  statusStats: any[];
  recentIterations: Iteration[];
  upcomingIterations: Iteration[];
  endingIterations: Iteration[];
  hasPendingSync: boolean; // 是否有待同步的数据
}

// 初始状态
const initialState: IterationState = {
  iterations: [],
  currentIteration: null,
  loading: false,
  error: null,
  totalIterations: 0,
  statusStats: [],
  recentIterations: [],
  upcomingIterations: [],
  endingIterations: [],
  hasPendingSync: false
};


// 本地存储键名
const ITERATIONS_STORAGE_KEY = 'casemanager_iterations';

// 工具函数：从本地存储加载迭代数据
const loadIterationsFromStorage = (): Iteration[] => {
  try {
    const storedIterations = localStorage.getItem(ITERATIONS_STORAGE_KEY);
    return storedIterations ? JSON.parse(storedIterations) : [];
  } catch (error) {
    console.error('从本地存储加载迭代数据失败:', error);
    return [];
  }
};

// 工具函数：保存迭代数据到本地存储
const saveIterationsToStorage = (iterations: Iteration[]) => {
  try {
    localStorage.setItem(ITERATIONS_STORAGE_KEY, JSON.stringify(iterations));
  } catch (error) {
    console.error('保存迭代数据到本地存储失败:', error);
  }
};

// 工具函数：生成模拟的迭代统计数据
const generateIterationStats = (iterations: Iteration[]) => {
  const statusStats = [
    { _id: 'planning', count: iterations.filter(i => i.status === 'planning').length },
    { _id: 'active', count: iterations.filter(i => i.status === 'active').length },
    { _id: 'completed', count: iterations.filter(i => i.status === 'completed').length },
    { _id: 'cancelled', count: iterations.filter(i => i.status === 'cancelled').length }
  ];
  
  const upcomingIterations = iterations
    .filter(i => i.status === 'planning' || i.status === 'active')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);
  
  const recentIterations = [...iterations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  const endingIterations = iterations
    .filter(i => i.status === 'active')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5);
    
  return {
    totalIterations: iterations.length,
    statusStats,
    recentIterations,
    upcomingIterations,
    endingIterations
  };
};

// 同步Action: 获取所有迭代
export const fetchIterations = createAsyncThunk(
  'iterations/fetchAll',
  async (params: { page?: number; limit?: number; search?: string; status?: string; project?: string } = {}) => {
    const { page = 1, limit = 10, search, status, project } = params;
    
    // 从本地存储加载迭代
    let iterations = loadIterationsFromStorage();
    
    // 应用筛选条件
    if (search) {
      const searchLower = search.toLowerCase();
      iterations = iterations.filter(i => 
        i.name.toLowerCase().includes(searchLower) || 
        (i.description && i.description.toLowerCase().includes(searchLower))
      );
    }
    
    if (status) {
      iterations = iterations.filter(i => i.status === status);
    }
    
    if (project) {
      iterations = iterations.filter(i => i.project === project);
    }
    
    // 计算分页
    const total = iterations.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIterations = iterations.slice(startIndex, endIndex);
    
    return {
      iterations: paginatedIterations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
);

// 同步Action: 获取单个迭代
export const fetchIteration = createAsyncThunk(
  'iterations/fetchOne',
  async (id: string) => {
    const iterations = loadIterationsFromStorage();
    const iteration = iterations.find(i => i._id === id);
    
    if (!iteration) {
      throw new Error('迭代不存在');
    }
    
    return iteration;
  }
);

// 同步Action: 创建迭代
export const createIteration = createAsyncThunk(
  'iterations/create',
  async (iterationData: Partial<Iteration>) => {
    const iterations = loadIterationsFromStorage();
    
    // 创建新迭代
    const now = new Date().toISOString();
    const newIteration: Iteration = {
      _id: uuidv4(),
      name: iterationData.name || '',
      description: iterationData.description || '',
      project: iterationData.project || '',
      startDate: iterationData.startDate || now,
      endDate: iterationData.endDate || now,
      status: iterationData.status || 'planning',
      goals: iterationData.goals || '',
      capacity: iterationData.capacity || 0,
      completedPercentage: 0,
      creator: '当前用户', // 模拟当前用户
      createdAt: now,
      updatedAt: now
    };
    
    // 添加到迭代列表
    const updatedIterations = [...iterations, newIteration];
    saveIterationsToStorage(updatedIterations);
    
    return newIteration;
  }
);

// 同步Action: 更新迭代
export const updateIteration = createAsyncThunk(
  'iterations/update',
  async ({ id, iterationData }: { id: string; iterationData: Partial<Iteration> }) => {
    const iterations = loadIterationsFromStorage();
    const iterationIndex = iterations.findIndex(i => i._id === id);
    
    if (iterationIndex === -1) {
      throw new Error('迭代不存在');
    }
    
    // 更新迭代
    const updatedIteration = {
      ...iterations[iterationIndex],
      ...iterationData,
      updatedAt: new Date().toISOString()
    };
    
    // 更新迭代列表
    const updatedIterations = [...iterations];
    updatedIterations[iterationIndex] = updatedIteration;
    saveIterationsToStorage(updatedIterations);
    
    return updatedIteration;
  }
);

// 同步Action: 删除迭代
export const deleteIteration = createAsyncThunk(
  'iterations/delete',
  async (id: string) => {
    const iterations = loadIterationsFromStorage();
    const updatedIterations = iterations.filter(i => i._id !== id);
    
    saveIterationsToStorage(updatedIterations);
    
    return id;
  }
);

// 同步Action: 更新迭代状态
export const updateIterationStatus = createAsyncThunk(
  'iterations/updateStatus',
  async ({ id, status }: { id: string; status: 'planning' | 'active' | 'completed' | 'cancelled' }) => {
    const iterations = loadIterationsFromStorage();
    const iterationIndex = iterations.findIndex(i => i._id === id);
    
    if (iterationIndex === -1) {
      throw new Error('迭代不存在');
    }
    
    // 更新迭代状态
    const updatedIteration: Iteration = {
      ...iterations[iterationIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    // 更新迭代列表
    const updatedIterations = [...iterations];
    updatedIterations[iterationIndex] = updatedIteration;
    saveIterationsToStorage(updatedIterations);
    
    return updatedIteration;
  }
);

// 同步Action: 获取项目的迭代
export const fetchProjectIterations = createAsyncThunk(
  'iterations/fetchProjectIterations',
  async ({ projectId, status }: { projectId: string; status?: string }) => {
    const iterations = loadIterationsFromStorage();
    
    let filteredIterations = iterations.filter(i => i.project === projectId);
    
    if (status) {
      filteredIterations = filteredIterations.filter(i => i.status === status);
    }
    
    return filteredIterations;
  }
);

// 同步Action: 获取项目的当前活动迭代
export const fetchActiveIteration = createAsyncThunk(
  'iterations/fetchActiveIteration',
  async (projectId: string) => {
    const iterations = loadIterationsFromStorage();
    
    const activeIteration = iterations.find(i => 
      i.project === projectId && i.status === 'active'
    );
    
    if (!activeIteration) {
      throw new Error('没有找到活动迭代');
    }
    
    return activeIteration;
  }
);

// 同步Action: 获取迭代统计信息
export const fetchIterationStats = createAsyncThunk(
  'iterations/fetchStats',
  async () => {
    const iterations = loadIterationsFromStorage();
    return generateIterationStats(iterations);
  }
);

// 同步Action: 初始化迭代数据
export const initializeIterations = createAsyncThunk(
  'iterations/initialize',
  async () => {
    // 从本地存储加载迭代
    const iterations = loadIterationsFromStorage();
    
    // 如果没有迭代数据，创建一些示例迭代
    if (iterations.length === 0) {
      const now = new Date().toISOString();
      const sampleIterations: Iteration[] = [
        {
          _id: uuidv4(),
          name: '迭代1 - 基础功能开发',
          description: '实现产品的核心功能模块',
          project: '项目ID1', // 需要替换为实际项目ID
          startDate: '2025-05-01',
          endDate: '2025-05-15',
          status: 'active',
          goals: '完成核心功能的开发和单元测试',
          capacity: 80,
          completedPercentage: 60,
          creator: '张三',
          createdAt: now,
          updatedAt: now
        },
        {
          _id: uuidv4(),
          name: '迭代2 - 性能优化',
          description: '优化系统性能，提高响应速度',
          project: '项目ID1', // 需要替换为实际项目ID
          startDate: '2025-05-16',
          endDate: '2025-05-30',
          status: 'planning',
          goals: '提高系统响应速度，优化数据库查询',
          capacity: 60,
          completedPercentage: 0,
          creator: '李四',
          createdAt: now,
          updatedAt: now
        }
      ];
      
      saveIterationsToStorage(sampleIterations);
      return sampleIterations;
    }
    
    return iterations;
  }
);

// 创建Slice
const iterationSlice = createSlice({
  name: 'iterations',
  initialState,
  reducers: {
    clearIterationError: (state) => {
      state.error = null;
    },
    setCurrentIteration: (state, action) => {
      state.currentIteration = action.payload;
    }
  },
  extraReducers: (builder) => {
    // 获取所有迭代
    builder.addCase(fetchIterations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIterations.fulfilled, (state, action) => {
      state.loading = false;
      state.iterations = action.payload.iterations;
      state.totalIterations = action.payload.pagination.total;
    });
    builder.addCase(fetchIterations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取单个迭代
    builder.addCase(fetchIteration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIteration.fulfilled, (state, action) => {
      state.loading = false;
      state.currentIteration = action.payload;
    });
    builder.addCase(fetchIteration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 创建迭代
    builder.addCase(createIteration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createIteration.fulfilled, (state, action) => {
      state.loading = false;
      state.iterations.push(action.payload);
    });
    builder.addCase(createIteration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 更新迭代
    builder.addCase(updateIteration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateIteration.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.iterations.findIndex(iteration => iteration._id === action.payload._id);
      if (index !== -1) {
        state.iterations[index] = action.payload;
      }
      if (state.currentIteration && state.currentIteration._id === action.payload._id) {
        state.currentIteration = action.payload;
      }
    });
    builder.addCase(updateIteration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 删除迭代
    builder.addCase(deleteIteration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteIteration.fulfilled, (state, action) => {
      state.loading = false;
      state.iterations = state.iterations.filter(iteration => iteration._id !== action.payload);
      if (state.currentIteration && state.currentIteration._id === action.payload) {
        state.currentIteration = null;
      }
    });
    builder.addCase(deleteIteration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 更新迭代状态
    builder.addCase(updateIterationStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateIterationStatus.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.iterations.findIndex(iteration => iteration._id === action.payload._id);
      if (index !== -1) {
        state.iterations[index] = action.payload;
      }
      if (state.currentIteration && state.currentIteration._id === action.payload._id) {
        state.currentIteration = action.payload;
      }
    });
    builder.addCase(updateIterationStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取项目的迭代
    builder.addCase(fetchProjectIterations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjectIterations.fulfilled, (state, action) => {
      state.loading = false;
      state.iterations = action.payload;
    });
    builder.addCase(fetchProjectIterations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取项目的当前活动迭代
    builder.addCase(fetchActiveIteration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchActiveIteration.fulfilled, (state, action) => {
      state.loading = false;
      state.currentIteration = action.payload;
    });
    builder.addCase(fetchActiveIteration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取迭代统计信息
    builder.addCase(fetchIterationStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIterationStats.fulfilled, (state, action) => {
      state.loading = false;
      state.totalIterations = action.payload.totalIterations;
      state.statusStats = action.payload.statusStats;
      state.recentIterations = action.payload.recentIterations;
      state.upcomingIterations = action.payload.upcomingIterations;
      state.endingIterations = action.payload.endingIterations;
    });
    builder.addCase(fetchIterationStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { clearIterationError, setCurrentIteration } = iterationSlice.actions;

// 导出Reducer
export default iterationSlice.reducer;
