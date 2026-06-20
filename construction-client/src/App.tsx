import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Home, About, OurProjects } from "@features/home";
import { ConstructionCostEstimator, FinalConstructionCost } from "@features/estimator";
import { VisualizationOption, CustomDesign, MapConvert, MyMapRequests } from "@features/visualization";
import { ContractorPlans, ContractorRequestForm, ContractorRequestSuccess } from "@features/contractor";
import { ProtectedRoute, Login, Signup } from "@features/auth";
import ForgotPasswordPage from "@features/auth/pages/ForgotPasswordPage";
import VerifyCodePage from "@features/auth/pages/VerifyCodePage";
import ResetPasswordPage from "@features/auth/pages/ResetPasswordPage";
import Settings from "@pages/Settings";
import {
  AdminRoute,
  AdminDashboard,
  EmployeeManagement,
  MapRequests,
  MapRequestDetails,
  UserDetails,
  ProjectApproval,
  ProjectUpdates,
  Settings as AdminSettings,
  ChangePassword,
  ContractorPlansAdmin,
  AddContractorPlan,
  AdminFloorPlans,
  EstimatorDashboard,
  EstimatorRegions,
  EstimatorBreakdownTree,
  EstimatorPreview,
  EstimatorPopularCalculations,
} from "@features/admin";
import { BookProject, MyProjects, ClientProjectUpdates } from "@features/project";
import { ContactUs } from "@features/contact";
import ScrollToTop from "@routes/ScrollToTop";
import { ErrorBoundary } from "@shared/components";
import { ClientLayout } from "@layouts";
import AdminLayout from "@features/admin/components/AdminLayout";

function App() {
  const LegacyProjectRedirect = () => {
    const { projectId } = useParams<{ projectId: string }>();
    if (!projectId) {
      return <Navigate to="/projects" replace />;
    }
    return <Navigate to={`/projects/${projectId}`} replace />;
  };
 

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/our-projects" element={<OurProjects />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/estimator" element={<ConstructionCostEstimator />} />
        <Route path="/estimator/final-construction-cost" element={<FinalConstructionCost />} />
        <Route path="/design-studio" element={<VisualizationOption />} />
        <Route path="/design-studio/my-requests" element={<MyMapRequests />} />
        <Route
          path="/design-studio/custom-design"
          element={
            <ProtectedRoute>
              <CustomDesign />
            </ProtectedRoute>
          }
        />
        <Route path="/design-studio/3d-map" element={<MapConvert />} />
        <Route path="/construct-your-house" element={<ContractorPlans/>}/>
        <Route path="/contractor-plans" element={<ContractorPlans/>}/>
        <Route path="/hire/:planId" element={<ContractorRequestForm />} />
        <Route path="/hire/:planId/success" element={<ContractorRequestSuccess />} />
        <Route path="/book-project" element={<BookProject />} />
        {/* Legacy client routes */}
        <Route path="/progress-tracking" element={<Navigate to="/my-projects" replace />} />
        <Route path="/dashboard" element={<Navigate to="/my-projects" replace />} />
        <Route path="/projects" element={<Navigate to="/my-projects" replace />} />
        <Route path="/progress-tracking/:projectId" element={<LegacyProjectRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/verify-code" element={<VerifyCodePage />} />
        <Route path="/reset-password/new-password" element={<ResetPasswordPage />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="projects" element={<ProjectApproval />} />
          <Route path="projects/:projectId/updates" element={<ProjectUpdates />} />
          <Route path="floor-plans" element={<AdminFloorPlans />} />
          <Route path="map-requests" element={<MapRequests />} />
          <Route path="map-requests/:id" element={<MapRequestDetails />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="settings/change-password" element={<ChangePassword />} />
          <Route path="settings/contractor-plans" element={<ContractorPlansAdmin />} />
          <Route path="settings/contractor-plans/add" element={<AddContractorPlan />} />
          <Route path="estimator" element={<EstimatorDashboard />} />
          <Route path="estimator/regions" element={<EstimatorRegions />} />
          <Route path="estimator/breakdown" element={<EstimatorBreakdownTree />} />
          <Route path="estimator/preview" element={<EstimatorPreview />} />
          <Route
  path="estimator/popular-calculations"
  element={<EstimatorPopularCalculations />}
/>
        </Route>

        {/* Client Routes */}
        <Route
          element={
            <ProtectedRoute>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/projects/:projectId" element={<ClientProjectUpdates />} />
          
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

export default App
