import { prisma } from "@/lib/prisma";

interface ScanResult {
  isInfected: boolean;
  viruses: string[];
  error?: string;
}

const CLAMAV_ENABLED = process.env.CLAMAV_ENABLED === "true";

let clamAvNode: any = null;

async function getScanner() {
  if (clamAvNode) return clamAvNode;

  try {
    const NodeClam = (await import("clamscan")).default;
    clamAvNode = await new NodeClam().init({
      clamdscan: {
        socket: process.env.CLAMAV_SOCKET || false,
        host: process.env.CLAMAV_HOST || "localhost",
        port: Number(process.env.CLAMAV_PORT) || 3310,
        timeout: 30000,
        bypassTest: true,
      },
      preference: "clamdscan",
    });
    return clamAvNode;
  } catch (err) {
    console.warn("⚠️ ClamAV غير متاح، فحص الملفات معطل:", err);
    return null;
  }
}

export async function scanFile(
  fileBuffer: Buffer,
  fileName: string,
): Promise<ScanResult> {
  if (!CLAMAV_ENABLED) {
    console.warn("⚠️ ClamAV معطل (CLAMAV_ENABLED=false)، لم يتم فحص:", fileName);
    return { isInfected: false, viruses: [], error: "ClamAV معطل" };
  }

  try {
    const scanner = await getScanner();
    if (!scanner) {
      console.error("❌ ClamAV غير متاح على الرغم من تفعيله في الإعدادات");
      return { isInfected: false, viruses: [], error: "ClamAV غير متاح" };
    }

    const { isInfected, viruses } = await scanner.scanBuffer(fileBuffer);
    return { isInfected, viruses: viruses || [] };
  } catch (err: any) {
    console.error("❌ خطأ في فحص ClamAV:", err.message);
    return { isInfected: false, viruses: [], error: err.message };
  }
}

export async function scanAndReject(
  fileBuffer: Buffer,
  fileName: string,
  userId: string,
): Promise<boolean> {
  const result = await scanFile(fileBuffer, fileName);

  if (result.isInfected) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: "SUSPICIOUS_ACTIVITY",
        severity: "CRITICAL",
        description: `ملف مصاب بفيروس: ${fileName} - ${result.viruses.join(", ")}`,
      },
    });
    return true; // ملف مصاب
  }

  return false; // آمن
}
