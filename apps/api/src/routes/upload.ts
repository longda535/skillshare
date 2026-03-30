import { Hono } from "hono";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";
import { adminAuth } from "../middleware/adminAuth.js";
import { userAuth } from "../middleware/userAuth.js";

const uploadRoutes = new Hono();

// Ensure uploads directory exists
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

// POST /upload - Allow all authenticated users to upload (avatars, etc.)
uploadRoutes.post("/", userAuth(), async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    // Validate file type (only images)
    if (!file.type.startsWith("image/")) {
      return c.json({ error: "Only images are allowed" }, 400);
    }

    // Generate unique filename
    const extension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${extension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Ensure directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Convert File to Buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Return URL
    const baseUrl = process.env.API_URL || "http://localhost:4000";
    const fileUrl = `${baseUrl}/uploads/${fileName}`;

    return c.json({
      success: true,
      data: {
        url: fileUrl,
        name: file.name,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Internal server error during upload" }, 500);
  }
});

export default uploadRoutes;
