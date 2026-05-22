from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, AuditLog
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('email') or not data.get('password') or not data.get('role'):
        return jsonify({'message': 'Preencha todos os campos obrigatórios'}), 400
        
    email = data.get('email').strip().lower()
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Este e-mail já está cadastrado no sistema'}), 400
        
    # Verifica se é o primeiro usuário do sistema. Se sim, vira admin e ativo automaticamente
    is_first_user = User.query.count() == 0
    role = data.get('role')
    
    if role not in ['admin', 'professor', 'student']:
        return jsonify({'message': 'Papel de usuário inválido'}), 400
        
    user = User(
        name=data.get('name').strip(),
        email=email,
        role=role,
        is_active=True if (is_first_user or role == 'student') else False # Alunos ativos por padrão, professores precisam de aprovação
    )
    user.set_password(data.get('password'))
    
    if is_first_user:
        user.role = 'admin'
        user.is_active = True
        
    try:
        db.session.add(user)
        db.session.commit()
        
        # Log da ação
        log = AuditLog(
            user_id=user.id,
            action="REGISTRO_USUARIO",
            ip_address=request.remote_addr,
            details=f"Usuário registrado com sucesso: {user.name} ({user.role})"
        )
        db.session.add(log)
        db.session.commit()
        
        status_msg = "Cadastro realizado! Alunos e Admins entram direto. Professores aguardam aprovação de um Administrador."
        return jsonify({
            'message': 'Registro efetuado com sucesso',
            'status_message': status_msg,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro ao registrar usuário: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'E-mail e senha são obrigatórios'}), 400
        
    email = data.get('email').strip().lower()
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({'message': 'E-mail ou senha incorretos'}), 401
        
    if not user.is_active:
        return jsonify({'message': 'Sua conta ainda não foi aprovada pelo Administrador. Aguarde a liberação do acesso.'}), 403
        
    # Gera token de acesso JWT (expira em 24h para facilitar o desenvolvimento/uso do SaaS)
    expires = datetime.timedelta(days=1)
    access_token = create_access_token(identity=str(user.id), expires_delta=expires)
    
    # Log de login
    log = AuditLog(
        user_id=user.id,
        action="LOGIN_USUARIO",
        ip_address=request.remote_addr,
        details=f"Login efetuado com sucesso"
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'message': 'Usuário não encontrado'}), 404
        
    return jsonify({
        'user': user.to_dict()
    }), 200
