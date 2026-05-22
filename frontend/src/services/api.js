const API_URL = "http://localhost:5000/api";

// Configura se usará o Mock Offline.
// Inicia verificando se já foi forçado a usar mock no localStorage
let useMock = localStorage.getItem("examtech_use_mock") === "true";

// Helper para obter cabeçalhos de autenticação do backend real
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

// ----------------------------------------------------
// BANCO DE DADOS MOCK EM LOCALSTORAGE (FALLBACK)
// ----------------------------------------------------
const initMockDB = () => {
  if (localStorage.getItem("examtech_mock_db")) {
    return JSON.parse(localStorage.getItem("examtech_mock_db"));
  }

  // Dados iniciais mockados (idênticos ao seeder do Flask no backend)
  const db = {
    users: [
      { id: 1, name: "Diretora Mariana", email: "admin@examtech.com", password: "admin123", role: "admin", is_active: true },
      { id: 2, name: "Prof. Carlos Eduardo", email: "professor1@examtech.com", password: "admin123", role: "professor", is_active: true },
      { id: 3, name: "Profa. Ana Beatriz", email: "professor2@examtech.com", password: "admin123", role: "professor", is_active: true },
      { id: 4, name: "Jean Lucas", email: "aluno1@examtech.com", password: "admin123", role: "student", is_active: true },
      { id: 5, name: "Ana Clara", email: "aluno2@examtech.com", password: "admin123", role: "student", is_active: true },
      { id: 6, name: "Mateus Santos", email: "aluno3@examtech.com", password: "admin123", role: "student", is_active: true }
    ],
    subjects: [
      { id: 1, name: "Algoritmos e Programação", description: "Lógica de programação, variáveis, condicionais e estruturas de dados em Python." },
      { id: 2, name: "Banco de Dados I", description: "Projeto lógico e físico de banco de dados SQL e noções de NoSQL." },
      { id: 3, name: "Redes de Computadores", description: "Arquitetura de redes TCP/IP, roteamento, DNS, switches e redes sem fio." }
    ],
    classrooms: [
      { id: 1, name: "Técnico em Informática - Módulo 2", code: "TECINF", teacher_id: 2, students: [4, 5, 6] }
    ],
    exams: [
      {
        id: 1,
        title: "Avaliação Parcial de Algoritmos em Python",
        description: "Esta avaliação aborda os conceitos fundamentais de Python como listas, variáveis por referência, POO e lógica básica.",
        instructions: "Leia atentamente cada questão. A prova tem tempo controlado de 30 minutos. Mantenha a tela em modo Fullscreen. Saídas inesperadas ou trocas de aba serão notificadas e registradas no log de atividades para revisão do professor.",
        duration_minutes: 30,
        total_score: 10.0,
        status: "active",
        created_by_id: 2,
        subject_id: 1,
        classroom_id: 1
      },
      {
        id: 2,
        title: "Simulado Geral de Banco de Dados SQL",
        description: "Rascunho de simulado para o módulo de Normalização e Consultas SQL Avançadas.",
        instructions: "Rascunho apenas para conferência.",
        duration_minutes: 60,
        total_score: 10.0,
        status: "draft",
        created_by_id: 2,
        subject_id: 2,
        classroom_id: 1
      }
    ],
    questions: [
      {
        id: 1,
        exam_id: 1,
        text: "Qual será a saída do código Python a seguir?\n\n```python\nlist1 = [1, 2, 3]\nlist2 = list1\nlist2.append(4)\nprint(list1)\n```",
        type: "multiple_choice",
        points: 2.5,
        correct_answer: "[1, 2, 3, 4]",
        choices: ["[1, 2, 3]", "[1, 2, 3, 4]", "[1, 2, 3, [4]]", "Erro de Atribuição"]
      },
      {
        id: 2,
        exam_id: 1,
        text: "Na programação orientada a objetos (POO), qual é o conceito que permite que uma classe filha herde comportamentos e propriedades de uma classe pai, mas redefina métodos específicos?",
        type: "multiple_choice",
        points: 2.5,
        correct_answer: "Polimorfismo",
        choices: ["Encapsulamento", "Polimorfismo", "Abstração", "Acoplamento"]
      },
      {
        id: 3,
        exam_id: 1,
        text: "Em JavaScript, `const` define uma variável cujo valor não pode ser reatribuído, mas se o valor for um objeto ou array, suas propriedades ou elementos ainda podem ser modificados.",
        type: "true_false",
        points: 2.0,
        correct_answer: "Verdadeiro",
        choices: ["Verdadeiro", "Falso"]
      },
      {
        id: 4,
        exam_id: 1,
        text: "Escreva uma função em Python chamada `is_palindrome` que recebe uma string e retorna `True` se for um palíndromo (ignores maiúsculas/minúsculas) e `False` caso contrário.",
        type: "code",
        points: 3.0,
        correct_answer: "def is_palindrome(s):\n    cleaned = ''.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]",
        choices: []
      },
      {
        id: 5,
        exam_id: 2,
        text: "Qual comando SQL é utilizado para remover registros de uma tabela, mantendo a estrutura da tabela intacta?",
        type: "multiple_choice",
        points: 5.0,
        correct_answer: "DELETE FROM",
        choices: ["DROP TABLE", "DELETE FROM", "REMOVE TABLE", "ALTER TABLE"]
      }
    ],
    student_exams: [
      {
        id: 1,
        student_id: 5, // Ana Clara
        exam_id: 1,
        score: 9.5,
        started_at: new Date(Date.now() - 7200000).toISOString(),
        finished_at: new Date(Date.now() - 5400000).toISOString(),
        status: "graded",
        cheating_logs: [],
        feedback_ia: "[Correção Automática da IA ExamTech]: Excelente resposta! Você abordou todos os conceitos essenciais com clareza e precisão técnica. Parabéns pelo desempenho exemplar em lógica Python!"
      },
      {
        id: 2,
        student_id: 6, // Mateus
        exam_id: 1,
        score: 4.5,
        started_at: new Date(Date.now() - 10800000).toISOString(),
        finished_at: new Date(Date.now() - 8400000).toISOString(),
        status: "graded",
        cheating_logs: [
          { event: "blur", timestamp: new Date(Date.now() - 9900000).toISOString(), message: "O aluno trocou de aba ou minimizou a prova!" },
          { event: "fullscreen-exit", timestamp: new Date(Date.now() - 9000000).toISOString(), message: "O aluno saiu do modo tela cheia!" }
        ],
        feedback_ia: "[Correção Automática da IA ExamTech]: Desempenho abaixo do esperado. Dificuldade severa em conceitos estruturais. Além disso, foram detectadas infrações do sistema anti-cola (saída de fullscreen e mudança de abas). Recomendamos plantão de dúvidas urgente."
      }
    ],
    student_answers: [
      { id: 1, student_exam_id: 1, question_id: 1, student_response: "[1, 2, 3, 4]", is_correct: true, points_earned: 2.5, feedback: "Correto!" },
      { id: 2, student_exam_id: 1, question_id: 2, student_response: "Polimorfismo", is_correct: true, points_earned: 2.5, feedback: "Correto!" },
      { id: 3, student_exam_id: 1, question_id: 3, student_response: "Verdadeiro", is_correct: true, points_earned: 2.0, feedback: "Correto!" },
      { id: 4, student_exam_id: 1, question_id: 4, student_response: "def is_palindrome(s):\n    s = s.lower().replace(' ', '')\n    return s == s[::-1]", is_correct: true, points_earned: 2.5, feedback: "Muito bom! O código funciona para a maioria das entradas de texto comuns." },
      
      { id: 5, student_exam_id: 2, question_id: 1, student_response: "[1, 2, 3]", is_correct: false, points_earned: 0.0, feedback: "Incorreto. Listas em Python funcionam por referência." },
      { id: 6, student_exam_id: 2, question_id: 2, student_response: "Polimorfismo", is_correct: true, points_earned: 2.5, feedback: "Correto!" },
      { id: 7, student_exam_id: 2, question_id: 3, student_response: "Verdadeiro", is_correct: true, points_earned: 2.0, feedback: "Correto!" },
      { id: 8, student_exam_id: 2, question_id: 4, student_response: "nao sei fazer", is_correct: false, points_earned: 0.0, feedback: "Não respondeu de forma válida." }
    ],
    audit_logs: [
      { id: 1, user_id: 2, action: "Criou a prova 'Avaliação Parcial de Algoritmos em Python'", timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, user_id: 5, action: "Realizou e finalizou a prova 'Avaliação Parcial de Algoritmos em Python'", timestamp: new Date(Date.now() - 5400000).toISOString() }
    ]
  };

  localStorage.setItem("examtech_mock_db", JSON.stringify(db));
  return db;
};

const saveMockDB = (db) => {
  localStorage.setItem("examtech_mock_db", JSON.stringify(db));
};

// ----------------------------------------------------
// WRAPPER DE REQUISIÇÃO COM DETECÇÃO DE OFFLINE/ERROS
// ----------------------------------------------------
const request = async (endpoint, options = {}, mockHandler = null) => {
  if (useMock) {
    console.log(`[API Mock] Executando simulação offline para: ${endpoint}`);
    if (mockHandler) {
      // Simula uma pequena latência de rede para ficar mais real e premium
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockHandler();
    }
    throw new Error("Simulação offline não implementada para esta rota");
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Erro na requisição: ${res.status}`);
    }
    return data;
  } catch (err) {
    // Se for erro de conexão ("Failed to fetch" ou similar)
    if (err.name === "TypeError" || err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      console.warn("Backend real inacessível! Ativando Modo de Demonstração (Mock/Offline) no LocalStorage...");
      useMock = true;
      localStorage.setItem("examtech_use_mock", "true");
      
      if (mockHandler) {
        return mockHandler();
      }
    }
    throw err;
  }
};

// Permite resetar o modo mock remotamente (se digitado no console, por ex.)
window.resetExamTechMock = () => {
  localStorage.removeItem("examtech_use_mock");
  localStorage.removeItem("examtech_mock_db");
  window.location.reload();
};

// ----------------------------------------------------
// EXPORTAÇÃO DAS ROTAS E MÉTODOS DA API
// ----------------------------------------------------
export const api = {
  // Auth
  login: async (email, password) => {
    return request(
      "/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
      () => {
        const db = initMockDB();
        const user = db.users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error("E-mail ou senha incorretos.");
        if (!user.is_active) throw new Error("Esta conta foi desativada pelo administrador.");
        return {
          token: "mock-jwt-token-for-user-" + user.id,
          user: { id: user.id, name: user.name, email: user.email, role: user.role, is_active: user.is_active }
        };
      }
    );
  },

  register: async (name, email, password, role) => {
    return request(
      "/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      },
      () => {
        const db = initMockDB();
        if (db.users.some(u => u.email === email)) throw new Error("Este e-mail já está cadastrado.");
        const newUser = {
          id: db.users.length + 1,
          name,
          email,
          password,
          role,
          is_active: true
        };
        db.users.push(newUser);
        saveMockDB(db);
        return {
          token: "mock-jwt-token-for-user-" + newUser.id,
          user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, is_active: newUser.is_active }
        };
      }
    );
  },

  getProfile: async () => {
    return request(
      "/auth/me",
      {
        headers: getHeaders(),
      },
      () => {
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        if (!currentUser) throw new Error("Não autenticado");
        const db = initMockDB();
        const user = db.users.find(u => u.id === currentUser.id);
        if (!user) throw new Error("Usuário não encontrado");
        return { user: { id: user.id, name: user.name, email: user.email, role: user.role, is_active: user.is_active } };
      }
    );
  },

  // Admin
  getAdminMetrics: async () => {
    return request(
      "/admin/metrics",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        return {
          total_users: db.users.length,
          total_professors: db.users.filter(u => u.role === "professor").length,
          total_students: db.users.filter(u => u.role === "student").length,
          total_exams: db.exams.length,
          total_classrooms: db.classrooms.length,
          total_cheating_alerts: db.student_exams.reduce((acc, se) => acc + (se.cheating_logs || []).length, 0)
        };
      }
    );
  },

  getAdminUsers: async () => {
    return request(
      "/admin/users",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        return db.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, is_active: u.is_active }));
      }
    );
  },

  toggleUserActive: async (userId) => {
    return request(
      `/admin/users/${userId}/toggle-active`,
      {
        method: "POST",
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const user = db.users.find(u => u.id === Number(userId));
        if (!user) throw new Error("Usuário não encontrado");
        user.is_active = !user.is_active;
        db.audit_logs.push({
          id: db.audit_logs.length + 1,
          user_id: 1, // Admin
          action: `Alterou status do usuário ${user.name} para ${user.is_active ? 'Ativo' : 'Inativo'}`,
          timestamp: new Date().toISOString()
        });
        saveMockDB(db);
        return { message: "Status alterado com sucesso", user: { id: user.id, is_active: user.is_active } };
      }
    );
  },

  getClassrooms: async () => {
    return request(
      "/admin/classrooms",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        return db.classrooms.map(c => {
          const teacher = db.users.find(u => u.id === c.teacher_id);
          return {
            id: c.id,
            name: c.name,
            code: c.code,
            teacher_id: c.teacher_id,
            teacher_name: teacher ? teacher.name : "Desconhecido",
            students_count: c.students.length
          };
        });
      }
    );
  },

  createClassroom: async (name, teacherId) => {
    return request(
      "/admin/classrooms",
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, teacher_id: teacherId }),
      },
      () => {
        const db = initMockDB();
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newClassroom = {
          id: db.classrooms.length + 1,
          name,
          code,
          teacher_id: Number(teacherId),
          students: []
        };
        db.classrooms.push(newClassroom);
        db.audit_logs.push({
          id: db.audit_logs.length + 1,
          user_id: 1, // Admin
          action: `Criou a turma ${name} (Código: ${code})`,
          timestamp: new Date().toISOString()
        });
        saveMockDB(db);
        return { message: "Turma criada com sucesso", classroom: newClassroom };
      }
    );
  },

  deleteClassroom: async (id) => {
    return request(
      `/admin/classrooms/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const cIndex = db.classrooms.findIndex(c => c.id === Number(id));
        if (cIndex === -1) throw new Error("Turma não encontrada");
        const classroom = db.classrooms[cIndex];
        db.classrooms.splice(cIndex, 1);
        db.audit_logs.push({
          id: db.audit_logs.length + 1,
          user_id: 1, // Admin
          action: `Excluiu a turma ${classroom.name}`,
          timestamp: new Date().toISOString()
        });
        saveMockDB(db);
        return { message: "Turma excluída com sucesso" };
      }
    );
  },

  getSubjects: async () => {
    return request(
      "/admin/subjects",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        return db.subjects;
      }
    );
  },

  createSubject: async (name, description) => {
    return request(
      "/admin/subjects",
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, description }),
      },
      () => {
        const db = initMockDB();
        const newSubject = {
          id: db.subjects.length + 1,
          name,
          description
        };
        db.subjects.push(newSubject);
        db.audit_logs.push({
          id: db.audit_logs.length + 1,
          user_id: 1, // Admin
          action: `Criou a disciplina ${name}`,
          timestamp: new Date().toISOString()
        });
        saveMockDB(db);
        return { message: "Disciplina criada com sucesso", subject: newSubject };
      }
    );
  },

  deleteSubject: async (id) => {
    return request(
      `/admin/subjects/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const sIndex = db.subjects.findIndex(s => s.id === Number(id));
        if (sIndex === -1) throw new Error("Disciplina não encontrada");
        const subject = db.subjects[sIndex];
        db.subjects.splice(sIndex, 1);
        db.audit_logs.push({
          id: db.audit_logs.length + 1,
          user_id: 1, // Admin
          action: `Excluiu a disciplina ${subject.name}`,
          timestamp: new Date().toISOString()
        });
        saveMockDB(db);
        return { message: "Disciplina excluída com sucesso" };
      }
    );
  },

  getAdminLogs: async () => {
    return request(
      "/admin/logs",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        return db.audit_logs.map(log => {
          const user = db.users.find(u => u.id === log.user_id);
          return {
            id: log.id,
            action: log.action,
            timestamp: log.timestamp,
            user_name: user ? user.name : "Sistema",
            user_role: user ? user.role : "system"
          };
        }).reverse();
      }
    );
  },

  // Professor
  getProfMetrics: async () => {
    return request(
      "/professor/metrics",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 2;
        const myClassrooms = db.classrooms.filter(c => c.teacher_id === myId);
        const myExams = db.exams.filter(e => e.created_by_id === myId);
        const examIds = myExams.map(e => e.id);
        const mySubmissions = db.student_exams.filter(se => examIds.includes(se.exam_id));
        const myCheatingCount = mySubmissions.reduce((acc, se) => acc + (se.cheating_logs || []).length, 0);
        
        return {
          total_classrooms: myClassrooms.length,
          total_exams: myExams.length,
          total_submissions: mySubmissions.length,
          total_cheating_alerts: myCheatingCount
        };
      }
    );
  },

  getProfClassrooms: async () => {
    return request(
      "/professor/classrooms",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 2;
        return db.classrooms.filter(c => c.teacher_id === myId).map(c => ({
          id: c.id,
          name: c.name,
          code: c.code,
          students_count: c.students.length
        }));
      }
    );
  },

  getProfExams: async () => {
    return request(
      "/professor/exams",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 2;
        return db.exams.filter(e => e.created_by_id === myId).map(e => {
          const subject = db.subjects.find(s => s.id === e.subject_id);
          const classroom = db.classrooms.find(c => c.id === e.classroom_id);
          const qCount = db.questions.filter(q => q.exam_id === e.id).length;
          return {
            id: e.id,
            title: e.title,
            description: e.description,
            instructions: e.instructions,
            duration_minutes: e.duration_minutes,
            total_score: e.total_score,
            status: e.status,
            subject_name: subject ? subject.name : "Desconhecido",
            classroom_name: classroom ? classroom.name : "Desconhecido",
            questions_count: qCount
          };
        });
      }
    );
  },

  createExam: async (examData) => {
    return request(
      "/professor/exams",
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(examData),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 2;
        const newExam = {
          id: db.exams.length + 1,
          title: examData.title,
          description: examData.description || "",
          instructions: examData.instructions || "",
          duration_minutes: Number(examData.duration_minutes || 60),
          total_score: Number(examData.total_score || 10.0),
          status: examData.status || "draft",
          created_by_id: myId,
          subject_id: Number(examData.subject_id),
          classroom_id: Number(examData.classroom_id)
        };
        db.exams.push(newExam);
        db.audit_logs.push({
          id: db.audit_logs.length + 1,
          user_id: myId,
          action: `Criou a prova '${newExam.title}'`,
          timestamp: new Date().toISOString()
        });
        saveMockDB(db);
        return { message: "Prova criada com sucesso", exam: newExam };
      }
    );
  },

  getExamDetails: async (examId) => {
    return request(
      `/professor/exams/${examId}`,
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const exam = db.exams.find(e => e.id === Number(examId));
        if (!exam) throw new Error("Prova não encontrada");
        const questions = db.questions.filter(q => q.exam_id === exam.id).map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          points: q.points,
          correct_answer: q.correct_answer,
          choices: q.choices
        }));
        return {
          ...exam,
          questions
        };
      }
    );
  },

  updateExam: async (examId, examData) => {
    return request(
      `/professor/exams/${examId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(examData),
      },
      () => {
        const db = initMockDB();
        const examIndex = db.exams.findIndex(e => e.id === Number(examId));
        if (examIndex === -1) throw new Error("Prova não encontrada");
        const updatedExam = {
          ...db.exams[examIndex],
          title: examData.title,
          description: examData.description,
          instructions: examData.instructions,
          duration_minutes: Number(examData.duration_minutes),
          total_score: Number(examData.total_score),
          status: examData.status,
          subject_id: Number(examData.subject_id),
          classroom_id: Number(examData.classroom_id)
        };
        db.exams[examIndex] = updatedExam;
        saveMockDB(db);
        return { message: "Prova atualizada com sucesso", exam: updatedExam };
      }
    );
  },

  deleteExam: async (examId) => {
    return request(
      `/professor/exams/${examId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const examIndex = db.exams.findIndex(e => e.id === Number(examId));
        if (examIndex === -1) throw new Error("Prova não encontrada");
        db.exams.splice(examIndex, 1);
        saveMockDB(db);
        return { message: "Prova excluída com sucesso" };
      }
    );
  },

  addQuestion: async (examId, questionData) => {
    return request(
      `/professor/exams/${examId}/questions`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(questionData),
      },
      () => {
        const db = initMockDB();
        const newQuestion = {
          id: db.questions.length + 1,
          exam_id: Number(examId),
          text: questionData.text,
          type: questionData.type,
          points: Number(questionData.points || 1.0),
          correct_answer: questionData.correct_answer,
          choices: questionData.choices || []
        };
        db.questions.push(newQuestion);
        saveMockDB(db);
        return { message: "Questão adicionada com sucesso", question: newQuestion };
      }
    );
  },

  deleteQuestion: async (questionId) => {
    return request(
      `/questions/${questionId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const qIndex = db.questions.findIndex(q => q.id === Number(questionId));
        if (qIndex === -1) throw new Error("Questão não encontrada");
        db.questions.splice(qIndex, 1);
        saveMockDB(db);
        return { message: "Questão excluída com sucesso" };
      }
    );
  },

  generateAIQuestions: async (examId, aiParams) => {
    return request(
      `/professor/exams/${examId}/generate-ai-questions`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(aiParams),
      },
      () => {
        const db = initMockDB();
        const prompt = aiParams.prompt || "Python avançado";
        const numQuestions = Number(aiParams.num_questions || 3);
        
        const mockAIPool = [
          {
            text: "Qual é a complexidade de tempo de pior caso para pesquisar um elemento em uma tabela hash bem distribuída?",
            type: "multiple_choice",
            points: 2.0,
            correct_answer: "O(1)",
            choices: ["O(1)", "O(log n)", "O(n)", "O(n log n)"]
          },
          {
            text: "Qual dos seguintes métodos em Python é usado para remover e retornar o último elemento de uma lista?",
            type: "multiple_choice",
            points: 1.5,
            correct_answer: "pop()",
            choices: ["remove()", "discard()", "pop()", "delete()"]
          },
          {
            text: "Diga se a afirmação é verdadeira ou falsa: O protocolo TCP é orientado a conexão e garante a entrega ordenada de pacotes.",
            type: "true_false",
            points: 1.5,
            correct_answer: "Verdadeiro",
            choices: ["Verdadeiro", "Falso"]
          },
          {
            text: "Escreva um trecho de código em Python que abra um arquivo chamado 'dados.txt' em modo de leitura e exiba cada linha na tela.",
            type: "code",
            points: 3.0,
            correct_answer: "with open('dados.txt', 'r') as f:\n    for line in f:\n        print(line.strip())",
            choices: []
          }
        ];
        
        const generated = [];
        for (let i = 0; i < Math.min(numQuestions, mockAIPool.length); i++) {
          const qTemp = mockAIPool[i];
          const newQ = {
            id: db.questions.length + 1 + i,
            exam_id: Number(examId),
            text: `[Gerada por IA para: ${prompt}] ` + qTemp.text,
            type: qTemp.type,
            points: qTemp.points,
            correct_answer: qTemp.correct_answer,
            choices: qTemp.choices
          };
          db.questions.push(newQ);
          generated.push(newQ);
        }
        
        saveMockDB(db);
        return { message: `${generated.length} questões geradas com sucesso por IA!`, questions: generated };
      }
    );
  },

  getProfSubmissions: async () => {
    return request(
      "/professor/submissions",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        return db.student_exams.map(se => {
          const student = db.users.find(u => u.id === se.student_id);
          const exam = db.exams.find(e => e.id === se.exam_id);
          return {
            id: se.id,
            student_name: student ? student.name : "Aluno Desconhecido",
            student_email: student ? student.email : "",
            exam_title: exam ? exam.title : "Prova Desconhecida",
            score: se.score,
            status: se.status,
            finished_at: se.finished_at,
            cheating_alerts_count: (se.cheating_logs || []).length
          };
        }).reverse();
      }
    );
  },

  getSubmissionDetails: async (submissionId) => {
    return request(
      `/professor/submissions/${submissionId}`,
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const se = db.student_exams.find(s => s.id === Number(submissionId));
        if (!se) throw new Error("Submissão não encontrada");
        const student = db.users.find(u => u.id === se.student_id);
        const exam = db.exams.find(e => e.id === se.exam_id);
        const answers = db.student_answers.filter(sa => sa.student_exam_id === se.id).map(sa => {
          const question = db.questions.find(q => q.id === sa.question_id);
          return {
            id: sa.id,
            student_response: sa.student_response,
            is_correct: sa.is_correct,
            points_earned: sa.points_earned,
            feedback: sa.feedback,
            question_text: question ? question.text : "Questão Excluída",
            question_type: question ? question.type : "multiple_choice",
            question_points: question ? question.points : 0,
            question_correct_answer: question ? question.correct_answer : "",
            question_choices: question ? question.choices : []
          };
        });
        
        return {
          id: se.id,
          student_name: student ? student.name : "Aluno Desconhecido",
          exam_title: exam ? exam.title : "Prova Desconhecida",
          exam_instructions: exam ? exam.instructions : "",
          score: se.score,
          status: se.status,
          started_at: se.started_at,
          finished_at: se.finished_at,
          feedback_ia: se.feedback_ia,
          cheating_logs: se.cheating_logs || [],
          answers
        };
      }
    );
  },

  submitManualGrade: async (submissionId, gradingData) => {
    return request(
      `/professor/submissions/${submissionId}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(gradingData),
      },
      () => {
        const db = initMockDB();
        const se = db.student_exams.find(s => s.id === Number(submissionId));
        if (!se) throw new Error("Submissão não encontrada");
        
        const grades = gradingData.grades || {};
        let totalScore = 0;
        
        db.student_answers.filter(sa => sa.student_exam_id === se.id).forEach(sa => {
          if (grades[sa.id]) {
            const g = grades[sa.id];
            sa.points_earned = Number(g.points);
            sa.feedback = g.feedback || "";
            sa.is_correct = sa.points_earned > 0;
          }
          totalScore += sa.points_earned;
        });
        
        se.score = Number(totalScore.toFixed(2));
        se.status = "graded";
        se.feedback_ia = gradingData.feedback_ia || se.feedback_ia || "[Correção Manual do Professor]";
        
        saveMockDB(db);
        return { message: "Correção salva com sucesso!", score: se.score };
      }
    );
  },

  autoGradeWithAI: async (submissionId) => {
    return request(
      `/professor/submissions/${submissionId}/auto-grade-ai`,
      {
        method: "POST",
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const se = db.student_exams.find(s => s.id === Number(submissionId));
        if (!se) throw new Error("Submissão não encontrada");
        
        const answers = db.student_answers.filter(sa => sa.student_exam_id === se.id);
        let totalScore = 0;
        
        answers.forEach(sa => {
          const q = db.questions.find(quest => quest.id === sa.question_id);
          if (q) {
            if (q.type === 'code' || q.type === 'essay') {
              const isReasonable = sa.student_response.length > 10 && !sa.student_response.includes("nao sei");
              sa.points_earned = isReasonable ? q.points : 0.0;
              sa.is_correct = isReasonable;
              sa.feedback = isReasonable 
                ? `[IA]: Código coerente. Implementou a lógica de forma satisfatória obtendo a nota máxima para esta questão.`
                : `[IA]: Resposta insuficiente ou ausente. Não atende aos requisitos mínimos da questão.`;
            } else {
              const correct = String(sa.student_response).trim() === String(q.correct_answer).trim();
              sa.points_earned = correct ? q.points : 0.0;
              sa.is_correct = correct;
              sa.feedback = correct ? "[IA]: Resposta Correta!" : `[IA]: Resposta Incorreta. Gabarito oficial: ${q.correct_answer}`;
            }
            totalScore += sa.points_earned;
          }
        });
        
        se.score = Number(totalScore.toFixed(2));
        se.status = "graded";
        se.feedback_ia = `[Correção Avançada por IA ExamTech]: Correção finalizada automaticamente. Pontuação geral calculada em ${se.score}/10. O estudante demonstrou boa compreensão nos conceitos testados, exceto nos pontos indicados nos feedbacks individuais.`;
        
        saveMockDB(db);
        return { message: "Correção automática por IA concluída com sucesso!", score: se.score, feedback_ia: se.feedback_ia };
      }
    );
  },

  // Student
  getStudentMetrics: async () => {
    return request(
      "/student/metrics",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 4;
        
        const myClassrooms = db.classrooms.filter(c => c.students.includes(myId));
        const myClassroomIds = myClassrooms.map(c => c.id);
        
        const allExams = db.exams.filter(e => myClassroomIds.includes(e.classroom_id) && e.status === "active");
        
        const mySubmissions = db.student_exams.filter(se => se.student_id === myId);
        const mySubscribedExamIds = mySubmissions.map(se => se.exam_id);
        
        const pendingCount = allExams.filter(e => !mySubscribedExamIds.includes(e.id)).length;
        
        const gradedSubmissions = mySubmissions.filter(se => se.status === "graded");
        const averageGrade = gradedSubmissions.length > 0
          ? Number((gradedSubmissions.reduce((acc, se) => acc + se.score, 0) / gradedSubmissions.length).toFixed(2))
          : 0.0;
          
        return {
          total_classrooms: myClassrooms.length,
          pending_exams: pendingCount,
          average_score: averageGrade,
          completed_exams: gradedSubmissions.length
        };
      }
    );
  },

  joinClassroom: async (code) => {
    return request(
      "/student/classrooms/join",
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ code }),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 4;
        
        const classroom = db.classrooms.find(c => c.code === code.toUpperCase().trim());
        if (!classroom) throw new Error("Código de turma inválido ou inexistente.");
        
        if (classroom.students.includes(myId)) {
          throw new Error("Você já está matriculado nesta turma.");
        }
        
        classroom.students.push(myId);
        db.audit_logs.push({
          id: db.audit_logs.length + 1,
          user_id: myId,
          action: `Entrou na turma ${classroom.name} (Código: ${classroom.code})`,
          timestamp: new Date().toISOString()
        });
        saveMockDB(db);
        return { message: "Matrícula realizada com sucesso!", classroom: { id: classroom.id, name: classroom.name } };
      }
    );
  },

  getStudentClassrooms: async () => {
    return request(
      "/student/classrooms",
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 4;
        
        const myClassrooms = db.classrooms.filter(c => c.students.includes(myId));
        return myClassrooms.map(c => {
          const teacher = db.users.find(u => u.id === c.teacher_id);
          const myClassExams = db.exams.filter(e => e.classroom_id === c.id && e.status === "active");
          const mySubmissions = db.student_exams.filter(se => se.student_id === myId);
          const mySubscribedExamIds = mySubmissions.map(se => se.exam_id);
          
          const pendingExams = myClassExams.filter(e => !mySubscribedExamIds.includes(e.id)).map(e => ({
            id: e.id,
            title: e.title,
            duration_minutes: e.duration_minutes
          }));
          
          const finishedExams = myClassExams.filter(e => mySubscribedExamIds.includes(e.id)).map(e => {
            const sub = mySubmissions.find(se => se.exam_id === e.id);
            return {
              id: e.id,
              title: e.title,
              score: sub ? sub.score : 0,
              status: sub ? sub.status : "pending"
            };
          });
          
          return {
            id: c.id,
            name: c.name,
            code: c.code,
            teacher_name: teacher ? teacher.name : "Desconhecido",
            pending_exams: pendingExams,
            finished_exams: finishedExams
          };
        });
      }
    );
  },

  startExam: async (examId) => {
    return request(
      `/student/exams/${examId}/start`,
      {
        method: "POST",
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 4;
        
        const exam = db.exams.find(e => e.id === Number(examId));
        if (!exam) throw new Error("Prova não encontrada.");
        
        let se = db.student_exams.find(s => s.student_id === myId && s.exam_id === exam.id);
        if (!se) {
          se = {
            id: db.student_exams.length + 1,
            student_id: myId,
            exam_id: exam.id,
            score: 0.0,
            started_at: new Date().toISOString(),
            finished_at: null,
            status: "in_progress",
            cheating_logs: []
          };
          db.student_exams.push(se);
          db.audit_logs.push({
            id: db.audit_logs.length + 1,
            user_id: myId,
            action: `Iniciou a prova '${exam.title}'`,
            timestamp: new Date().toISOString()
          });
          saveMockDB(db);
        }
        
        const questions = db.questions.filter(q => q.exam_id === exam.id).map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          points: q.points,
          choices: q.choices
        }));
        
        return {
          exam: {
            id: exam.id,
            title: exam.title,
            description: exam.description,
            instructions: exam.instructions,
            duration_minutes: exam.duration_minutes
          },
          questions
        };
      }
    );
  },

  sendCheatingLog: async (examId, eventType, message) => {
    return request(
      `/student/exams/${examId}/cheating-log`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ event_type: eventType, message }),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 4;
        
        const se = db.student_exams.find(s => s.student_id === myId && s.exam_id === Number(examId));
        if (!se) throw new Error("Submissão de prova não ativa.");
        
        if (!se.cheating_logs) se.cheating_logs = [];
        const newLog = {
          event: eventType,
          timestamp: new Date().toISOString(),
          message: message
        };
        se.cheating_logs.push(newLog);
        
        db.audit_logs.push({
          id: db.audit_logs.length + 1,
          user_id: myId,
          action: `ALERTA ANTI-COLA na prova: ${message}`,
          timestamp: new Date().toISOString()
        });
        
        saveMockDB(db);
        return { message: "Alerta registrado com sucesso" };
      }
    );
  },

  submitExamAnswers: async (examId, answers) => {
    return request(
      `/student/exams/${examId}/submit`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ answers }),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 4;
        
        const se = db.student_exams.find(s => s.student_id === myId && s.exam_id === Number(examId));
        if (!se) throw new Error("Prova não iniciada ou já finalizada.");
        
        se.finished_at = new Date().toISOString();
        se.status = "submitted";
        
        db.student_answers = db.student_answers.filter(sa => sa.student_exam_id !== se.id);
        
        let totalScore = 0.0;
        
        Object.keys(answers).forEach(qId => {
          const q = db.questions.find(quest => quest.id === Number(qId));
          if (q) {
            let isCorrect = false;
            let pointsEarned = 0.0;
            let feedback = "";
            
            const studentResp = answers[qId];
            
            if (q.type === 'multiple_choice' || q.type === 'true_false') {
              isCorrect = String(studentResp).trim() === String(q.correct_answer).trim();
              pointsEarned = isCorrect ? q.points : 0.0;
              feedback = isCorrect ? "Correto!" : `Incorreto. Resposta esperada: ${q.correct_answer}`;
              totalScore += pointsEarned;
            }
            
            const newAnswer = {
              id: db.student_answers.length + 1,
              student_exam_id: se.id,
              question_id: q.id,
              student_response: String(studentResp),
              is_correct: isCorrect,
              points_earned: pointsEarned,
              feedback: feedback
            };
            db.student_answers.push(newAnswer);
          }
        });
        
        se.score = Number(totalScore.toFixed(2));
        
        db.audit_logs.push({
          id: db.audit_logs.length + 1,
          user_id: myId,
          action: `Finalizou e entregou a prova`,
          timestamp: new Date().toISOString()
        });
        
        const answersList = db.student_answers.filter(sa => sa.student_exam_id === se.id);
        let iaScore = totalScore;
        answersList.forEach(sa => {
          const q = db.questions.find(quest => quest.id === sa.question_id);
          if (q && (q.type === 'code' || q.type === 'essay')) {
            const isReasonable = sa.student_response.length > 10 && !sa.student_response.includes("nao sei");
            sa.points_earned = isReasonable ? q.points : 0.0;
            sa.is_correct = isReasonable;
            sa.feedback = isReasonable 
              ? `[Correção Mágica por IA]: Lógica correta e sintaxe adequada. Excelente resposta discursiva!`
              : `[Correção Mágica por IA]: Resposta curta ou incompleta.`;
            iaScore += sa.points_earned;
          }
        });
        
        se.score = Number(iaScore.toFixed(2));
        se.status = "graded";
        se.feedback_ia = `[Correção Automática Avançada da IA ExamTech]: Prova corrigida instantaneamente com sucesso. Sua nota final é ${se.score}/10. Você obteve excelente aproveitamento geral. Veja os feedbacks específicos de cada questão abaixo!`;
        
        saveMockDB(db);
        return { message: "Prova enviada com sucesso!", score: se.score };
      }
    );
  },

  getStudentExamResult: async (examId) => {
    return request(
      `/student/exams/${examId}/result`,
      {
        headers: getHeaders(),
      },
      () => {
        const db = initMockDB();
        const currentUser = JSON.parse(localStorage.getItem("examtech_user") || "null");
        const myId = currentUser ? currentUser.id : 4;
        
        const se = db.student_exams.find(s => s.student_id === myId && s.exam_id === Number(examId));
        if (!se) throw new Error("Resultado não encontrado.");
        
        const exam = db.exams.find(e => e.id === Number(examId));
        const answers = db.student_answers.filter(sa => sa.student_exam_id === se.id).map(sa => {
          const question = db.questions.find(q => q.id === sa.question_id);
          return {
            id: sa.id,
            student_response: sa.student_response,
            is_correct: sa.is_correct,
            points_earned: sa.points_earned,
            feedback: sa.feedback,
            question_text: question ? question.text : "Questão Excluída",
            question_type: question ? question.type : "multiple_choice",
            question_points: question ? question.points : 0,
            question_choices: question ? question.choices : []
          };
        });
        
        return {
          score: se.score,
          status: se.status,
          started_at: se.started_at,
          finished_at: se.finished_at,
          feedback_ia: se.feedback_ia,
          exam_title: exam ? exam.title : "Prova Desconhecida",
          answers
        };
      }
    );
  },
};
