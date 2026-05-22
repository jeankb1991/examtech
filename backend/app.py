from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db, User, Classroom, Subject, Exam, Question, StudentExam, StudentAnswer, AuditLog
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.professor import professor_bp
from routes.student import student_bp
import os
import json
from datetime import datetime, timedelta

app = Flask(__name__)

# Configurações do App
db_url = os.environ.get('DATABASE_URL', 'sqlite:///examtech.db')
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'examtech-super-secret-key-2026')

# Habilita CORS
CORS(app)

# Inicializa extensões
db.init_app(app)
jwt = JWTManager(app)

# Registra Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(professor_bp, url_prefix='/api/professor')
app.register_blueprint(student_bp, url_prefix='/api/student')

@app.route("/")
def home():
    return jsonify({
        "status": "ONLINE",
        "name": "ExamTech API",
        "version": "1.0.0",
        "engine": "Flask + SQLite (Pronto para PostgreSQL)"
    })

# Seeder de dados iniciais para demonstração instantânea da EdTech
def seed_data():
    if User.query.count() > 0:
        return
        
    print("Iniciando injeção de dados mockados (Seeding)...")
    
    # 1. Criar Administrador
    admin = User(name="Diretora Mariana", email="admin@examtech.com", role="admin", is_active=True)
    admin.set_password("admin123")
    db.session.add(admin)
    
    # 2. Criar Professores
    prof1 = User(name="Prof. Carlos Eduardo", email="professor1@examtech.com", role="professor", is_active=True)
    prof1.set_password("admin123")
    
    prof2 = User(name="Profa. Ana Beatriz", email="professor2@examtech.com", role="professor", is_active=True)
    prof2.set_password("admin123")
    
    db.session.add_all([prof1, prof2])
    db.session.commit()
    
    # 3. Criar Alunos
    student1 = User(name="Jean Lucas", email="aluno1@examtech.com", role="student", is_active=True)
    student1.set_password("admin123")
    
    student2 = User(name="Ana Clara", email="aluno2@examtech.com", role="student", is_active=True)
    student2.set_password("admin123")
    
    student3 = User(name="Mateus Santos", email="aluno3@examtech.com", role="student", is_active=True)
    student3.set_password("admin123")
    
    db.session.add_all([student1, student2, student3])
    db.session.commit()
    
    # 4. Criar Disciplinas
    sub1 = Subject(name="Algoritmos e Programação", description="Lógica de programação, variáveis, condicionais e estruturas de dados em Python.")
    sub2 = Subject(name="Banco de Dados I", description="Projeto lógico e físico de banco de dados SQL e noções de NoSQL.")
    sub3 = Subject(name="Redes de Computadores", description="Arquitetura de redes TCP/IP, roteamento, DNS, switches e redes sem fio.")
    db.session.add_all([sub1, sub2, sub3])
    db.session.commit()
    
    # 5. Criar Turma vinculada ao Prof 1
    classroom = Classroom(name="Técnico em Informática - Módulo 2", code="TECINF", teacher_id=prof1.id)
    classroom.students.append(student1)
    classroom.students.append(student2)
    classroom.students.append(student3)
    db.session.add(classroom)
    db.session.commit()
    
    # 6. Criar Provas
    # Prova 1: Ativa (Lógica Python)
    exam1 = Exam(
        title="Avaliação Parcial de Algoritmos em Python",
        description="Esta avaliação aborda os conceitos fundamentais de Python como listas, variáveis por referência, POO e lógica básica.",
        instructions="Leia atentamente cada questão. A prova tem tempo controlado de 30 minutos. Mantenha a tela em modo Fullscreen. Saídas inesperadas ou trocas de aba serão notificadas e registradas no log de atividades para revisão do professor.",
        duration_minutes=30,
        total_score=10.0,
        status="active",
        created_by_id=prof1.id,
        subject_id=sub1.id,
        classroom_id=classroom.id
    )
    db.session.add(exam1)
    db.session.commit()
    
    # Questões para Prova 1
    q1 = Question(
        exam_id=exam1.id,
        text="Qual será a saída do código Python a seguir?\n\n```python\nlist1 = [1, 2, 3]\nlist2 = list1\nlist2.append(4)\nprint(list1)\n```",
        type="multiple_choice",
        points=2.5,
        correct_answer="[1, 2, 3, 4]",
        choices_json=json.dumps(["[1, 2, 3]", "[1, 2, 3, 4]", "[1, 2, 3, [4]]", "Erro de Atribuição"])
    )
    
    q2 = Question(
        exam_id=exam1.id,
        text="Na programação orientada a objetos (POO), qual é o conceito que permite que uma classe filha herde comportamentos e propriedades de uma classe pai, mas redefina métodos específicos?",
        type="multiple_choice",
        points=2.5,
        correct_answer="Polimorfismo",
        choices_json=json.dumps(["Encapsulamento", "Polimorfismo", "Abstração", "Acoplamento"])
    )
    
    q3 = Question(
        exam_id=exam1.id,
        text="Em JavaScript, `const` define uma variável cujo valor não pode ser reatribuído, mas se o valor for um objeto ou array, suas propriedades ou elementos ainda podem ser modificados.",
        type="true_false",
        points=2.0,
        correct_answer="Verdadeiro",
        choices_json=json.dumps(["Verdadeiro", "Falso"])
    )
    
    q4 = Question(
        exam_id=exam1.id,
        text="Escreva uma função em Python chamada `is_palindrome` que recebe uma string e retorna `True` se for um palíndromo (ignores maiúsculas/minúsculas) e `False` caso contrário.",
        type="code",
        points=3.0,
        correct_answer="def is_palindrome(s):\n    cleaned = ''.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]"
    )
    
    db.session.add_all([q1, q2, q3, q4])
    db.session.commit()
    
    # Prova 2: Rascunho (Banco de Dados)
    exam2 = Exam(
        title="Simulado Geral de Banco de Dados SQL",
        description="Rascunho de simulado para o módulo de Normalização e Consultas SQL Avançadas.",
        instructions="Rascunho apenas para conferência.",
        duration_minutes=60,
        total_score=10.0,
        status="draft",
        created_by_id=prof1.id,
        subject_id=sub2.id,
        classroom_id=classroom.id
    )
    db.session.add(exam2)
    db.session.commit()
    
    # Questões para Prova 2
    q2_1 = Question(
        exam_id=exam2.id,
        text="Qual comando SQL é utilizado para remover registros de uma tabela, mantendo a estrutura da tabela intacta?",
        type="multiple_choice",
        points=5.0,
        correct_answer="DELETE FROM",
        choices_json=json.dumps(["DROP TABLE", "DELETE FROM", "REMOVE TABLE", "ALTER TABLE"])
    )
    db.session.add(q2_1)
    db.session.commit()
    
    # 7. Criar Submissões Históricas (Já corrigidas para gerar gráficos modernos!)
    # Ana Clara realizou uma prova e tirou 9.5
    se1 = StudentExam(
        student_id=student2.id,
        exam_id=exam1.id,
        score=9.5,
        started_at=datetime.utcnow() - timedelta(hours=2),
        finished_at=datetime.utcnow() - timedelta(hours=1, minutes=30),
        status="graded",
        cheating_logs_json=json.dumps([]),
        feedback_ia="[Correção Automática da IA ExamTech]: Excelente resposta! Você abordou todos os conceitos essenciais com clareza e precisão técnica. Parabéns pelo desempenho exemplar em lógica Python!"
    )
    db.session.add(se1)
    db.session.commit()
    
    # Respostas da Ana Clara
    sa1 = StudentAnswer(student_exam_id=se1.id, question_id=q1.id, student_response="[1, 2, 3, 4]", is_correct=True, points_earned=2.5, feedback="Correto!")
    sa2 = StudentAnswer(student_exam_id=se1.id, question_id=q2.id, student_response="Polimorfismo", is_correct=True, points_earned=2.5, feedback="Correto!")
    sa3 = StudentAnswer(student_exam_id=se1.id, question_id=q3.id, student_response="Verdadeiro", is_correct=True, points_earned=2.0, feedback="Correto!")
    sa4 = StudentAnswer(student_exam_id=se1.id, question_id=q4.id, student_response="def is_palindrome(s):\n    s = s.lower().replace(' ', '')\n    return s == s[::-1]", is_correct=True, points_earned=2.5, feedback="Muito bom! O código funciona para a maioria das entradas de texto comuns.")
    db.session.add_all([sa1, sa2, sa3, sa4])
    
    # Mateus realizou a prova, tentou colar (trocou de abas), tirou 4.5
    se2 = StudentExam(
        student_id=student3.id,
        exam_id=exam1.id,
        score=4.5,
        started_at=datetime.utcnow() - timedelta(hours=3),
        finished_at=datetime.utcnow() - timedelta(hours=2, minutes=20),
        status="graded",
        cheating_logs_json=json.dumps([
            {"event": "blur", "timestamp": (datetime.utcnow() - timedelta(hours=2, minutes=45)).isoformat(), "message": "O aluno trocou de aba ou minimizou a prova!"},
            {"event": "fullscreen-exit", "timestamp": (datetime.utcnow() - timedelta(hours=2, minutes=30)).isoformat(), "message": "O aluno saiu do modo tela cheia!"}
        ]),
        feedback_ia="[Correção Automática da IA ExamTech]: Desempenho abaixo do esperado. Dificuldade severa em conceitos estruturais. Além disso, foram detectadas infrações do sistema anti-cola (saída de fullscreen e mudança de abas). Recomendamos plantão de dúvidas urgente."
    )
    db.session.add(se2)
    db.session.commit()
    
    # Respostas do Mateus
    sa2_1 = StudentAnswer(student_exam_id=se2.id, question_id=q1.id, student_response="[1, 2, 3]", is_correct=False, points_earned=0.0, feedback="Incorreto. Listas em Python funcionam por referência.")
    sa2_2 = StudentAnswer(student_exam_id=se2.id, question_id=q2.id, student_response="Polimorfismo", is_correct=True, points_earned=2.5, feedback="Correto!")
    sa2_3 = StudentAnswer(student_exam_id=se2.id, question_id=q3.id, student_response="Verdadeiro", is_correct=True, points_earned=2.0, feedback="Correto!")
    sa2_4 = StudentAnswer(student_exam_id=se2.id, question_id=q4.id, student_response="nao sei fazer", is_correct=False, points_earned=0.0, feedback="Não respondeu de forma válida.")
    db.session.add_all([sa2_1, sa2_2, sa2_3, sa2_4])
    
    db.session.commit()
    print("Seeding concluído com sucesso!")

# Inicializa o Banco e roda Seeding
with app.app_context():
    db.create_all()
    seed_data()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
