import WorkOrder, { IWorkOrder } from "@/models/WorkOrder";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        // --- Fetch Job with relations from DB ---
        const job = await WorkOrder.findById(id).populate('created_by');

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // --- Create a new PDF ---
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        const { height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const drawText = (
            text: string,
            x: number,
            y: number,
            size = 10,
            color = rgb(0, 0, 0)
        ) => {
            page.drawText(text || "", { x, y, size, font, color });
        };

        const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
            page.drawLine({
                start: { x: x1, y: y1 },
                end: { x: x2, y: y2 },
                thickness: 0.5,
                color: rgb(0.6, 0.6, 0.6),
            });
        };

        let y = height - 50;

        // --- Header ---
        drawText("WORK ORDER", 240, y, 16);
        drawText("LEETH FUTURE", 450, y, 12);
        y -= 40;


        // --- Job Information ---
        const info = [
            ["CLIENT NAME/CODE", job.client.name || job.client.code || ""],
            ["ORDER NUMBER", job.order_number || ""],
            ["ORDER RECEIVED BY", job?.order_detail?.received_by || ""],
            ["ORDER DATE & TIME", new Date(job.createdAt).toLocaleString()],
            ["JOB START DATE", job?.order_detail?.job_start_date?.toLocaleDateString?.() || ""],
            ["DATE PROMISED", job?.order_detail?.date_promised?.toLocaleDateString?.() || ""],
            ["DATE DELIVERED", job?.order_detail?.date_delivered?.toLocaleDateString?.() || ""],
            ["JOB PRIORITY", job?.job_info?.priority || ""],
            ["JOB TYPE", job?.job_info?.type || ""],
        ];

        info.forEach(([label, value]) => {
            drawText(label + ":", 50, y);
            drawText(value, 180, y);
            y -= 18;
        });

        y -= 10;
        drawText("JOB DESCRIPTION:", 50, y);
        y -= 15;
        drawText(job?.job_info?.description || "", 50, y);
        y -= 30;

        // --- LABOUR SECTION ---
        drawText("LABOUR DETAILS", 50, y, 12);
        y -= 15;
        drawLine(50, y, 545, y);
        y -= 20;

        drawText("DATE", 50, y);
        drawText("LABOUR DESCRIPTION", 130, y);
        drawText("HOURS", 480, y);
        y -= 10;
        drawLine(50, y, 545, y);
        y -= 15;

        for (const lab of job.labour_entry) {
            if (y < 100) {
                // Add new page when space runs out
                const newPage = pdfDoc.addPage([595.28, 841.89]);
                y = 800;
            }
            drawText(lab.date?.toLocaleDateString() || "", 50, y);
            drawText(lab.description || "", 130, y);
            drawText(String(lab.hours || ""), 490, y);
            y -= 15;
        }

        const totalHours = job?.total.total_labour_hours || 0;


        y -= 15;
        drawText("TOTAL HOURS:", 400, y);
        drawText(String(totalHours), 490, y);
        y -= 30;

        // --- MATERIAL SECTION ---
        drawText("MATERIAL DETAILS", 50, y, 12);
        y -= 15;
        drawLine(50, y, 545, y);
        y -= 20;

        drawText("DESCRIPTION", 50, y);
        drawText("QUANTITY", 300, y);
        // drawText("UNIT PRICE", 400, y);
        // drawText("AMOUNT", 490, y);
        y -= 10;
        drawLine(50, y, 545, y);
        y -= 15;

        for (const mat of job.material_entry) {
            if (y < 100) {
                const newPage = pdfDoc.addPage([595.28, 841.89]);
                y = 800;
            }
            drawText(mat.description || "", 50, y);
            drawText(String(mat.quantity || ""), 310, y);
            y -= 15;
        }

        y -= 15;

        // --- Footer ---
        drawText(
            "JOB CHECKED AND APPROVED BY ______________________",
            50,
            y
        );
        drawText(job.created_by?.first_name || "", 250, y);
        // drawText("DELIVERED ON TIME: YES ☐   NO ☐", 400, y);
        y -= 25;

        drawText("JOB REMARKS:", 50, y);
        y -= 15;
        drawText(job.remarks || "", 50, y);

        // --- Return the PDF ---
        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);


        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="jobcard_${id}.pdf"`,
            },
        });
    } catch (err) {
        console.error("Error generating jobcard PDF:", err);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }
}
