const bcrypt = require("bcryptjs");
const User = require("../modules/user/user.model");

const createAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("Admin credentials not set; skipping admin creation.");
    return;
  }

  const existingAdmin = await User.findOne({
    $or: [{ role: "admin" }, { email: adminEmail }],
  });

  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  await User.create({
    name: "Super Admin",
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin created successfully");
};

module.exports = createAdmin;
