// 通用响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应数据
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 用户类型
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

// 角色类型
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
}

// 项目类型
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 迭代类型
export interface Iteration {
  id: string;
  name: string;
  projectId: string;
  status: 'planning' | 'in_progress' | 'completed';
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 用例库类型
export interface CaseLibrary {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 测试用例类型
export interface TestCase {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'DRAFT' | 'ACTIVE' | 'DEPRECATED';
  type: 'functional' | 'performance' | 'security' | 'usability';
  preconditions: string;
  steps: TestStep[];
  expectedResults: string;
  libraryId: string;
  directoryId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 测试步骤类型
export interface TestStep {
  id: string;
  order: number;
  description: string;
  expectedResult: string;
}

// 测试计划类型
export interface TestPlan {
  id: string;
  name: string;
  projectId: string;
  iterationId: string;
  status: 'planning' | 'in_progress' | 'completed';
  progress: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 缺陷类型
export interface Defect {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'FIXED' | 'VERIFIED' | 'CLOSED' | 'REJECTED';
  type: 'BUG' | 'ENHANCEMENT' | 'TASK';
  projectId: string;
  iterationId: string;
  testPlanId: string;
  testCaseId: string;
  assignedTo: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

// 测试报告类型
export interface TestReport {
  id: string;
  title: string;
  projectId: string;
  iterationId: string;
  testPlanId: string;
  status: 'DRAFT' | 'PUBLISHED';
  summary: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  blockedCases: number;
  passRate: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
