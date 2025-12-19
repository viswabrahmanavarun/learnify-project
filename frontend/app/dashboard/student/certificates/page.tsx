"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FiAward,
  FiDownload,
  FiCalendar,
  FiArrowLeft,
  FiFileText,
} from "react-icons/fi";

/* =========================
   TYPES
========================= */
interface Certificate {
  id: number;
  issuedAt: string;
  course: {
    id: number;
    title: string;
  };
}

/* =========================
   STUDENT CERTIFICATES PAGE
========================= */
export default function StudentCertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  /* =========================
     FETCH CERTIFICATES
  ========================= */
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await api.get("/certificates/my");
        setCertificates(res.data || []);
      } catch (error) {
        console.error("Failed to fetch certificates", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  /* =========================
     DOWNLOAD CERTIFICATE
  ========================= */
  const downloadCertificate = async (
    courseId: number,
    courseTitle: string,
    certificateId: number
  ) => {
    try {
      setDownloadingId(certificateId);

      const res = await api.get(
        `/courses/${courseId}/certificate/download`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${courseTitle}-certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download certificate");
    } finally {
      setDownloadingId(null);
    }
  };

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        <p className="animate-pulse text-lg">
          Loading certificates...
        </p>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-6">
      {/* GLASS CARD */}
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 text-white relative">

        {/* BACK BUTTON */}
        <button
          onClick={() => router.push("/dashboard/student")}
          className="absolute left-8 top-8 flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        {/* HEADER */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <FiAward className="text-yellow-400" />
            My Certificates
          </h1>
          <p className="text-white/70 mt-3">
            Download certificates for completed courses
          </p>
        </div>

        {/* EMPTY STATE */}
        {certificates.length === 0 ? (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-10 text-center text-white/70">
            <FiFileText className="mx-auto mb-4 text-3xl opacity-70" />
            You haven’t earned any certificates yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
              >
                {/* COURSE TITLE */}
                <h2 className="text-lg font-semibold mb-3">
                  {cert.course.title}
                </h2>

                {/* DATE */}
                <p className="flex items-center gap-2 text-sm text-white/70 mb-6">
                  <FiCalendar />
                  Issued on{" "}
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </p>

                {/* DOWNLOAD */}
                <button
                  onClick={() =>
                    downloadCertificate(
                      cert.course.id,
                      cert.course.title,
                      cert.id
                    )
                  }
                  disabled={downloadingId === cert.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-medium text-sm disabled:opacity-50"
                >
                  <FiDownload />
                  {downloadingId === cert.id
                    ? "Downloading..."
                    : "Download Certificate"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
