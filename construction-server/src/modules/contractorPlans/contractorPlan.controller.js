const mongoose = require("mongoose");
const ContractorPlan = require("./contractorPlan.model");

const toSlug = (value) => {
  if (!value) return "";
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const sendResponse = (res, status, payload) =>
  res.status(status).json(payload);

const handleError = (res, error, defaultMessage) => {
  console.error(error);

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map(
      (err) => err.message
    );

    return sendResponse(res, 400, {
      success: false,
      message: messages.join(", "),
      data: null,
    });
  }

  if (error.code === 11000) {
    return sendResponse(res, 400, {
      success: false,
      message: "Plan title already exists.",
      data: null,
    });
  }

  if (error.name === "CastError") {
    return sendResponse(res, 400, {
      success: false,
      message: "Invalid ID.",
      data: null,
    });
  }

  return sendResponse(res, 500, {
    success: false,
    message: defaultMessage,
    data: null,
  });
};

/* ===========================================
   CREATE PLAN
=========================================== */

exports.createPlan = async (req, res) => {
  try {
    const {
      title,
      badge,
      subtitle,
      price,
      currency,
      priceUnit,
      estimateText,
      description,
      includedFeatures,
      excludedFeatures,
      timeline,
      idealFor,
      buttonText,
      recommended,
      theme,
      isActive,
    } = req.body;

    if (!title || !title.trim()) {
      return sendResponse(res, 400, {
        success: false,
        message: "Title is required.",
        data: null,
      });
    }

    if (price === undefined || price === null || price < 0) {
      return sendResponse(res, 400, {
        success: false,
        message: "Valid price is required.",
        data: null,
      });
    }

    if (
      includedFeatures &&
      !Array.isArray(includedFeatures)
    ) {
      return sendResponse(res, 400, {
        success: false,
        message: "includedFeatures must be an array.",
        data: null,
      });
    }

    if (
      excludedFeatures &&
      !Array.isArray(excludedFeatures)
    ) {
      return sendResponse(res, 400, {
        success: false,
        message: "excludedFeatures must be an array.",
        data: null,
      });
    }

    const plan = await ContractorPlan.create({
      title: title.trim(),

      badge: badge || "",

      subtitle: subtitle || "",

      price,

      currency: currency || "Rs.",

      priceUnit: priceUnit || "per sq ft",

      estimateText: estimateText || "",

      description: description || "",

      includedFeatures: includedFeatures || [],

      excludedFeatures: excludedFeatures || [],

      timeline: timeline || "",

      idealFor: idealFor || "",

      buttonText: buttonText || "Select Package",

      recommended:
        recommended !== undefined
          ? recommended
          : false,

      theme: theme || "green",

      isActive:
        isActive !== undefined
          ? isActive
          : true,
    });

    return sendResponse(res, 201, {
      success: true,
      message: "Plan created successfully.",
      data: plan,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to create contractor plan."
    );
  }
};

/* ===========================================
   GET ALL PLANS
=========================================== */

exports.getAllPlans = async (req, res) => {
  try {

    const isAdmin =
      req.user &&
      req.user.role === "admin";

    const filter = isAdmin
      ? {}
      : { isActive: true };

    const plans = await ContractorPlan.find(filter)
      .sort({ sortOrder: 1 })
      .lean();

    return sendResponse(res, 200, {
      success: true,
      message: "Plans fetched successfully.",
      data: plans,
    });

  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to fetch plans."
    );
  }
};

/* ===========================================
   UPDATE PLAN
=========================================== */

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, {
        success: false,
        message: "Invalid plan ID.",
        data: null,
      });
    }

    const updateData = { ...req.body };

    if (
      updateData.title !== undefined &&
      !updateData.title.trim()
    ) {
      return sendResponse(res, 400, {
        success: false,
        message: "Title cannot be empty.",
        data: null,
      });
    }

    if (
      updateData.price !== undefined &&
      updateData.price < 0
    ) {
      return sendResponse(res, 400, {
        success: false,
        message: "Price must be greater than or equal to 0.",
        data: null,
      });
    }

    if (
      updateData.includedFeatures &&
      !Array.isArray(updateData.includedFeatures)
    ) {
      return sendResponse(res, 400, {
        success: false,
        message: "includedFeatures must be an array.",
        data: null,
      });
    }

    if (
      updateData.excludedFeatures &&
      !Array.isArray(updateData.excludedFeatures)
    ) {
      return sendResponse(res, 400, {
        success: false,
        message: "excludedFeatures must be an array.",
        data: null,
      });
    }

    if (updateData.title) {
      updateData.title = updateData.title.trim();
      updateData.slug = toSlug(updateData.title);

      const existingPlan =
        await ContractorPlan.findOne({
          slug: updateData.slug,
          _id: { $ne: id },
        });

      if (existingPlan) {
        return sendResponse(res, 400, {
          success: false,
          message: "Plan title already exists.",
          data: null,
        });
      }
    }

    const updatedPlan =
      await ContractorPlan.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedPlan) {
      return sendResponse(res, 404, {
        success: false,
        message: "Plan not found.",
        data: null,
      });
    }

    return sendResponse(res, 200, {
      success: true,
      message: "Plan updated successfully.",
      data: updatedPlan,
    });

  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to update contractor plan."
    );
  }
};

/* ===========================================
   DELETE PLAN
=========================================== */

exports.deletePlan = async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {

      return sendResponse(res,400,{
        success:false,
        message:"Invalid plan ID.",
        data:null
      });

    }

    const deleted =
      await ContractorPlan.findByIdAndDelete(id);

    if (!deleted) {

      return sendResponse(res,404,{
        success:false,
        message:"Plan not found.",
        data:null
      });

    }

    return sendResponse(res,200,{
      success:true,
      message:"Plan deleted successfully.",
      data:null
    });

  } catch (error) {

    return handleError(
      res,
      error,
      "Failed to delete contractor plan."
    );

  }

};


/* ===========================================
   REORDER PLANS
=========================================== */

exports.reorderPlans = async (req,res)=>{

try{

const {orderedIds}=req.body;

if(!Array.isArray(orderedIds)){

return sendResponse(res,400,{
success:false,
message:"orderedIds must be an array.",
data:null
});

}

const bulkOps=orderedIds.map((id,index)=>({

updateOne:{
filter:{_id:id},
update:{sortOrder:index}
}

}));

await ContractorPlan.bulkWrite(bulkOps);

return sendResponse(res,200,{
success:true,
message:"Plans reordered successfully.",
data:null
});

}catch(error){

return handleError(
res,
error,
"Failed to reorder plans."
);

}

};