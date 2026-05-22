from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import json

db = SQLAlchemy()

# Tabela de associação N:N entre Alunos e Turmas
student_classroom = db.Table('student_classroom',
    db.Column('student_id', db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True),
    db.Column('classroom_id', db.Integer, db.ForeignKey('classroom.id', ondelete='CASCADE'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'admin', 'professor', 'student'
    is_active = db.Column(db.Boolean, default=False) # Precisa ser aprovado pelo admin (exceto admin inicial)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    classrooms_taught = db.relationship('Classroom', backref='teacher', lazy=True)
    exams_taken = db.relationship('StudentExam', backref='student', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)
    logs = db.relationship('AuditLog', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Classroom(db.Model):
    __tablename__ = 'classroom'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    
    # Alunos associados
    students = db.relationship('User', secondary=student_classroom, 
                               backref=db.backref('classrooms_joined', lazy='dynamic'), lazy='subquery')
    # Avaliações associadas
    exams = db.relationship('Exam', backref='classroom', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'teacher': {'id': self.teacher.id, 'name': self.teacher.name} if self.teacher else None,
            'students_count': len(self.students),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Subject(db.Model):
    __tablename__ = 'subject'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    exams = db.relationship('Exam', backref='subject', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Exam(db.Model):
    __tablename__ = 'exam'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    instructions = db.Column(db.Text, nullable=True)
    duration_minutes = db.Column(db.Integer, nullable=False, default=60)
    total_score = db.Column(db.Float, nullable=False, default=10.0)
    status = db.Column(db.String(20), nullable=False, default='draft') # 'draft', 'active', 'finished'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id', ondelete='RESTRICT'), nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classroom.id', ondelete='CASCADE'), nullable=False)
    
    # Questões da prova
    questions = db.relationship('Question', backref='exam', lazy=True, cascade="all, delete-orphan")
    # Provas de alunos
    student_exams = db.relationship('StudentExam', backref='exam', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'instructions': self.instructions,
            'duration_minutes': self.duration_minutes,
            'total_score': self.total_score,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'classroom': {'id': self.classroom.id, 'name': self.classroom.name} if self.classroom else None,
            'subject': {'id': self.subject.id, 'name': self.subject.name} if self.subject else None,
            'questions_count': len(self.questions)
        }

class Question(db.Model):
    __tablename__ = 'question'
    
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id', ondelete='CASCADE'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), nullable=False) # 'multiple_choice', 'true_false', 'essay', 'code'
    image_url = db.Column(db.String(255), nullable=True)
    points = db.Column(db.Float, nullable=False, default=1.0)
    correct_answer = db.Column(db.Text, nullable=False) # Resposta correta (para discursiva/codigo: texto ideal)
    choices_json = db.Column(db.Text, nullable=True) # JSON contendo lista de opções para múltipla escolha
    
    # Respostas de alunos
    student_answers = db.relationship('StudentAnswer', backref='question', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        choices = []
        if self.choices_json:
            try:
                choices = json.loads(self.choices_json)
            except Exception:
                choices = []
                
        return {
            'id': self.id,
            'exam_id': self.exam_id,
            'text': self.text,
            'type': self.type,
            'image_url': self.image_url,
            'points': self.points,
            'correct_answer': self.correct_answer,
            'choices': choices
        }

class StudentExam(db.Model):
    __tablename__ = 'student_exam'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Float, nullable=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    finished_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='started') # 'started', 'submitted', 'graded'
    cheating_logs_json = db.Column(db.Text, nullable=True) # Logs das infrações detectadas
    feedback_ia = db.Column(db.Text, nullable=True) # Análise diagnóstica da IA
    
    # Respostas dadas
    answers = db.relationship('StudentAnswer', backref='student_exam', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        cheating_logs = []
        if self.cheating_logs_json:
            try:
                cheating_logs = json.loads(self.cheating_logs_json)
            except Exception:
                cheating_logs = []
                
        return {
            'id': self.id,
            'student': {'id': self.student.id, 'name': self.student.name, 'email': self.student.email} if self.student else None,
            'exam': {'id': self.exam.id, 'title': self.exam.title, 'total_score': self.exam.total_score} if self.exam else None,
            'score': self.score,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'finished_at': self.finished_at.isoformat() if self.finished_at else None,
            'status': self.status,
            'cheating_logs': cheating_logs,
            'feedback_ia': self.feedback_ia
        }

class StudentAnswer(db.Model):
    __tablename__ = 'student_answer'
    
    id = db.Column(db.Integer, primary_key=True)
    student_exam_id = db.Column(db.Integer, db.ForeignKey('student_exam.id', ondelete='CASCADE'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id', ondelete='CASCADE'), nullable=False)
    student_response = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=True) # Nullable antes da correção
    points_earned = db.Column(db.Float, nullable=True) # Pontos recebidos
    feedback = db.Column(db.Text, nullable=True) # Feedback individual do professor ou da IA

    def to_dict(self):
        return {
            'id': self.id,
            'student_exam_id': self.student_exam_id,
            'question_id': self.question_id,
            'student_response': self.student_response,
            'is_correct': self.is_correct,
            'points_earned': self.points_earned,
            'feedback': self.feedback
        }

class Notification(db.Model):
    __tablename__ = 'notification'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_log'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user': {'id': self.user.id, 'name': self.user.name, 'role': self.user.role} if self.user else None,
            'action': self.action,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'details': self.details
        }
