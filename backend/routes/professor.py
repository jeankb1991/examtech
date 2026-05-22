from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Classroom, Subject, Exam, Question, StudentExam, StudentAnswer, AuditLog
from services.ia_service import IAService
import json

professor_bp = Blueprint('professor', __name__)

def check_professor(user_id):
    user = User.query.get(int(user_id))
    return user and user.role in ['professor', 'admin']

@professor_bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    user_id = get_jwt_identity()
    if not check_professor(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    # Turmas do professor
    classrooms = Classroom.query.filter_by(teacher_id=int(user_id)).all()
    classrooms_ids = [c.id for c in classrooms]
    
    total_classrooms = len(classrooms)
    total_students = sum(len(c.students) for c in classrooms)
    
    # Provas criadas pelo professor
    exams = Exam.query.filter_by(created_by_id=int(user_id)).all()
    total_exams = len(exams)
    
    # Provas resolvidas que precisam de correção
    exams_to_grade = StudentExam.query.join(Exam).filter(
        Exam.created_by_id == int(user_id),
        StudentExam.status == 'submitted'
    ).count()
    
    # Histórico recente de submissões
    recent_submissions = StudentExam.query.join(Exam).filter(
        Exam.created_by_id == int(user_id)
    ).order_by(StudentExam.started_at.desc()).limit(5).all()
    
    return jsonify({
        'classrooms_count': total_classrooms,
        'students_count': total_students,
        'exams_count': total_exams,
        'pending_grading_count': exams_to_grade,
        'recent_submissions': [s.to_dict() for s in recent_submissions]
    }), 200

# Listar turmas do professor
@professor_bp.route('/classrooms', methods=['GET'])
@jwt_required()
def get_my_classrooms():
    user_id = get_jwt_identity()
    if not check_professor(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    classrooms = Classroom.query.filter_by(teacher_id=int(user_id)).all()
    return jsonify([c.to_dict() for c in classrooms]), 200

# CRUD Provas (Exams)
@professor_bp.route('/exams', methods=['GET', 'POST'])
@jwt_required()
def manage_exams():
    user_id = get_jwt_identity()
    if not check_professor(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    if request.method == 'GET':
        exams = Exam.query.filter_by(created_by_id=int(user_id)).order_by(Exam.created_at.desc()).all()
        return jsonify([e.to_dict() for e in exams]), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('title') or not data.get('subject_id') or not data.get('classroom_id'):
            return jsonify({'message': 'Título, Disciplina e Turma são obrigatórios'}), 400
            
        exam = Exam(
            title=data.get('title').strip(),
            description=data.get('description', '').strip(),
            instructions=data.get('instructions', '').strip(),
            duration_minutes=int(data.get('duration_minutes', 60)),
            total_score=float(data.get('total_score', 10.0)),
            status='draft',
            created_by_id=int(user_id),
            subject_id=int(data.get('subject_id')),
            classroom_id=int(data.get('classroom_id'))
        )
        db.session.add(exam)
        db.session.commit()
        
        # Log
        log = AuditLog(
            user_id=int(user_id),
            action="CRIAR_PROVA",
            ip_address=request.remote_addr,
            details=f"Prova '{exam.title}' criada como Rascunho"
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify(exam.to_dict()), 201

@professor_bp.route('/exams/<int:exam_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_single_exam(exam_id):
    user_id = get_jwt_identity()
    if not check_professor(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    exam = Exam.query.filter_by(id=exam_id, created_by_id=int(user_id)).first()
    if not exam:
        return jsonify({'message': 'Prova não encontrada'}), 404
        
    if request.method == 'GET':
        questions = [q.to_dict() for q in exam.questions]
        res = exam.to_dict()
        res['questions'] = questions
        return jsonify(res), 200
        
    elif request.method == 'PUT':
        data = request.get_json()
        if not data:
            return jsonify({'message': 'Nenhum dado enviado'}), 400
            
        exam.title = data.get('title', exam.title).strip()
        exam.description = data.get('description', exam.description).strip()
        exam.instructions = data.get('instructions', exam.instructions).strip()
        exam.duration_minutes = int(data.get('duration_minutes', exam.duration_minutes))
        exam.total_score = float(data.get('total_score', exam.total_score))
        exam.status = data.get('status', exam.status) # 'draft', 'active', 'finished'
        
        db.session.commit()
        
        # Log
        log = AuditLog(
            user_id=int(user_id),
            action="ATUALIZAR_PROVA",
            ip_address=request.remote_addr,
            details=f"Prova '{exam.title}' atualizada. Status: {exam.status}"
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify(exam.to_dict()), 200
        
    elif request.method == 'DELETE':
        # Log
        log = AuditLog(
            user_id=int(user_id),
            action="EXCLUIR_PROVA",
            ip_address=request.remote_addr,
            details=f"Prova '{exam.title}' excluída"
        )
        db.session.add(log)
        
        db.session.delete(exam)
        db.session.commit()
        return jsonify({'message': 'Prova excluída com sucesso'}), 200

# Questões da Prova
@professor_bp.route('/exams/<int:exam_id>/questions', methods=['POST'])
@jwt_required()
def add_question(exam_id):
    user_id = get_jwt_identity()
    if not check_professor(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    exam = Exam.query.filter_by(id=exam_id, created_by_id=int(user_id)).first()
    if not exam:
        return jsonify({'message': 'Prova não encontrada'}), 404
        
    data = request.get_json()
    if not data or not data.get('text') or not data.get('type') or not data.get('correct_answer'):
        return jsonify({'message': 'Texto da questão, Tipo e Resposta Correta são obrigatórios'}), 400
        
    choices = data.get('choices', [])
    
    question = Question(
        exam_id=exam.id,
        text=data.get('text').strip(),
        type=data.get('type'),
        points=float(data.get('points', 1.0)),
        correct_answer=data.get('correct_answer').strip(),
        choices_json=json.dumps(choices) if choices else None,
        image_url=data.get('image_url')
    )
    
    db.session.add(question)
    db.session.commit()
    
    return jsonify(question.to_dict()), 201

@professor_bp.route('/questions/<int:question_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_single_question(question_id):
    user_id = get_jwt_identity()
    if not check_professor(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    question = Question.query.join(Exam).filter(
        Question.id == question_id,
        Exam.created_by_id == int(user_id)
    ).first()
    
    if not question:
        return jsonify({'message': 'Questão não encontrada'}), 404
        
    if request.method == 'PUT':
        data = request.get_json()
        question.text = data.get('text', question.text).strip()
        question.type = data.get('type', question.type)
        question.points = float(data.get('points', question.points))
        question.correct_answer = data.get('correct_answer', question.correct_answer).strip()
        
        choices = data.get('choices')
        if choices is not None:
            question.choices_json = json.dumps(choices) if choices else None
            
        question.image_url = data.get('image_url', question.image_url)
        
        db.session.commit()
        return jsonify(question.to_dict()), 200
        
    elif request.method == 'DELETE':
        db.session.delete(question)
        db.session.commit()
        return jsonify({'message': 'Questão excluída com sucesso'}), 200

# Geração automática de questões com IA
@professor_bp.route('/exams/<int:exam_id>/generate-ai-questions', methods=['POST'])
@jwt_required()
def generate_ai_questions(exam_id):
    user_id = get_jwt_identity()
    if not check_professor(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    exam = Exam.query.filter_by(id=exam_id, created_by_id=int(user_id)).first()
    if not exam:
        return jsonify({'message': 'Prova não encontrada'}), 404
        
    data = request.get_json()
    topic = data.get('topic', exam.subject.name if exam.subject else 'Geral')
    q_type = data.get('type', 'all')
    quantity = int(data.get('quantity', 3))
    difficulty = data.get('difficulty', 'média')
    
    try:
        # Chama a IA de simulação/integração
        ai_questions = IAService.generate_questions(topic, q_type, quantity, difficulty)
        
        # Opcional: Adicionar automaticamente ou retornar para o professor revisar antes
        # Vamos retornar as questões geradas para revisão e inclusão no frontend!
        # Isso dá mais flexibilidade e visual profissional de Dashboard AI ao professor
        return jsonify(ai_questions), 200
    except Exception as e:
        return jsonify({'message': f'Erro ao gerar questões por IA: {str(e)}'}), 500

# Correção manual e listagem de submissões
@professor_bp.route('/submissions', methods=['GET'])
@jwt_required()
def list_submissions():
    user_id = get_jwt_identity()
    if not check_professor(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    # Filtra submissões das provas que pertencem a esse professor
    submissions = StudentExam.query.join(Exam).filter(
        Exam.created_by_id == int(user_id)
    ).order_by(StudentExam.finished_at.desc()).all()
    
    return jsonify([s.to_dict() for s in submissions]), 200

@professor_bp.route('/submissions/<int:student_exam_id>', methods=['GET', 'POST'])
@jwt_required()
def review_submission(student_exam_id):
    user_id = get_jwt_identity()
    if not check_professor(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    submission = StudentExam.query.join(Exam).filter(
        StudentExam.id == student_exam_id,
        Exam.created_by_id == int(user_id)
    ).first()
    
    if not submission:
        return jsonify({'message': 'Submissão de prova não encontrada'}), 404
        
    if request.method == 'GET':
        answers = [a.to_dict() for a in submission.answers]
        # Injeta detalhes das questões originais
        for ans in answers:
            q = Question.query.get(ans['question_id'])
            if q:
                ans['question'] = q.to_dict()
                
        res = submission.to_dict()
        res['answers'] = answers
        return jsonify(res), 200
        
    elif request.method == 'POST':
        # Correção da prova: Recebe as notas e feedbacks de cada questão
        data = request.get_json()
        if not data or 'answers' not in data:
            return jsonify({'message': 'Formato de correção inválido'}), 400
            
        total_score_earned = 0.0
        
        # Corrige as questões enviadas
        for ans_corr in data.get('answers', []):
            answer_id = ans_corr.get('id')
            points = float(ans_corr.get('points_earned', 0.0))
            is_correct = ans_corr.get('is_correct', False)
            feedback = ans_corr.get('feedback', '')
            
            db_answer = StudentAnswer.query.filter_by(id=answer_id, student_exam_id=submission.id).first()
            if db_answer:
                db_answer.points_earned = points
                db_answer.is_correct = is_correct
                db_answer.feedback = feedback
                total_score_earned += points
                
        # Atualiza a nota da prova
        submission.score = round(total_score_earned, 2)
        submission.status = 'graded'
        submission.finished_at = submission.finished_at or datetime.utcnow()
        
        # Gera o feedback diagnótico da IA de forma automática após a correção!
        answers_list = [a.to_dict() for a in submission.answers]
        try:
            feedback_ia = IAService.generate_exam_feedback(
                student_name=submission.student.name,
                exam_title=submission.exam.title,
                score=submission.score,
                total_score=submission.exam.total_score,
                answers_data=answers_list
            )
            submission.feedback_ia = feedback_ia
        except Exception:
            submission.feedback_ia = "Correção finalizada. Excelente esforço!"
            
        db.session.commit()
        
        # Log
        log = AuditLog(
            user_id=int(user_id),
            action="CORRIGIR_PROVA",
            ip_address=request.remote_addr,
            details=f"Prova do aluno {submission.student.name} corrigida. Nota obtida: {submission.score}"
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            'message': 'Correção salva com sucesso!',
            'submission': submission.to_dict()
        }), 200

# Correção Automática Instantânea por IA
@professor_bp.route('/submissions/<int:student_exam_id>/auto-grade-ai', methods=['POST'])
@jwt_required()
def auto_grade_ia(student_exam_id):
    user_id = get_jwt_identity()
    if not check_professor(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    submission = StudentExam.query.join(Exam).filter(
        StudentExam.id == student_exam_id,
        Exam.created_by_id == int(user_id)
    ).first()
    
    if not submission:
        return jsonify({'message': 'Submissão não encontrada'}), 404
        
    total_score = 0.0
    
    # Corrige cada resposta de aluno
    for ans in submission.answers:
        q = ans.question
        
        if q.type == 'multiple_choice' or q.type == 'true_false':
            # Correção direta e infalível
            ans.is_correct = (ans.student_response.strip().lower() == q.correct_answer.strip().lower())
            ans.points_earned = q.points if ans.is_correct else 0.0
            ans.feedback = "[Correção Automática]: Avaliado eletronicamente via gabarito."
            
        elif q.type in ['essay', 'code']:
            # Invoca o corretor conceitual de IA
            result = IAService.evaluate_essay_or_code(q.text, q.correct_answer, ans.student_response)
            ans.is_correct = result['is_correct']
            ans.points_earned = round(q.points * result['points_earned_ratio'], 2)
            ans.feedback = result['feedback']
            
        total_score += ans.points_earned
        
    submission.score = round(total_score, 2)
    submission.status = 'graded'
    
    # Gera Feedback Diagnóstico IA Geral
    answers_list = [a.to_dict() for a in submission.answers]
    submission.feedback_ia = IAService.generate_exam_feedback(
        student_name=submission.student.name,
        exam_title=submission.exam.title,
        score=submission.score,
        total_score=submission.exam.total_score,
        answers_data=answers_list
    )
    
    db.session.commit()
    
    # Log
    log = AuditLog(
        user_id=int(user_id),
        action="CORRECAO_AUTO_IA",
        ip_address=request.remote_addr,
        details=f"Correção inteligente por IA concluída para {submission.student.name}. Nota: {submission.score}"
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'Correção inteligente via IA aplicada com sucesso!',
        'submission': submission.to_dict()
    }), 200
