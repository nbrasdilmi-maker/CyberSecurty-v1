export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface AssignmentItem {
  id: string;
  status: string;
  grade?: number;
  feedback?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  createdAt: string;
  evaluatedAt?: string;
  subject: { id: string; name: string; code: string };
}

export interface GradeItem {
  id: string;
  grade: number;
  feedback?: string;
  subject: { id: string; name: string; code: string };
  createdAt: string;
  evaluatedAt?: string;
}

export const mockSubjects: Subject[] = [
  { id: "1", name: "أمن الشبكات", code: "NET201" },
  { id: "2", name: "رياضيات متقدمة", code: "MATH301" },
  { id: "3", name: "قواعد البيانات", code: "DBS202" },
  { id: "4", name: "أمن المعلومات", code: "INF301" },
  { id: "5", name: "برمجة متقدمة", code: "PRO401" },
  { id: "6", name: "شبكات الحاسوب", code: "NET101" },
  { id: "7", name: "تشفير وتعمية", code: "CRY301" },
  { id: "8", name: "أمن الويب", code: "WEB401" },
];

export const mockAssignments: AssignmentItem[] = [
  { id: "a1", status: "evaluated", grade: 85, feedback: "عمل ممتاز، دقة في الإجابة", fileName: "assignment_net201.pdf", fileUrl: "#", fileSize: 2_400_000, createdAt: "2026-06-10T10:00:00Z", evaluatedAt: "2026-06-12T14:00:00Z", subject: { id: "1", name: "أمن الشبكات", code: "NET201" } },
  { id: "a2", status: "pending", fileName: "hw_math301.pdf", fileUrl: "#", fileSize: 1_200_000, createdAt: "2026-06-15T09:00:00Z", subject: { id: "2", name: "رياضيات متقدمة", code: "MATH301" } },
  { id: "a3", status: "evaluated", grade: 92, feedback: "إجابة دقيقة ومنظمة", fileName: "db_report.pdf", fileUrl: "#", fileSize: 3_100_000, createdAt: "2026-06-08T11:00:00Z", evaluatedAt: "2026-06-11T10:00:00Z", subject: { id: "3", name: "قواعد البيانات", code: "DBS202" } },
  { id: "a4", status: "evaluated", grade: 78, feedback: "جيد، يحتاج تحسين في التوثيق", fileName: "inf_security.docx", fileUrl: "#", fileSize: 1_800_000, createdAt: "2026-06-05T08:00:00Z", evaluatedAt: "2026-06-09T12:00:00Z", subject: { id: "4", name: "أمن المعلومات", code: "INF301" } },
  { id: "a5", status: "pending", fileName: "prog_assign.py", fileUrl: "#", fileSize: 500_000, createdAt: "2026-06-16T10:00:00Z", subject: { id: "5", name: "برمجة متقدمة", code: "PRO401" } },
  { id: "a6", status: "evaluated", grade: 95, feedback: "عمل متقن جداً", fileName: "network_topology.pdf", fileUrl: "#", fileSize: 4_200_000, createdAt: "2026-06-03T10:00:00Z", evaluatedAt: "2026-06-06T09:00:00Z", subject: { id: "6", name: "شبكات الحاسوب", code: "NET101" } },
  { id: "a7", status: "pending", fileName: "crypto_hw.pdf", fileUrl: "#", fileSize: 900_000, createdAt: "2026-06-17T11:00:00Z", subject: { id: "7", name: "تشفير وتعمية", code: "CRY301" } },
  { id: "a8", status: "evaluated", grade: 70, feedback: "مقبول، راجع أساسيات SQL", fileName: "web_security.pdf", fileUrl: "#", fileSize: 2_100_000, createdAt: "2026-06-02T09:00:00Z", evaluatedAt: "2026-06-04T14:00:00Z", subject: { id: "8", name: "أمن الويب", code: "WEB401" } },
  { id: "a9", status: "evaluated", grade: 88, feedback: "جيد جداً", fileName: "math_sol.pdf", fileUrl: "#", fileSize: 1_600_000, createdAt: "2026-05-28T10:00:00Z", evaluatedAt: "2026-05-30T11:00:00Z", subject: { id: "2", name: "رياضيات متقدمة", code: "MATH301" } },
  { id: "a10", status: "pending", fileName: "db_design.pdf", fileUrl: "#", fileSize: 2_800_000, createdAt: "2026-06-18T08:00:00Z", subject: { id: "3", name: "قواعد البيانات", code: "DBS202" } },
];

export const mockGrades: GradeItem[] = [
  { id: "g1", grade: 92, feedback: "ممتاز", subject: { id: "1", name: "أمن الشبكات", code: "NET201" }, createdAt: "2026-05-10T10:00:00Z", evaluatedAt: "2026-05-12T14:00:00Z" },
  { id: "g2", grade: 88, feedback: "جيد جداً", subject: { id: "2", name: "رياضيات متقدمة", code: "MATH301" }, createdAt: "2026-05-11T09:00:00Z", evaluatedAt: "2026-05-13T10:00:00Z" },
  { id: "g3", grade: 78, feedback: "جيد", subject: { id: "3", name: "قواعد البيانات", code: "DBS202" }, createdAt: "2026-05-09T11:00:00Z", evaluatedAt: "2026-05-11T12:00:00Z" },
  { id: "g4", grade: 85, feedback: "جيد جداً", subject: { id: "4", name: "أمن المعلومات", code: "INF301" }, createdAt: "2026-05-08T08:00:00Z", evaluatedAt: "2026-05-10T09:00:00Z" },
  { id: "g5", grade: 90, feedback: "ممتاز", subject: { id: "5", name: "برمجة متقدمة", code: "PRO401" }, createdAt: "2026-05-07T10:00:00Z", evaluatedAt: "2026-05-09T11:00:00Z" },
  { id: "g6", grade: 95, feedback: "ممتاز", subject: { id: "6", name: "شبكات الحاسوب", code: "NET101" }, createdAt: "2026-05-06T10:00:00Z", evaluatedAt: "2026-05-08T09:00:00Z" },
  { id: "g7", grade: 82, feedback: "جيد جداً", subject: { id: "7", name: "تشفير وتعمية", code: "CRY301" }, createdAt: "2026-05-05T11:00:00Z", evaluatedAt: "2026-05-07T14:00:00Z" },
  { id: "g8", grade: 70, feedback: "مقبول", subject: { id: "8", name: "أمن الويب", code: "WEB401" }, createdAt: "2026-05-04T09:00:00Z", evaluatedAt: "2026-05-06T10:00:00Z" },
];

export const mockStats = {
  total: mockAssignments.length,
  evaluated: mockAssignments.filter((a) => a.status === "evaluated").length,
  subjects: mockSubjects.length,
};
