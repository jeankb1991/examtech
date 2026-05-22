import os
import json
import random

class IAService:
    @staticmethod
    def generate_questions(topic, question_type, quantity, difficulty="média"):
        """
        Gera questões técnicas realistas de forma automática baseada no tópico e tipo.
        Usa um algoritmo dinâmico com templates técnicos detalhados para simular a IA
        ou integrar com APIs de LLM futuramente.
        """
        # Banco de templates de TI e Cursos Técnicos para geração de alta qualidade
        tech_questions = {
            "programação": [
                {
                    "text": "Qual será a saída do código Python a seguir?\n\n```python\nlist1 = [1, 2, 3]\nlist2 = list1\nlist2.append(4)\nprint(list1)\n```",
                    "type": "multiple_choice",
                    "choices": ["[1, 2, 3]", "[1, 2, 3, 4]", "Erro de compilação", "None"],
                    "correct_answer": "[1, 2, 3, 4]",
                    "points": 2.0
                },
                {
                    "text": "Na programação orientada a objetos (POO), qual é o conceito que permite que uma classe filha herde comportamentos e propriedades de uma classe pai, mas redefina métodos específicos?",
                    "type": "multiple_choice",
                    "choices": ["Encapsulamento", "Polimorfismo", "Abstração", "Acoplamento"],
                    "correct_answer": "Polimorfismo",
                    "points": 2.0
                },
                {
                    "text": "Explique a diferença fundamental entre as linguagens compiladas (como C++) e interpretadas (como Python ou JavaScript) em termos de execução e performance.",
                    "type": "essay",
                    "choices": [],
                    "correct_answer": "Linguagens compiladas são traduzidas diretamente para código de máquina antes da execução por um compilador, oferecendo performance superior e detecção prévia de erros de sintaxe. Linguagens interpretadas são lidas e executadas linha por linha em tempo de execução por um interpretador, proporcionando maior flexibilidade e portabilidade, porém com um overhead de performance adicional.",
                    "points": 2.5
                },
                {
                    "text": "Escreva uma função em Python chamada `is_palindrome` que recebe uma string e retorna `True` se for um palíndromo (ignores maiúsculas/minúsculas) e `False` caso contrário.",
                    "type": "code",
                    "choices": [],
                    "correct_answer": "def is_palindrome(s):\n    cleaned = ''.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]",
                    "points": 3.0
                },
                {
                    "text": "Em JavaScript, `const` define uma variável cujo valor não pode ser reatribuído, mas se o valor for um objeto ou array, suas propriedades ou elementos ainda podem ser modificados.",
                    "type": "true_false",
                    "choices": ["Verdadeiro", "Falso"],
                    "correct_answer": "Verdadeiro",
                    "points": 1.0
                }
            ],
            "banco de dados": [
                {
                    "text": "Qual comando SQL é utilizado para remover registros de uma tabela, mantendo a estrutura da tabela intacta?",
                    "type": "multiple_choice",
                    "choices": ["DROP TABLE", "DELETE FROM", "REMOVE TABLE", "ALTER TABLE"],
                    "correct_answer": "DELETE FROM",
                    "points": 2.0
                },
                {
                    "text": "O que representam as propriedades ACID em sistemas de banco de dados relacionais (SGBDR)?",
                    "type": "multiple_choice",
                    "choices": [
                        "Acessibilidade, Consistência, Integridade, Durabilidade",
                        "Atomicidade, Consistência, Isolamento, Durabilidade",
                        "Atomicidade, Compartilhamento, Integridade, Desempenho",
                        "Agilidade, Conexão, Isolamento, Distribuição"
                    ],
                    "correct_answer": "Atomicidade, Consistência, Isolamento, Durabilidade",
                    "points": 2.5
                },
                {
                    "text": "Explique a função de uma chave estrangeira (Foreign Key) e como ela ajuda a garantir a integridade referencial em um banco de dados.",
                    "type": "essay",
                    "choices": [],
                    "correct_answer": "Uma chave estrangeira é um campo (ou coleção de campos) em uma tabela que referencia a chave primária de outra tabela. Ela estabelece uma ligação lógica entre os dados e garante a integridade referencial ao impedir que registros órfãos sejam criados (por exemplo, deletar um cliente que possui pedidos vinculados sem tratamento prévio).",
                    "points": 2.5
                },
                {
                    "text": "Escreva uma query SQL para selecionar o nome (`name`) e a média de notas (`avg_grade`) de alunos agrupados pela turma (`classroom_id`), exibindo apenas turmas com média superior a 7.0.",
                    "type": "code",
                    "choices": [],
                    "correct_answer": "SELECT classroom_id, AVG(grade) as avg_grade \nFROM students \nGROUP BY classroom_id \nHAVING AVG(grade) > 7.0;",
                    "points": 3.0
                }
            ],
            "redes de computadores": [
                {
                    "text": "Qual protocolo da camada de aplicação do modelo TCP/IP é responsável por traduzir nomes de domínio legíveis (como www.examtech.com) em endereços IP?",
                    "type": "multiple_choice",
                    "choices": ["HTTP", "DHCP", "DNS", "FTP"],
                    "correct_answer": "DNS",
                    "points": 2.0
                },
                {
                    "text": "Qual a principal diferença entre os protocolos TCP (Transmission Control Protocol) e UDP (User Datagram Protocol)?",
                    "type": "multiple_choice",
                    "choices": [
                        "TCP é mais rápido; UDP é mais seguro.",
                        "TCP é orientado à conexão com entrega garantida; UDP é não orientado à conexão e focado em velocidade.",
                        "TCP atua na camada física; UDP atua na camada de transporte.",
                        "Não há diferenças práticas entre os dois."
                    ],
                    "correct_answer": "TCP é orientado à conexão com entrega garantida; UDP é não orientado à conexão e focado em velocidade.",
                    "points": 2.5
                },
                {
                    "text": "Uma máscara de subrede `/24` no CIDR equivale a qual máscara em formato decimal pontuado?",
                    "type": "multiple_choice",
                    "choices": ["255.255.0.0", "255.255.255.0", "255.0.0.0", "255.255.255.24"],
                    "correct_answer": "255.255.255.0",
                    "points": 2.0
                }
            ]
        }

        # Tratamento de tópicos desconhecidos (criação dinâmica inteligente)
        topic_lower = topic.lower()
        matched_topic = None
        for key in tech_questions.keys():
            if key in topic_lower or topic_lower in key:
                matched_topic = key
                break
        
        # Filtra questões disponíveis no banco ou gera genéricas se não encontrar
        available_questions = []
        if matched_topic:
            available_questions = [q for q in tech_questions[matched_topic] if question_type == "all" or q["type"] == question_type]
        
        # Se não houver questões suficientes, cria dinamicamente
        generated = []
        if len(available_questions) >= quantity:
            generated = random.sample(available_questions, quantity)
        else:
            generated = list(available_questions)
            # Preenche o restante com questões geradas por template genérico baseado no tópico
            types_to_generate = ["multiple_choice", "true_false", "essay", "code"] if question_type == "all" else [question_type]
            
            while len(generated) < quantity:
                q_type = random.choice(types_to_generate)
                index = len(generated) + 1
                
                if q_type == "multiple_choice":
                    choices = [
                        f"Alternativa A: Definição avançada de {topic} nível {difficulty}.",
                        f"Alternativa B: Conceito incorreto de {topic}.",
                        f"Alternativa C: Proposta obsoleta sobre {topic}.",
                        f"Alternativa D: Abstração inadequada."
                    ]
                    correct = choices[0]
                    random.shuffle(choices)
                    generated.append({
                        "text": f"Considere o tema '{topic}'. Qual das alternativas a seguir apresenta a definição mais precisa e atualizada sobre o assunto no contexto técnico?",
                        "type": "multiple_choice",
                        "choices": choices,
                        "correct_answer": correct,
                        "points": 2.0
                    })
                elif q_type == "true_false":
                    is_true = random.choice([True, False])
                    correct = "Verdadeiro" if is_true else "Falso"
                    generated.append({
                        "text": f"No âmbito de {topic}, afirma-se que o uso das melhores práticas de arquitetura assegura escalabilidade e resiliência superiores em ambientes produtivos de alto tráfego. Essa afirmativa é verdadeira ou falsa?",
                        "type": "true_false",
                        "choices": ["Verdadeiro", "Falso"],
                        "correct_answer": correct,
                        "points": 1.0
                    })
                elif q_type == "essay":
                    generated.append({
                        "text": f"Descreva resumidamente os principais desafios técnicos enfrentados na implementação prática de {topic} e quais soluções de arquitetura moderna podem mitigá-los.",
                        "type": "essay",
                        "choices": [],
                        "correct_answer": f"A implementação de {topic} exige planejamento rigoroso. Os principais desafios envolvem latência, acoplamento de componentes e consistência dos dados. Soluções como caching distribuído, microsserviços desacoplados e filas assíncronas ajudam na mitigação.",
                        "points": 2.5
                    })
                else: # code
                    generated.append({
                        "text": f"Escreva um pseudocódigo ou trecho de algoritmo que represente uma rotina otimizada para processar ou gerenciar dados usando o conceito fundamental de {topic}.",
                        "type": "code",
                        "choices": [],
                        "correct_answer": f"# Solução otimizada para {topic}\ndef process_data(data_stream):\n    validated = [item for item in data_stream if item.is_valid()]\n    return sorted(validated, key=lambda x: x.priority)",
                        "points": 3.0
                    })
                    
        # Formata com IDs temporários se necessário
        return generated[:quantity]

    @staticmethod
    def evaluate_essay_or_code(question_text, correct_answer, student_answer):
        """
        Simula a avaliação inteligente da IA para questões discursivas ou de programação,
        calculando similaridade conceitual e identificação de palavras-chave.
        """
        if not student_answer or len(student_answer.strip()) < 5:
            return {
                "is_correct": False,
                "points_earned_ratio": 0.0,
                "feedback": "Resposta em branco ou muito curta para avaliação."
            }
            
        student_words = set(student_answer.lower().split())
        ideal_words = set(correct_answer.lower().split())
        
        # Procura palavras-chave técnicas comuns na resposta correta
        keywords = [w for w in ideal_words if len(w) > 4 and w not in ["sobre", "como", "para", "uma", "com", "que", "dos", "das"]]
        match_count = sum(1 for kw in keywords if kw in student_answer.lower())
        
        # Calcula taxa de acerto aproximada
        if len(keywords) > 0:
            match_ratio = match_count / len(keywords)
        else:
            match_ratio = 0.5
            
        # Adiciona um fator de comprimento e complexidade
        len_factor = min(len(student_answer) / len(correct_answer), 1.2)
        score_ratio = min(match_ratio * 0.8 + len_factor * 0.2, 1.0)
        
        # Arredondamentos de avaliação
        is_correct = score_ratio >= 0.6
        score_ratio = round(score_ratio, 2)
        
        # Feedbacks contextualizados da IA
        if score_ratio >= 0.85:
            feedback = "Excelente resposta! Você abordou todos os conceitos essenciais com clareza e precisão técnica."
        elif score_ratio >= 0.6:
            feedback = "Muito bom! Sua resposta demonstra bom entendimento técnico, porém poderia incluir mais detalhes específicos ou palavras-chave chave."
        elif score_ratio >= 0.3:
            feedback = "Resposta incompleta ou confusa. Você mencionou alguns tópicos soltos, mas faltou coerência técnica ou conexão profunda com o conceito solicitado."
        else:
            feedback = "Incorreto. A resposta dada destoa bastante do gabarito conceitual ideal da questão. Recomendamos revisar a teoria associada."
            
        return {
            "is_correct": is_correct,
            "points_earned_ratio": score_ratio,
            "feedback": f"[Correção Automática da IA ExamTech]: {feedback}"
        }

    @staticmethod
    def generate_exam_feedback(student_name, exam_title, score, total_score, answers_data):
        """
        Gera uma análise diagnóstica completa baseada no desempenho do aluno.
        """
        pct = (score / total_score) * 100 if total_score > 0 else 0
        
        # Análise por tópicos
        correct_count = sum(1 for a in answers_data if a.get('is_correct'))
        total_count = len(answers_data)
        
        insights = []
        if pct >= 90:
            status = "Excelente"
            insights.append("Domínio absoluto do conteúdo avaliado. Demonstra facilidade na resolução de problemas complexos.")
            insights.append("Pronto para avançar para níveis de maior complexidade técnica.")
        elif pct >= 70:
            status = "Bom"
            insights.append("Bom aproveitamento geral. Possui bases sólidas nos conceitos centrais.")
            insights.append("Sugestão: focar em detalhes técnicos e minúcias para atingir a excelência.")
        elif pct >= 50:
            status = "Regular"
            insights.append("Aproveitamento limítrofe. Compreendeu os fundamentos, mas apresenta vulnerabilidades conceituais.")
            insights.append("Ação: revisar os tópicos que errou e praticar exercícios complementares.")
        else:
            status = "Precisa de Atenção"
            insights.append("Desempenho abaixo do esperado. Dificuldade severa em conceitos estruturais da disciplina.")
            insights.append("Recomendação: mentoria/plantão de dúvidas e estudo focado desde o básico.")

        feedback_text = (
            f"Olá {student_name}, aqui está sua análise de performance da avaliação '{exam_title}':\n\n"
            f"📊 DESEMPENHO: {status} ({score:.1f}/{total_score:.1f} pontos - {pct:.1f}%)\n"
            f"🎯 TAXA DE ACERTO: {correct_count} de {total_count} questões resolvidas com sucesso.\n\n"
            f"🧠 FEEDBACK DIAGNÓSTICO IA:\n"
            f"- {insights[0]}\n"
            f"- {insights[1]}\n\n"
            f"🏆 Dica gamificada: Continue mantendo seus estudos em dia e suba no ranking da sua turma!"
        )
        
        return feedback_text
