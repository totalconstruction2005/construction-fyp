const mongoose = require("mongoose");
const MapRequest = require("../mapRequest/mapRequest.model");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "client"],
      default: "client",
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("deleteOne", { document: true, query: false }, async function () {
  await MapRequest.deleteMany({ user: this._id });
});

userSchema.pre("findOneAndDelete", async function () {
  const user = await this.model.findOne(this.getFilter());
  if (user) {
    await MapRequest.deleteMany({ user: user._id });
  }
});

module.exports = mongoose.model("User", userSchema);
