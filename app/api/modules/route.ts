import { connectDB } from "@/lib/mongoose";
import Module from "@/models/Modules";
import { NextResponse } from "next/server";

// GET all users
export async function GET() {
    try {
        await connectDB();
        const modules = await Module.find({});
        console.log("Fetched Modules:", modules);
        return NextResponse.json(modules);
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 });
    }
}

