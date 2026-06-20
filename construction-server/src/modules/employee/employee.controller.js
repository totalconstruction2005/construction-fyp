const mongoose = require("mongoose");
const Employee = require("./employee.model");
const validators = require("../../utils/validators");
const { AppError, asyncHandler } = require("../../middleware/errorHandler");

exports.getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({})
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();

  return res.status(200).json({
    success: true,
    data: employees,
  });
});

exports.createEmployee = asyncHandler(async (req, res) => {
  const { name, email, role, phone, status } = req.body;

  // Validate required fields
  const missingFields = validators.validateRequired(req.body, ["name", "email", "role"]);
  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
      "MISSING_REQUIRED_FIELDS"
    );
  }

  // Validate email format
  const trimmedEmail = email.trim().toLowerCase();
  if (!validators.validateEmail(trimmedEmail)) {
    throw new AppError("Invalid email format", 400, "INVALID_EMAIL_FORMAT");
  }

  // Check for duplicate email
  const existingEmployee = await Employee.findOne({ email: trimmedEmail }).lean();
  if (existingEmployee) {
    throw new AppError(
      "An employee with this email already exists",
      400,
      "DUPLICATE_EMAIL"
    );
  }

  // Validate status enum
  const validStatuses = ["Active", "On Leave", "Inactive"];
  if (status && !validators.validateEnum(status, validStatuses)) {
    throw new AppError(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      400,
      "INVALID_STATUS"
    );
  }

  const employee = await Employee.create({
    name: validators.sanitizeString(name),
    email: trimmedEmail,
    role: validators.sanitizeString(role),
    phone: phone ? validators.sanitizeString(phone) : undefined,
    status: status || "Active",
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    data: employee,
  });
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!validators.validateObjectId(id)) {
    throw new AppError("Invalid employee ID format", 400, "INVALID_ID_FORMAT");
  }

  const { name, email, role, phone, status } = req.body;
  const updateData = {};

  // Validate and sanitize name if provided
  if (name !== undefined) {
    if (!name.trim()) {
      throw new AppError("Name cannot be empty", 400, "INVALID_NAME");
    }
    updateData.name = validators.sanitizeString(name);
  }

  // Validate and sanitize email if provided
  if (email !== undefined) {
    const trimmedEmail = email.trim().toLowerCase();
    if (!validators.validateEmail(trimmedEmail)) {
      throw new AppError("Invalid email format", 400, "INVALID_EMAIL_FORMAT");
    }

    // Check for duplicate with different ID
    const existingEmployee = await Employee.findOne({
      email: trimmedEmail,
      _id: { $ne: id },
    }).lean();

    if (existingEmployee) {
      throw new AppError(
        "An employee with this email already exists",
        400,
        "DUPLICATE_EMAIL"
      );
    }

    updateData.email = trimmedEmail;
  }

  // Validate and sanitize role if provided
  if (role !== undefined) {
    if (!role.trim()) {
      throw new AppError("Role cannot be empty", 400, "INVALID_ROLE");
    }
    updateData.role = validators.sanitizeString(role);
  }

  // Validate and sanitize phone if provided
  if (phone !== undefined) {
    updateData.phone = phone ? validators.sanitizeString(phone) : undefined;
  }

  // Validate status if provided
  if (status !== undefined) {
    const validStatuses = ["Active", "On Leave", "Inactive"];
    if (!validators.validateEnum(status, validStatuses)) {
      throw new AppError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400,
        "INVALID_STATUS"
      );
    }
    updateData.status = status;
  }

  updateData.updatedBy = req.user._id;

  const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!updatedEmployee) {
    throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    data: updatedEmployee,
  });
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!validators.validateObjectId(id)) {
    throw new AppError("Invalid employee ID format", 400, "INVALID_ID_FORMAT");
  }

  const deletedEmployee = await Employee.findByIdAndDelete(id);

  if (!deletedEmployee) {
    throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  }

  return res.status(200).json({
    success: true,
    message: "Employee deleted successfully",
    data: null,
  });
});
