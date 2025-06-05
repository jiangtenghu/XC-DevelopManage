import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid'; // 注意：需要安装 uuid 包

// 本地存储键名
const PROJECTS_STORAGE_KEY = 'casemanager_projects';

// 定义项目类型
export interface Project {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  manager: string;
  members: {
    user: string;
    role: 'manager' | 'developer' | 'tester' | 'observer';
    joinedAt: string;
  }[];
  creator: string;
  createdAt: string;
  updatedAt: string;
}

// 定义状态类型
interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  totalProjects: number;
  statusStats: any[];
  recentProjects: Project[];
  upcomingDeadlines: Project[];
}

// 初始状态
const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  totalProjects: 0,
  statusStats: [],
  recentProjects: [],
  upcomingDeadlines: []
};


// 工具函数：从本地存储加载项目数据
const loadProjectsFromStorage = (): Project[] => {
  try {
    const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return storedProjects ? JSON.parse(storedProjects) : [];
  } catch (error) {
    console.error('从本地存储加载项目数据失败:', error);
    return [];
  }
};

// 工具函数：保存项目数据到本地存储
const saveProjectsToStorage = (projects: Project[]) => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('保存项目数据到本地存储失败:', error);
  }
};

// 工具函数：生成模拟的项目统计数据
const generateProjectStats = (projects: Project[]) => {
  const statusStats = [
    { _id: 'active', count: projects.filter(p => p.status === 'active').length },
    { _id: 'completed', count: projects.filter(p => p.status === 'completed').length },
    { _id: 'archived', count: projects.filter(p => p.status === 'archived').length }
  ];
  
  const recentProjects = [...projects].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
  
  const upcomingDeadlines = [...projects]
    .filter(p => p.status === 'active')
    .sort((a, b) => 
      new Date(a.plannedEndDate).getTime() - new Date(b.plannedEndDate).getTime()
    ).slice(0, 5);
    
  return {
    totalProjects: projects.length,
    statusStats,
    recentProjects,
    upcomingDeadlines
  };
};

// 同步Action: 获取所有项目
export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params: { page?: number; limit?: number; search?: string; status?: string; manager?: string; member?: string } = {}) => {
    const { page = 1, limit = 10, search, status } = params;
    
    // 从本地存储加载项目
    let projects = loadProjectsFromStorage();
    
    // 应用筛选条件
    if (search) {
      const searchLower = search.toLowerCase();
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.code.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }
    
    if (status) {
      projects = projects.filter(p => p.status === status);
    }
    
    // 计算分页
    const total = projects.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = projects.slice(startIndex, endIndex);
    
    return {
      projects: paginatedProjects,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
);

// 同步Action: 获取单个项目
export const fetchProject = createAsyncThunk(
  'projects/fetchOne',
  async (id: string) => {
    const projects = loadProjectsFromStorage();
    const project = projects.find(p => p._id === id);
    
    if (!project) {
      throw new Error('项目不存在');
    }
    
    return project;
  }
);

// 同步Action: 创建项目
export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData: Partial<Project>) => {
    const projects = loadProjectsFromStorage();
    
    // 创建新项目
    const now = new Date().toISOString();
    const newProject: Project = {
      _id: uuidv4(),
      name: projectData.name || '',
      code: projectData.code || '',
      description: projectData.description || '',
      status: projectData.status || 'active',
      startDate: projectData.startDate || now,
      plannedEndDate: projectData.plannedEndDate || now,
      manager: '当前用户', // 模拟当前用户
      members: [
        {
          user: '当前用户',
          role: 'manager',
          joinedAt: now
        }
      ],
      creator: '当前用户',
      createdAt: now,
      updatedAt: now
    };
    
    // 添加到项目列表
    const updatedProjects = [...projects, newProject];
    saveProjectsToStorage(updatedProjects);
    
    return newProject;
  }
);

// 同步Action: 更新项目
export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, projectData }: { id: string; projectData: Partial<Project> }) => {
    const projects = loadProjectsFromStorage();
    const projectIndex = projects.findIndex(p => p._id === id);
    
    if (projectIndex === -1) {
      throw new Error('项目不存在');
    }
    
    // 更新项目
    const updatedProject = {
      ...projects[projectIndex],
      ...projectData,
      updatedAt: new Date().toISOString()
    };
    
    // 更新项目列表
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = updatedProject;
    saveProjectsToStorage(updatedProjects);
    
    return updatedProject;
  }
);

// 同步Action: 删除项目
export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id: string) => {
    const projects = loadProjectsFromStorage();
    const updatedProjects = projects.filter(p => p._id !== id);
    
    saveProjectsToStorage(updatedProjects);
    
    return id;
  }
);

// 同步Action: 添加项目成员
export const addProjectMember = createAsyncThunk(
  'projects/addMember',
  async ({ id, userData }: { id: string; userData: { user: string; role?: string } }) => {
    const projects = loadProjectsFromStorage();
    const projectIndex = projects.findIndex(p => p._id === id);
    
    if (projectIndex === -1) {
      throw new Error('项目不存在');
    }
    
    // 检查成员是否已存在
    const memberExists = projects[projectIndex].members.some(m => m.user === userData.user);
    if (memberExists) {
      throw new Error('成员已存在');
    }
    
    // 添加新成员
    const newMember = {
      user: userData.user,
      role: userData.role || 'observer',
      joinedAt: new Date().toISOString()
    };
    
    const updatedMembers = [...projects[projectIndex].members, newMember];
    
    // 更新项目
    const updatedProject = {
      ...projects[projectIndex],
      members: updatedMembers,
      updatedAt: new Date().toISOString()
    };
    
    // 更新项目列表
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = updatedProject;
    saveProjectsToStorage(updatedProjects);
    
    return {
      projectId: id,
      members: updatedMembers
    };
  }
);

// 同步Action: 移除项目成员
export const removeProjectMember = createAsyncThunk(
  'projects/removeMember',
  async ({ projectId, userId }: { projectId: string; userId: string }) => {
    const projects = loadProjectsFromStorage();
    const projectIndex = projects.findIndex(p => p._id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('项目不存在');
    }
    
    // 移除成员
    const updatedMembers = projects[projectIndex].members.filter(m => m.user !== userId);
    
    // 更新项目
    const updatedProject = {
      ...projects[projectIndex],
      members: updatedMembers,
      updatedAt: new Date().toISOString()
    };
    
    // 更新项目列表
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = updatedProject;
    saveProjectsToStorage(updatedProjects);
    
    return {
      projectId,
      members: updatedMembers
    };
  }
);

// 同步Action: 更新项目成员角色
export const updateMemberRole = createAsyncThunk(
  'projects/updateMemberRole',
  async ({ projectId, userId, role }: { projectId: string; userId: string; role: string }) => {
    const projects = loadProjectsFromStorage();
    const projectIndex = projects.findIndex(p => p._id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('项目不存在');
    }
    
    // 更新成员角色
    const updatedMembers = projects[projectIndex].members.map(m => 
      m.user === userId ? { ...m, role } : m
    );
    
    // 更新项目
    const updatedProject = {
      ...projects[projectIndex],
      members: updatedMembers,
      updatedAt: new Date().toISOString()
    };
    
    // 更新项目列表
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = updatedProject;
    saveProjectsToStorage(updatedProjects);
    
    return {
      projectId,
      members: updatedMembers
    };
  }
);

// 同步Action: 获取用户的项目
export const fetchUserProjects = createAsyncThunk(
  'projects/fetchUserProjects',
  async () => {
    // 从本地存储加载项目
    const projects = loadProjectsFromStorage();
    
    // 模拟当前用户的项目（在实际应用中，这里应该根据用户ID筛选）
    return projects;
  }
);

// 同步Action: 获取项目统计信息
export const fetchProjectStats = createAsyncThunk(
  'projects/fetchStats',
  async () => {
    // 从本地存储加载项目
    const projects = loadProjectsFromStorage();
    
    // 生成统计数据
    return generateProjectStats(projects);
  }
);

// 同步Action: 初始化项目数据
export const initializeProjects = createAsyncThunk(
  'projects/initialize',
  async () => {
    // 从本地存储加载项目
    const projects = loadProjectsFromStorage();
    
    // 如果没有项目数据，创建一些示例项目
    if (projects.length === 0) {
      const now = new Date().toISOString();
      const sampleProjects: Project[] = [
        {
          _id: uuidv4(),
          name: '产品A功能测试计划',
          code: 'PROJ-001',
          description: '产品A的主要功能测试项目',
          status: 'active',
          startDate: '2025-04-01',
          plannedEndDate: '2025-05-15',
          manager: '张三',
          members: [
            { user: '张三', role: 'manager', joinedAt: now },
            { user: '李四', role: 'developer', joinedAt: now },
            { user: '王五', role: 'tester', joinedAt: now }
          ],
          creator: '张三',
          createdAt: now,
          updatedAt: now
        },
        {
          _id: uuidv4(),
          name: '产品B性能测试计划',
          code: 'PROJ-002',
          description: '产品B的性能测试项目',
          status: 'active',
          startDate: '2025-05-10',
          plannedEndDate: '2025-05-30',
          manager: '李四',
          members: [
            { user: '李四', role: 'manager', joinedAt: now },
            { user: '王五', role: 'tester', joinedAt: now }
          ],
          creator: '李四',
          createdAt: now,
          updatedAt: now
        },
        {
          _id: uuidv4(),
          name: '产品C安全测试计划',
          code: 'PROJ-003',
          description: '产品C的安全测试项目',
          status: 'completed',
          startDate: '2025-03-15',
          plannedEndDate: '2025-04-15',
          actualEndDate: '2025-04-10',
          manager: '王五',
          members: [
            { user: '王五', role: 'manager', joinedAt: now },
            { user: '张三', role: 'tester', joinedAt: now }
          ],
          creator: '王五',
          createdAt: now,
          updatedAt: now
        }
      ];
      
      saveProjectsToStorage(sampleProjects);
      return sampleProjects;
    }
    
    return projects;
  }
);

// 创建Slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    // 添加一个同步的加载本地存储数据的reducer
    loadLocalProjects: (state) => {
      const projects = loadProjectsFromStorage();
      state.projects = projects;
      state.totalProjects = projects.length;
      
      const stats = generateProjectStats(projects);
      state.statusStats = stats.statusStats;
      state.recentProjects = stats.recentProjects;
      state.upcomingDeadlines = stats.upcomingDeadlines;
    }
  },
  extraReducers: (builder) => {
    // 获取所有项目
    builder.addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = action.payload.projects;
      state.totalProjects = action.payload.pagination.total;
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取单个项目
    builder.addCase(fetchProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProject.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProject = action.payload;
    });
    builder.addCase(fetchProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 创建项目
    builder.addCase(createProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createProject.fulfilled, (state, action) => {
      state.loading = false;
      state.projects.push(action.payload);
    });
    builder.addCase(createProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 更新项目
    builder.addCase(updateProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProject.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.projects.findIndex(project => project._id === action.payload._id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.currentProject && state.currentProject._id === action.payload._id) {
        state.currentProject = action.payload;
      }
    });
    builder.addCase(updateProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 删除项目
    builder.addCase(deleteProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteProject.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = state.projects.filter(project => project._id !== action.payload);
      if (state.currentProject && state.currentProject._id === action.payload) {
        state.currentProject = null;
      }
    });
    builder.addCase(deleteProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 添加项目成员
    builder.addCase(addProjectMember.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addProjectMember.fulfilled, (state, action) => {
      state.loading = false;
      const { projectId, members } = action.payload;
      const index = state.projects.findIndex(project => project._id === projectId);
      if (index !== -1) {
        state.projects[index].members = members;
      }
      if (state.currentProject && state.currentProject._id === projectId) {
        state.currentProject.members = members;
      }
    });
    builder.addCase(addProjectMember.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 移除项目成员
    builder.addCase(removeProjectMember.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeProjectMember.fulfilled, (state, action) => {
      state.loading = false;
      const { projectId, members } = action.payload;
      const index = state.projects.findIndex(project => project._id === projectId);
      if (index !== -1) {
        state.projects[index].members = members;
      }
      if (state.currentProject && state.currentProject._id === projectId) {
        state.currentProject.members = members;
      }
    });
    builder.addCase(removeProjectMember.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 更新项目成员角色
    builder.addCase(updateMemberRole.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateMemberRole.fulfilled, (state, action) => {
      state.loading = false;
      const { projectId, members } = action.payload;
      const index = state.projects.findIndex(project => project._id === projectId);
      if (index !== -1) {
        state.projects[index].members = members;
      }
      if (state.currentProject && state.currentProject._id === projectId) {
        state.currentProject.members = members;
      }
    });
    builder.addCase(updateMemberRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取用户的项目
    builder.addCase(fetchUserProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = action.payload;
    });
    builder.addCase(fetchUserProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取项目统计信息
    builder.addCase(fetchProjectStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjectStats.fulfilled, (state, action) => {
      state.loading = false;
      state.totalProjects = action.payload.totalProjects;
      state.statusStats = action.payload.statusStats;
      state.recentProjects = action.payload.recentProjects;
      state.upcomingDeadlines = action.payload.upcomingDeadlines;
    });
    builder.addCase(fetchProjectStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { clearProjectError, setCurrentProject, loadLocalProjects } = projectSlice.actions;

// 导出Reducer
export default projectSlice.reducer;
