import { GenerateUploadUrl } from '@/lib/s3';
import { url } from 'inspector';
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    try {
        const { fileName, fileType } = await request.json();

        if (!fileName || !fileType) {
            return new Response(JSON.stringify({ error: "Missing fileName or fileType" }), { status: 400 });
        }

        // Call your S3 utility to generate the presigned URL
        const uploadURL = await GenerateUploadUrl(fileName, fileType);

        return NextResponse.json({
            message: "Presigned URL generated successfully",
            data: uploadURL

        })

    } catch (error: any) {
        console.error("❌ Presigned URL generation error:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal server error" }), { status: 500 });
    }
}