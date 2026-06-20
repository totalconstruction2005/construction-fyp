const Employee = require("../employee/employee.model");
const MapRequest = require("../mapRequest/mapRequest.model");
const ContractorRequest = require("../contractorRequest/contractorRequest.model");

const sendResponse = (res, status, payload) => res.status(status).json(payload);

exports.getAdminDashboard = async (req, res) => {
  try {
    // Fetch all counts in parallel for performance
    const [
      pendingMapRequests,
      pendingContractorRequests,
      approvedContractorRequests,
      inProgressContractorRequests,
      completedContractorRequests,
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
    ] = await Promise.all([
      MapRequest.countDocuments({ status: "Pending" }),
      ContractorRequest.countDocuments({ status: "Pending" }),
      ContractorRequest.countDocuments({ status: "Approved" }),
      ContractorRequest.countDocuments({ status: "In Progress" }),
      ContractorRequest.countDocuments({ status: "Completed" }),
      Employee.countDocuments(),
      Employee.countDocuments({ status: "Active" }),
      Employee.countDocuments({ status: "On Leave" }),
    ]);

    return sendResponse(res, 200, {
      success: true,
      data: {
        pendingMapRequests,
        pendingContractorRequests,
        approvedProjects: approvedContractorRequests,
        inProgressProjects: inProgressContractorRequests,
        completedProjects: completedContractorRequests,
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        pendingAppointments: 0, // No appointment model yet, return 0
      },
    });
  } catch (error) {
    console.error("Dashboard controller error:", error);
    return sendResponse(res, 500, {
      success: false,
      message: "Failed to fetch dashboard data",
      data: null,
    });
  }
};
