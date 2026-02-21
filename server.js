const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

/* ================= LOAD ENV ================= */
dotenv.config();

/* ================= APP INIT ================= */
const app = express();
const PORT = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */
app.use(express.json());

// ✅ CORS (Local + Live Domain)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL, // live frontend URL from Render env
    ],
    credentials: true,
  })
);

/* ================= DATABASE CONNECTION ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

/* ================= EMAIL CONFIG ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

/* ================= MODELS ================= */

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    systemId: String,
    password: { type: String, required: true, select: false },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true },
    joinedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

/* ================= UTIL FUNCTION ================= */
const generateSystemId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `MEETRA-${randomNum}`;
};

/* ================= AUTH ROUTES ================= */

// ✅ SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      systemId: generateSystemId(),
    });

    res.status(201).json({
      message: "User registered successfully",
      systemId: newUser.systemId,
    });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// ✅ LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Credentials required" });

    let user =
      (await Employee.findOne({
        $or: [{ email }, { employeeId: email }],
      }).select("+password")) ||
      (await User.findOne({ email }).select("+password"));

    if (!user)
      return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials" });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
});

// ✅ FORGOT PASSWORD
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user =
      (await User.findOne({ email })) ||
      (await Employee.findOne({ email }));

    if (!user)
      return res.status(404).json({ error: "Email not found" });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${email}`;

    await transporter.sendMail({
      from: `Meetra Green Support <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password - Meetra Green Energy",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" 
           style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
           Reset Password
        </a>
      `,
    });

    res.json({ message: "Reset link sent successfully" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: "Email sending failed" });
  }
});

// ✅ RESET PASSWORD
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ error: "Missing fields" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let updated =
      (await Employee.findOneAndUpdate({ email }, { password: hashedPassword })) ||
      (await User.findOneAndUpdate({ email }, { password: hashedPassword }));

    if (!updated)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Reset failed" });
  }
});

/* ================= IMPORT OTHER ROUTES ================= */

app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api", require("./routes/surveyRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));

/* ================= STATIC FILES ================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("🚀 Meetra Green Backend Running");
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});