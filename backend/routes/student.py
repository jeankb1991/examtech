from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Classroom, Exam, Question, StudentExam, StudentAnswer, AuditLog
from datetime import datetime
import json

student_bp = Blueprint('student', __name__)

def check_student(user_id):
    user = User.query.get(int(user_id))
    return user and user.role == 'student'

# Métricas e Dashboard do Aluno
@student_bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    user_id = get_jwt_identity()
    if not check_student(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    student = User.query.get(int(user_id))
    classrooms = student.classrooms_joined.all()
    classrooms_ids = [c.id for c in classrooms]
    
    # Provas disponíveis para fazer (Ativas nas turmas do aluno)
    available_exams = []
    if classrooms_ids:
        # Pega todas as provas ativas nas turmas do aluno
        all_active_exams = Exam.query.filter(
            Exam.classroom_id.in_(classrooms_ids),
            Exam.status == 'active'
        ).all()
        
        # Filtra as que o aluno ainda não fez ou não enviou
        for exam in all_active_exams:
            se = StudentExam.query.filter_by(student_id=student.id, exam_id=exam.id).first()
            if not se or se.status == 'started': # Se começou mas não enviou ou nunca começou
                available_exams.append(exam)
                
    # Histórico de provas feitas
    past_exams = StudentExam.query.filter_by(student_id=student.id).filter(
        StudentExam.status.in_(['submitted', 'graded'])
    ).all()
    
    total_classrooms = len(classrooms)
    total_completed = len(past_exams)
    total_pending = len(available_exams)
    
    # Ranking dos Alunos (Gamificado) baseado na média das notas
    # Vamos mockar ou calcular uma lista simples de ranking dos colegas de turma
    ranking = []
    all_students = User.query.filter_by(role='student', is_active=True).all()
    for s in all_students:
        completed = StudentExam.query.filter_by(student_id=s.id, status='graded').all()
        avg_score = sum(e.score for e in completed) / len(completed) if completed else 0.0
        ranking.append({
            'name': s.name,
            'avg_score': round(avg_score, 1),
            'exams_completed': len(completed)
        })
    # Ordena o ranking do maior para o menor
    ranking = sorted(ranking, key=lambda x: x['avg_score'], reverse=True)
    
    return jsonify({
        'classrooms_count': total_classrooms,
        'completed_exams_count': total_completed,
        'pending_exams_count': total_pending,
        'available_exams': [e.to_dict() for e in available_exams],
        'past_exams': [pe.to_dict() for pe in past_exams],
        'ranking': ranking[:10] # Top 10
    }), 200

# Cadastrar/Entrar em uma turma usando código único
@student_bp.route('/classrooms/join', methods=['POST'])
@jwt_required()
def join_classroom():
    user_id = get_jwt_identity()
    if not check_student(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    data = request.get_json()
    if not data or not data.get('code'):
        return jsonify({'message': 'Código da turma é obrigatório'}), 400
        
    code = data.get('code').strip().upper()
    classroom = Classroom.query.filter_by(code=code).first()
    if not classroom:
        return jsonify({'message': 'Código inválido! Nenhuma turma encontrada com este código'}), 404
        
    student = User.query.get(int(user_id))
    
    if student in classroom.students:
        return jsonify({'message': 'Você já faz parte desta turma'}), 400
        
    classroom.students.append(student)
    
    # Log de Auditoria
    log = AuditLog(
        user_id=student.id,
        action="ENTRAR_TURMA",
        ip_address=request.remote_addr,
        details=f"Aluno entrou na turma: {classroom.name} ({classroom.code})"
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': f'Você entrou com sucesso na turma: {classroom.name}',
        'classroom': classroom.to_dict()
    }), 200

# Listar minhas turmas
@student_bp.route('/classrooms', methods=['GET'])
@jwt_required()
def get_my_classrooms():
    user_id = get_jwt_identity()
    if not check_student(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    student = User.query.get(int(user_id))
    classrooms = student.classrooms_joined.all()
    return jsonify([c.to_dict() for c in classrooms]), 200

# Provas e Aplicação de Prova
@student_bp.route('/exams/<int:exam_id>/start', methods=['POST'])
@jwt_required()
def start_exam(exam_id):
    user_id = get_jwt_identity()
    if not check_student(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    student = User.query.get(int(user_id))
    exam = Exam.query.get(exam_id)
    if not exam or exam.status != 'active':
        return jsonify({'message': 'Esta avaliação não está ativa no momento'}), 404
        
    # Verifica se o aluno está matriculado na turma dessa prova
    classrooms_ids = [c.id for c in student.classrooms_joined.all()]
    if exam.classroom_id not in classrooms_ids:
        return jsonify({'message': 'Você não tem permissão para realizar esta prova'}), 403
        
    # Verifica se já iniciou ou realizou a prova
    existing = StudentExam.query.filter_by(student_id=student.id, exam_id=exam.id).first()
    if existing:
        if existing.status in ['submitted', 'graded']:
            return jsonify({'message': 'Você já enviou esta prova anteriormente'}), 400
        # Se estiver 'started', reaproveita
        questions = [q.to_dict() for q in exam.questions]
        # Remove a resposta correta para o aluno não colar via inspecionar elemento
        for q in questions:
            q['correct_answer'] = ''
            
        res = existing.to_dict()
        res['questions'] = questions
        return jsonify(res), 200
        
    # Cria nova submissão
    student_exam = StudentExam(
        student_id=student.id,
        exam_id=exam.id,
        status='started',
        cheating_logs_json=json.dumps([]),
        started_at=datetime.utcnow()
    )
    db.session.add(student_exam)
    db.session.commit()
    
    # Log de Auditoria
    log = AuditLog(
        user_id=student.id,
        action="INICIAR_PROVA",
        ip_address=request.remote_addr,
        details=f"Iniciou a avaliação '{exam.title}'"
    )
    db.session.add(log)
    db.session.commit()
    
    questions = [q.to_dict() for q in exam.questions]
    for q in questions:
        q['correct_answer'] = ''
        
    res = student_exam.to_dict()
    res['questions'] = questions
    return jsonify(res), 200

# Registrar Log de Tentativa de Cola/Infracao
@student_bp.route('/exams/<int:exam_id>/cheating-log', methods=['POST'])
@jwt_required()
def report_cheating_event(exam_id):
    user_id = get_jwt_identity()
    if not check_student(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    data = request.get_json()
    if not data or not data.get('event_type'):
        return jsonify({'message': 'Tipo de evento é obrigatório'}), 400
        
    student_exam = StudentExam.query.filter_by(student_id=int(user_id), exam_id=exam_id, status='started').first()
    if not student_exam:
        return jsonify({'message': 'Nenhuma avaliação em andamento para esta prova'}), 404
        
    event_type = data.get('event_type')
    timestamp = datetime.utcnow().isoformat()
    
    # Decodifica logs atuais
    logs = []
    if student_exam.cheating_logs_json:
        try:
            logs = json.loads(student_exam.cheating_logs_json)
        except Exception:
            logs = []
            
    logs.append({
        'event': event_type,
        'timestamp': timestamp,
        'message': data.get('message', 'Infração de segurança detectada')
    })
    
    student_exam.cheating_logs_json = json.dumps(logs)
    
    # Salva também no log central de auditoria
    log = AuditLog(
        user_id=int(user_id),
        action="INFRACAO_PROVA",
        ip_address=request.remote_addr,
        details=f"Tentativa de cola detectada na prova {exam_id}: {event_type}"
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'Log de infração registrado com sucesso', 'logs_count': len(logs)}), 200

# Submeter respostas da Prova
@student_bp.route('/exams/<int:exam_id>/submit', methods=['POST'])
@jwt_required()
def submit_exam(exam_id):
    user_id = get_jwt_identity()
    if not check_student(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    student = User.query.get(int(user_id))
    student_exam = StudentExam.query.filter_by(student_id=student.id, exam_id=exam_id, status='started').first()
    if not student_exam:
        return jsonify({'message': 'Nenhuma avaliação em andamento para esta prova'}), 404
        
    data = request.get_json()
    if not data or 'answers' not in data:
        return jsonify({'message': 'Respostas não enviadas'}), 400
        
    answers = data.get('answers') # Dicionário {question_id: student_response}
    
    # Deleta respostas antigas se houver
    StudentAnswer.query.filter_by(student_exam_id=student_exam.id).delete()
    
    # Grava respostas e faz pré-correção instantânea para múltipla escolha e verdadeiro/falso
    for q_id_str, response in answers.items():
        q_id = int(q_id_str)
        q = Question.query.get(q_id)
        if not q or q.exam_id != exam_id:
            continue
            
        student_ans = StudentAnswer(
            student_exam_id=student_exam.id,
            question_id=q.id,
            student_response=str(response).strip()
        )
        
        # Correção automática instantânea se for objetiva
        if q.type in ['multiple_choice', 'true_false']:
            is_correct = (str(response).strip().lower() == q.correct_answer.strip().lower())
            student_ans.is_correct = is_correct
            student_ans.points_earned = q.points if is_correct else 0.0
            student_ans.feedback = "[Correção Automática]: Correção por gabarito eletrônico."
            
        db.session.add(student_ans)
        
    student_exam.status = 'submitted'
    student_exam.finished_at = datetime.utcnow()
    
    # Log de Auditoria
    log = AuditLog(
        user_id=student.id,
        action="SUBMETER_PROVA",
        ip_address=request.remote_addr,
        details=f"Submeteu a avaliação '{student_exam.exam.title}'"
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'Avaliação enviada com sucesso! Aguarde a liberação da nota.',
        'submission': student_exam.to_dict()
    }), 200

# Ver detalhes do resultado (Apenas se já estiver corrigida)
@student_bp.route('/exams/<int:exam_id>/result', methods=['GET'])
@jwt_required()
def get_exam_result(exam_id):
    user_id = get_jwt_identity()
    if not check_student(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    student_exam = StudentExam.query.filter_by(student_id=int(user_id), exam_id=exam_id).first()
    if not student_exam:
        return jsonify({'message': 'Submissão não encontrada'}), 404
        
    # Se o professor ainda não liberou a nota (está apenas 'submitted'), o aluno não vê detalhes ainda
    if student_exam.status != 'graded':
        return jsonify({
            'status': student_exam.status,
            'message': 'Sua avaliação foi recebida e está na fila de correção do Professor.'
        }), 200
        
    # Retorna o feedback completo
    answers = []
    for ans in student_exam.answers:
        q = Question.query.get(ans.question_id)
        choices = []
        if q and q.choices_json:
            try:
                choices = json.loads(q.choices_json)
            except Exception:
                choices = []
                
        answers.append({
            'id': ans.id,
            'question_id': ans.question_id,
            'question_text': q.text if q else '',
            'question_type': q.type if q else '',
            'question_choices': choices,
            'student_response': ans.student_response,
            'correct_answer': q.correct_answer if q else '',
            'is_correct': ans.is_correct,
            'points_earned': ans.points_earned,
            'max_points': q.points if q else 1.0,
            'feedback': ans.feedback
        })
        
    res = student_exam.to_dict()
    res['answers'] = answers
    return jsonify(res), 200
