const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require("./modules/user/user.routes");
const forgotPasswordRoutes = require("./modules/user/forgotPassword.routes");
const mapRequestRoutes = require("./modules/mapRequest/mapRequest.routes");
const contractorPlanRoutes = require("./modules/contractorPlans/contractorPlan.routes");
const contractorRequestRoutes = require("./modules/contractorRequest/contractorRequest.routes");
const projectUpdateRoutes = require("./modules/projectUpdate/projectUpdate.routes");
const floorPlanRoutes = require("./modules/floorPlan/floorPlan.routes");
const floorPlanPublicRoutes = require("./modules/floorPlan/floorPlan.public.routes");
const employeeRoutes = require("./modules/employee/employee.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const estimatorRoutes = require("./modules/estimator/estimator.routes");
const estimatorAdminRoutes = require("./modules/estimator/estimator.admin.routes");
const reviewRoutes = require("./modules/review/review.routes");
const contactRoutes = require("./modules/contact/contact.routes");
const authMiddleware = require("./middleware/auth");
const adminOnly = require("./middleware/adminOnly");

app.use("/api/user", userRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/auth", forgotPasswordRoutes);
app.use("/api/map-requests", mapRequestRoutes);
app.use("/api/contractor-plans", contractorPlanRoutes);
app.use("/api/contractor-requests", contractorRequestRoutes);
app.use("/api/project-updates", projectUpdateRoutes);
app.use("/api/floor-plans", floorPlanPublicRoutes);
app.use("/api/admin/floor-plans", floorPlanRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
// Estimator public endpoints
app.use("/api/estimator", estimatorRoutes);
// Estimator admin endpoints (protected)
app.use("/api/admin/estimator", authMiddleware, adminOnly, estimatorAdminRoutes);
// Reviews public and admin endpoints
app.use("/api/reviews", reviewRoutes);
// Contact / Schedule meeting endpoint
app.use("/api/contact", contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    data: null,
    errorCode: "ENDPOINT_NOT_FOUND",
  });
});

// Global error handler (MUST be last)
app.use(errorHandler);

module.exports = app;
