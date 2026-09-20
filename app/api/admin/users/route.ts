import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import {
  getUsersCollection,
  getStudentsCollection,
  getTeachersCollection,
} from "@/lib/db/collections";
import { UserRole } from "@/types";
import { verifyAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyAuthToken(token) : null;
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Administrator role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role")?.toUpperCase();

    const usersCol = await getUsersCollection();
    const studentsCol = await getStudentsCollection();
    const teachersCol = await getTeachersCollection();

    const query = roleParam && ["STUDENT", "TEACHER", "ADMIN"].includes(roleParam)
      ? { role: roleParam as UserRole }
      : {};

    const users = await usersCol
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Map and attach profile details without leaking password hashes
    const sanitizedUsers = await Promise.all(
      users.map(async (u) => {
        let profileDetails: Record<string, unknown> | null = null;
        if (u.role === "STUDENT") {
          const s = await studentsCol.findOne({ userId: u._id });
          if (s) {
            profileDetails = {
              studentId: s.studentId,
              year: s.year,
              semester: s.semester,
              cgpa: s.cgpa,
              phone: s.phone,
            };
          }
        } else if (u.role === "TEACHER") {
          const t = await teachersCol.findOne({ userId: u._id });
          if (t) {
            profileDetails = {
              employeeId: t.employeeId,
              designation: t.designation,
              cabinLocation: t.cabinLocation,
            };
          }
        }

        return {
          id: u._id?.toString(),
          identifier: u.identifier,
          role: u.role,
          name: u.name,
          email: u.email,
          department: u.department,
          createdAt: u.createdAt,
          profile: profileDetails,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        users: sanitizedUsers,
        total: sanitizedUsers.length,
      },
      users: sanitizedUsers,
      total: sanitizedUsers.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Fetch users error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve user directory." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyAuthToken(token) : null;
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Administrator role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      role,
      identifier,
      password,
      name,
      email,
      department,
      year,
      semester,
      phone,
      designation,
      cabinLocation,
    } = body;

    // Validation
    if (!role || !["STUDENT", "TEACHER"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Role must be either STUDENT or TEACHER." },
        { status: 400 }
      );
    }

    if (!identifier || typeof identifier !== "string" || identifier.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Identifier (ID / Roll No / Emp ID) is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 3) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Full Name is required." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanDept = (department || "CSE").trim().toUpperCase();
    const cleanEmail =
      (email && email.trim()) ||
      `${cleanIdentifier.toLowerCase()}@pgi.edu.in`;

    const usersCol = await getUsersCollection();
    const studentsCol = await getStudentsCollection();
    const teachersCol = await getTeachersCollection();

    // Check uniqueness of identifier
    const existing = await usersCol.findOne({ identifier: cleanIdentifier });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `An account with ID "${cleanIdentifier}" already exists in the system.`,
        },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = new ObjectId();
    const now = new Date();

    // 1. Insert into users collection
    await usersCol.insertOne({
      _id: userId,
      identifier: cleanIdentifier,
      passwordHash,
      role: role as UserRole,
      name: cleanName,
      email: cleanEmail,
      department: cleanDept,
      createdAt: now,
    });

    // 2. Insert into role-specific collection
    if (role === "STUDENT") {
      await studentsCol.insertOne({
        _id: new ObjectId(),
        userId,
        studentId: cleanIdentifier,
        department: cleanDept,
        year: Number(year) || 1,
        semester: Number(semester) || 1,
        cgpa: 0.0,
        phone: phone?.trim() || "",
      });
    } else if (role === "TEACHER") {
      await teachersCol.insertOne({
        _id: new ObjectId(),
        userId,
        employeeId: cleanIdentifier,
        department: cleanDept,
        designation: designation?.trim() || "Assistant Professor",
        cabinLocation:
          cabinLocation?.trim() || `Academic Block A, Room ${Math.floor(100 + Math.random() * 400)}`,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Account for ${cleanName} (${cleanIdentifier}) successfully created and saved to MongoDB.`,
        user: {
          id: userId.toString(),
          identifier: cleanIdentifier,
          role,
          name: cleanName,
          email: cleanEmail,
          department: cleanDept,
          createdAt: now,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Create user error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create user account." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyAuthToken(token) : null;
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Administrator role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { identifier, newPassword } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { success: false, error: "User identifier is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 3) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 3 characters." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    const usersCol = await getUsersCollection();

    const user = await usersCol.findOne({
      identifier: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: `Account with ID "${cleanIdentifier}" not found.` },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await usersCol.updateOne(
      { _id: user._id },
      { $set: { passwordHash, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: `Password for ${user.name} (${user.identifier}) has been successfully updated.`,
      user: {
        identifier: user.identifier,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Update password error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update password." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyAuthToken(token) : null;
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Administrator role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      identifier,
      name,
      email,
      department,
      // student fields
      year,
      semester,
      cgpa,
      phone,
      // teacher fields
      designation,
      cabinLocation,
    } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { success: false, error: "User identifier is required." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    const usersCol = await getUsersCollection();
    const studentsCol = await getStudentsCollection();
    const teachersCol = await getTeachersCollection();

    const user = await usersCol.findOne({
      identifier: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: `Account with ID "${cleanIdentifier}" not found.` },
        { status: 404 }
      );
    }

    // 1. Update basic user details
    const userUpdateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (name && typeof name === "string" && name.trim().length > 0) {
      userUpdateFields.name = name.trim();
    }
    if (email && typeof email === "string" && email.trim().length > 0) {
      userUpdateFields.email = email.trim();
    }
    if (department && typeof department === "string" && department.trim().length > 0) {
      userUpdateFields.department = department.trim().toUpperCase();
    }

    await usersCol.updateOne({ _id: user._id }, { $set: userUpdateFields });

    // 2. Update role-specific collections
    if (user.role === "STUDENT") {
      const studentUpdateFields: Record<string, unknown> = {};
      if (department) studentUpdateFields.department = department.trim().toUpperCase();
      if (year !== undefined) studentUpdateFields.year = Number(year) || 1;
      if (semester !== undefined) studentUpdateFields.semester = Number(semester) || 1;
      if (cgpa !== undefined) studentUpdateFields.cgpa = Number(cgpa) || 0.0;
      if (phone !== undefined) studentUpdateFields.phone = String(phone).trim();

      await studentsCol.updateOne(
        { userId: user._id },
        { $set: studentUpdateFields },
        { upsert: false }
      );
    } else if (user.role === "TEACHER") {
      const teacherUpdateFields: Record<string, unknown> = {};
      if (department) teacherUpdateFields.department = department.trim().toUpperCase();
      if (designation && typeof designation === "string") {
        teacherUpdateFields.designation = designation.trim();
      }
      if (cabinLocation && typeof cabinLocation === "string") {
        teacherUpdateFields.cabinLocation = cabinLocation.trim();
      }

      await teachersCol.updateOne(
        { userId: user._id },
        { $set: teacherUpdateFields },
        { upsert: false }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Account details for ${name || user.name} (${user.identifier}) updated successfully.`,
      user: {
        identifier: user.identifier,
        name: name || user.name,
        email: email || user.email,
        department: department || user.department,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Update user error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update user details." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyAuthToken(token) : null;
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Administrator role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("identifier");

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { success: false, error: "User identifier is required in query parameter." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // Prevent deleting superadmin "admin"
    if (
      cleanIdentifier.toLowerCase() === "admin" ||
      session.identifier.toLowerCase() === cleanIdentifier.toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, error: "Root administrator account cannot be deleted." },
        { status: 400 }
      );
    }

    const usersCol = await getUsersCollection();
    const studentsCol = await getStudentsCollection();
    const teachersCol = await getTeachersCollection();

    const user = await usersCol.findOne({
      identifier: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: `Account with ID "${cleanIdentifier}" not found.` },
        { status: 404 }
      );
    }

    // Cascade delete from role-specific collection
    if (user.role === "STUDENT") {
      await studentsCol.deleteOne({ userId: user._id });
    } else if (user.role === "TEACHER") {
      await teachersCol.deleteOne({ userId: user._id });
    }

    // Delete from users collection
    await usersCol.deleteOne({ _id: user._id });

    return NextResponse.json({
      success: true,
      message: `Account ${user.name} (${user.identifier}) and all associated records have been permanently deleted from MongoDB.`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Delete user error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete user." },
      { status: 500 }
    );
  }
}
