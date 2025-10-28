import bcrypt from "bcryptjs";
import connectDB from "./mongodb";

export interface AdminUser {
  email: string;
  password: string;
  name: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Check if admin user exists in database
 * @param email - Admin email
 * @returns True if admin exists
 */
export async function adminExists(email: string): Promise<boolean> {
  try {
    await connectDB();

    // Check if admin exists in NextAuth users collection
    const { default: mongoose } = await import("mongoose");
    const User =
      mongoose.models.User ||
      mongoose.model(
        "User",
        new mongoose.Schema({
          email: String,
          name: String,
          role: String,
        })
      );

    const admin = await User.findOne({ email, role: "admin" });
    return !!admin;
  } catch (error) {
    console.error("Error checking admin existence:", error);
    return false;
  }
}

/**
 * Create admin user in database
 * @param email - Admin email
 * @param password - Plain text password
 * @param name - Admin name
 * @returns Created admin user
 */
export async function createAdminUser(
  email: string,
  password: string,
  name: string = "Admin"
): Promise<AdminUser> {
  try {
    await connectDB();

    const { default: mongoose } = await import("mongoose");

    // Create User schema if it doesn't exist
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      password: { type: String, required: true },
      role: { type: String, default: "admin" },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      throw new Error("Admin user already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const adminUser = new User({
      email,
      name,
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();

    console.log(`✅ Admin user created: ${email}`);

    return {
      email: adminUser.email,
      password: adminUser.password,
      name: adminUser.name,
      role: adminUser.role,
      createdAt: adminUser.createdAt,
      updatedAt: adminUser.updatedAt,
    };
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

/**
 * Seed admin user if it doesn't exist
 * @param email - Admin email from env
 * @param password - Admin password from env
 * @param name - Admin name
 */
export async function seedAdminUser(
  email: string,
  password: string,
  name: string = "Admin"
): Promise<void> {
  try {
    const exists = await adminExists(email);

    if (!exists) {
      console.log("🔧 Creating admin user...");
      await createAdminUser(email, password, name);
    } else {
      console.log("✅ Admin user already exists");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
    throw error;
  }
}

/**
 * Verify admin credentials
 * @param email - Admin email
 * @param password - Plain text password
 * @returns True if credentials are valid
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  try {
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const User =
      mongoose.models.User ||
      mongoose.model(
        "User",
        new mongoose.Schema({
          email: String,
          password: String,
          role: String,
        })
      );

    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
      return false;
    }

    return await verifyPassword(password, admin.password);
  } catch (error) {
    console.error("Error verifying admin credentials:", error);
    return false;
  }
}
