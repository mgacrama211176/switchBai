import { NextRequest, NextResponse } from "next/server";
import { createAdminUser, adminExists } from "@/lib/auth-db";

export async function POST(request: NextRequest) {
  try {
    // Check authorization token
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.ADMIN_CREATION_TOKEN;

    if (!expectedToken) {
      console.error("ADMIN_CREATION_TOKEN not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Check if admin already exists
    const exists = await adminExists(email);
    if (exists) {
      return NextResponse.json(
        { error: "Admin user already exists" },
        { status: 409 },
      );
    }

    // Create admin user
    const adminUser = await createAdminUser(email, password, name || "Admin");

    return NextResponse.json(
      {
        success: true,
        message: "Admin user created successfully",
        user: {
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          createdAt: adminUser.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 },
    );
  }
}

// Optional: GET route to check if admin exists
export async function GET(request: NextRequest) {
  try {
    // Check authorization token
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.ADMIN_CREATION_TOKEN;

    if (!expectedToken) {
      console.error("ADMIN_CREATION_TOKEN not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 },
      );
    }

    const exists = await adminExists(email);
    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Error checking admin existence:", error);
    return NextResponse.json(
      { error: "Failed to check admin existence" },
      { status: 500 },
    );
  }
}
