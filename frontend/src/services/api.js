const API_URL = "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("examtech_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erro no login");
    return data;
  },

  register: async (name, email, password, role) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erro no registro");
    return data;
  },

  getProfile: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erro ao obter perfil");
    return data;
  },

  // Admin
  getAdminMetrics: async () => {
    const res = await fetch(`${API_URL}/admin/metrics`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erro ao carregar métricas");
    return data;
  },

  getAdminUsers: async () => {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  toggleUserActive: async (userId) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/toggle-active`, {
      method: "POST",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getClassrooms: async () => {
    const res = await fetch(`${API_URL}/admin/classrooms`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  createClassroom: async (name, teacherId) => {
    const res = await fetch(`${API_URL}/admin/classrooms`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, teacher_id: teacherId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  deleteClassroom: async (id) => {
    const res = await fetch(`${API_URL}/admin/classrooms/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getSubjects: async () => {
    const res = await fetch(`${API_URL}/admin/subjects`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  createSubject: async (name, description) => {
    const res = await fetch(`${API_URL}/admin/subjects`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  deleteSubject: async (id) => {
    const res = await fetch(`${API_URL}/admin/subjects/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getAdminLogs: async () => {
    const res = await fetch(`${API_URL}/admin/logs`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // Professor
  getProfMetrics: async () => {
    const res = await fetch(`${API_URL}/professor/metrics`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getProfClassrooms: async () => {
    const res = await fetch(`${API_URL}/professor/classrooms`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getProfExams: async () => {
    const res = await fetch(`${API_URL}/professor/exams`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  createExam: async (examData) => {
    const res = await fetch(`${API_URL}/professor/exams`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(examData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getExamDetails: async (examId) => {
    const res = await fetch(`${API_URL}/professor/exams/${examId}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  updateExam: async (examId, examData) => {
    const res = await fetch(`${API_URL}/professor/exams/${examId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(examData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  deleteExam: async (examId) => {
    const res = await fetch(`${API_URL}/professor/exams/${examId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  addQuestion: async (examId, questionData) => {
    const res = await fetch(`${API_URL}/professor/exams/${examId}/questions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(questionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  deleteQuestion: async (questionId) => {
    const res = await fetch(`${API_URL}/questions/${questionId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  generateAIQuestions: async (examId, aiParams) => {
    const res = await fetch(`${API_URL}/professor/exams/${examId}/generate-ai-questions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(aiParams),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getProfSubmissions: async () => {
    const res = await fetch(`${API_URL}/professor/submissions`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getSubmissionDetails: async (submissionId) => {
    const res = await fetch(`${API_URL}/professor/submissions/${submissionId}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  submitManualGrade: async (submissionId, gradingData) => {
    const res = await fetch(`${API_URL}/professor/submissions/${submissionId}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(gradingData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  autoGradeWithAI: async (submissionId) => {
    const res = await fetch(`${API_URL}/professor/submissions/${submissionId}/auto-grade-ai`, {
      method: "POST",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // Student
  getStudentMetrics: async () => {
    const res = await fetch(`${API_URL}/student/metrics`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  joinClassroom: async (code) => {
    const res = await fetch(`${API_URL}/student/classrooms/join`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getStudentClassrooms: async () => {
    const res = await fetch(`${API_URL}/student/classrooms`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  startExam: async (examId) => {
    const res = await fetch(`${API_URL}/student/exams/${examId}/start`, {
      method: "POST",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  sendCheatingLog: async (examId, eventType, message) => {
    const res = await fetch(`${API_URL}/student/exams/${examId}/cheating-log`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ event_type: eventType, message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  submitExamAnswers: async (examId, answers) => {
    const res = await fetch(`${API_URL}/student/exams/${examId}/submit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getStudentExamResult: async (examId) => {
    const res = await fetch(`${API_URL}/student/exams/${examId}/result`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
};
