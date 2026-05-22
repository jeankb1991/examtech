from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Classroom, Subject, Exam, StudentExam, AuditLog
import string
import random

admin_bp = Blueprint('admin', __name__)

def check_admin(user_id):
    user = User.query.get(int(user_id))
    return user and user.role == 'admin'

@admin_bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    user_id = get_jwt_identity()
    if not check_admin(user_id):
        return jsonify({'message': 'Acesso negado: Requer privilégios de Administrador'}), 403
        
    total_students = User.query.filter_by(role='student').count()
    total_teachers = User.query.filter_by(role='professor').count()
    total_classrooms = Classroom.query.count()
    total_subjects = Subject.query.count()
    total_exams = Exam.query.count()
    total_completed_exams = StudentExam.query.filter_by(status='graded').count()
    
    # Usuários pendentes de aprovação
    pending_users = User.query.filter_by(is_active=False).count()
    
    # logs recentes
    recent_logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(5).all()
    
    return jsonify({
        'students_count': total_students,
        'teachers_count': total_teachers,
        'classrooms_count': total_classrooms,
        'subjects_count': total_subjects,
        'exams_count': total_exams,
        'completed_exams_count': total_completed_exams,
        'pending_users_count': pending_users,
        'recent_logs': [l.to_dict() for l in recent_logs]
    }), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    user_id = get_jwt_identity()
    if not check_admin(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200

@admin_bp.route('/users/<int:target_user_id>/toggle-active', methods=['POST'])
@jwt_required()
def toggle_user_active(target_user_id):
    user_id = get_jwt_identity()
    if not check_admin(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    target_user = User.query.get(target_user_id)
    if not target_user:
        return jsonify({'message': 'Usuário não encontrado'}), 404
        
    if target_user.id == int(user_id):
        return jsonify({'message': 'Você não pode desativar a si mesmo'}), 400
        
    target_user.is_active = not target_user.is_active
    
    # Log de Auditoria
    log = AuditLog(
        user_id=int(user_id),
        action="MODIFICAR_STATUS_USUARIO",
        ip_address=request.remote_addr,
        details=f"Status do usuário {target_user.email} alterado para {'Ativo' if target_user.is_active else 'Inativo'}"
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': f"Usuário {'ativado' if target_user.is_active else 'desativado'} com sucesso",
        'user': target_user.to_dict()
    }), 200

# CRUD Turmas
@admin_bp.route('/classrooms', methods=['GET', 'POST'])
@jwt_required()
def manage_classrooms():
    user_id = get_jwt_identity()
    if not check_admin(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    if request.method == 'GET':
        classrooms = Classroom.query.order_by(Classroom.created_at.desc()).all()
        return jsonify([c.to_dict() for c in classrooms]), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('name') or not data.get('teacher_id'):
            return jsonify({'message': 'Nome da turma e Professor são obrigatórios'}), 400
            
        teacher = User.query.filter_by(id=data.get('teacher_id'), role='professor').first()
        if not teacher:
            return jsonify({'message': 'Professor inválido'}), 400
            
        # Gera código único de 6 caracteres para a turma
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        while Classroom.query.filter_by(code=code).first():
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            
        classroom = Classroom(
            name=data.get('name').strip(),
            code=code,
            teacher_id=teacher.id
        )
        db.session.add(classroom)
        db.session.commit()
        
        # Log
        log = AuditLog(
            user_id=int(user_id),
            action="CRIAR_TURMA",
            ip_address=request.remote_addr,
            details=f"Turma criada: {classroom.name} (Código: {classroom.code}, Professor: {teacher.name})"
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify(classroom.to_dict()), 201

@admin_bp.route('/classrooms/<int:classroom_id>', methods=['DELETE'])
@jwt_required()
def delete_classroom(classroom_id):
    user_id = get_jwt_identity()
    if not check_admin(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'message': 'Turma não encontrada'}), 404
        
    # Log
    log = AuditLog(
        user_id=int(user_id),
        action="EXCLUIR_TURMA",
        ip_address=request.remote_addr,
        details=f"Turma excluída: {classroom.name} ({classroom.code})"
    )
    db.session.add(log)
    
    db.session.delete(classroom)
    db.session.commit()
    
    return jsonify({'message': 'Turma excluída com sucesso'}), 200

# CRUD Disciplinas
@admin_bp.route('/subjects', methods=['GET', 'POST'])
@jwt_required()
def manage_subjects():
    user_id = get_jwt_identity()
    if not check_admin(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    if request.method == 'GET':
        subjects = Subject.query.order_by(Subject.name.asc()).all()
        return jsonify([s.to_dict() for s in subjects]), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({'message': 'Nome da disciplina é obrigatório'}), 400
            
        subject_name = data.get('name').strip()
        if Subject.query.filter_by(name=subject_name).first():
            return jsonify({'message': 'Disciplina com este nome já existe'}), 400
            
        subject = Subject(
            name=subject_name,
            description=data.get('description', '').strip()
        )
        db.session.add(subject)
        db.session.commit()
        
        # Log
        log = AuditLog(
            user_id=int(user_id),
            action="CRIAR_DISCIPLINA",
            ip_address=request.remote_addr,
            details=f"Disciplina criada: {subject.name}"
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify(subject.to_dict()), 201

@admin_bp.route('/subjects/<int:subject_id>', methods=['DELETE'])
@jwt_required()
def delete_subject(subject_id):
    user_id = get_jwt_identity()
    if not check_admin(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({'message': 'Disciplina não encontrada'}), 404
        
    # Verifica se existem provas vinculadas a essa disciplina
    if len(subject.exams) > 0:
        return jsonify({'message': 'Não é possível excluir uma disciplina que possui provas associadas'}), 400
        
    # Log
    log = AuditLog(
        user_id=int(user_id),
        action="EXCLUIR_DISCIPLINA",
        ip_address=request.remote_addr,
        details=f"Disciplina excluída: {subject.name}"
    )
    db.session.add(log)
    
    db.session.delete(subject)
    db.session.commit()
    
    return jsonify({'message': 'Disciplina excluída com sucesso'}), 200

# Logs de Auditoria
@admin_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_logs():
    user_id = get_jwt_identity()
    if not check_admin(user_id):
        return jsonify({'message': 'Acesso negado'}), 403
        
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify([l.to_dict() for l in logs]), 200
