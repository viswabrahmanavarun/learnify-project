import { Response } from "express";
import PDFDocument from "pdfkit";

interface CertificatePDFData {
  studentName: string;
  courseTitle: string;
  issuedAt: Date;
  certificateNo?: string;
}

/* =========================
   GENERATE CERTIFICATE PDF
========================= */
export const generateCertificatePDF = (
  res: Response,
  data: CertificatePDFData
) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "inline; filename=certificate.pdf"
  );

  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  /* =========================
     BORDER
  ========================= */
  doc
    .rect(20, 20, pageWidth - 40, pageHeight - 40)
    .lineWidth(3)
    .stroke("#6b21a8"); // Purple border

  /* =========================
     PLATFORM NAME
  ========================= */
  doc
    .fontSize(18)
    .fillColor("#6b21a8")
    .font("Helvetica-Bold")
    .text("Learnify", 0, 60, {
      align: "center",
    });

  doc
    .moveDown(0.5)
    .fontSize(12)
    .fillColor("#444")
    .font("Helvetica")
    .text("Learning Management Platform", {
      align: "center",
    });

  /* =========================
     TITLE
  ========================= */
  doc
    .moveDown(2)
    .fontSize(34)
    .fillColor("#000")
    .font("Helvetica-Bold")
    .text("Certificate of Completion", {
      align: "center",
    });

  /* =========================
     BODY TEXT
  ========================= */
  doc
    .moveDown(2)
    .fontSize(16)
    .font("Helvetica")
    .fillColor("#333")
    .text("This is to certify that", {
      align: "center",
    });

  /* =========================
     STUDENT NAME
  ========================= */
  doc
    .moveDown(1)
    .fontSize(30)
    .font("Helvetica-Bold")
    .fillColor("#000")
    .text(data.studentName, {
      align: "center",
    });

  doc
    .moveDown(1)
    .fontSize(16)
    .font("Helvetica")
    .fillColor("#333")
    .text("has successfully completed the course", {
      align: "center",
    });

  /* =========================
     COURSE TITLE
  ========================= */
  doc
    .moveDown(1)
    .fontSize(26)
    .font("Helvetica-Bold")
    .fillColor("#111")
    .text(data.courseTitle, {
      align: "center",
    });

  /* =========================
     ISSUE DATE
  ========================= */
  doc
    .moveDown(3)
    .fontSize(14)
    .fillColor("#444")
    .font("Helvetica")
    .text(
      `Issued on: ${new Date(data.issuedAt).toDateString()}`,
      {
        align: "center",
      }
    );

  /* =========================
     CERTIFICATE NUMBER
  ========================= */
  if (data.certificateNo) {
    doc
      .moveDown(0.5)
      .fontSize(10)
      .fillColor("#666")
      .text(`Certificate ID: ${data.certificateNo}`, {
        align: "center",
      });
  }

  /* =========================
     FOOTER
  ========================= */
  doc
    .fontSize(12)
    .fillColor("#333")
    .font("Helvetica-Oblique")
    .text(
      "— Learnify LMS",
      pageWidth - 200,
      pageHeight - 80,
      {
        align: "right",
      }
    );

  doc.end();
};
