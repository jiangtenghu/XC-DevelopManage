import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import './App.css';

// Redux actions
import { initializeProjects } from './store/slices/projectSlice';
import { initializeIterations } from './store/slices/iterationSlice';

// 布局组件
import MainLayout from './layouts/MainLayout';

// 页面组件
import Dashboard from './pages/Dashboard';
import CaseLibrary from './pages/CaseLibrary';
import Login from './pages/Login';
import Project from './pages/Project';
import Iteration from './pages/Iteration';

// 动态导入其他页面组件，避免TypeScript错误
const TestCase = React.lazy(() => import('./pages/TestCase'));
const TestPlan = React.lazy(() => import('./pages/TestPlan'));
const Defect = React.lazy(() => import('./pages/Defect'));
const TestReport = React.lazy(() => import('./pages/TestReport'));
const Settings = React.lazy(() => import('./pages/Settings'));

// 加载中组件
const LoadingFallback = () => <div>加载中...</div>;

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 初始化数据
  useEffect(() => {
    // 初始化项目数据
    dispatch(initializeProjects());
    // 初始化迭代数据
    dispatch(initializeIterations());
  }, [dispatch]);
  
  // 模拟用户登录状态
  const isLoggedIn = true;

  // 如果用户未登录，重定向到登录页面
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <React.Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project" element={<Project />} />
          <Route path="/iteration" element={<Iteration />} />
          <Route path="/case-library" element={<CaseLibrary />} />
          <Route path="/test-case" element={<TestCase />} />
          <Route path="/test-plan" element={<TestPlan />} />
          <Route path="/defect" element={<Defect />} />
          <Route path="/test-report" element={<TestReport />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </MainLayout>
  );
};

export default App;
