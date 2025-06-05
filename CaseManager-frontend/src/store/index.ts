import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import caseLibraryReducer from './slices/caseLibrarySlice';
import testCaseReducer from './slices/testCaseSlice';
import testPlanReducer from './slices/testPlanSlice';
import defectReducer from './slices/defectSlice';
import testReportReducer from './slices/testReportSlice';
import projectReducer from './slices/projectSlice';
import iterationReducer from './slices/iterationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    caseLibrary: caseLibraryReducer,
    testCase: testCaseReducer,
    testPlan: testPlanReducer,
    defect: defectReducer,
    testReport: testReportReducer,
    project: projectReducer,
    iteration: iterationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
