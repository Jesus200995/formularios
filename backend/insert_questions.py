import psycopg2
import json

conn = psycopg2.connect(
    dbname="formularios",
    user="jesus",
    password="2025",
    host="localhost"
)
cur = conn.cursor()

questions = [
    (5, "TEXT", "Nombre completo", "Ingresa tu nombre", "Juan Perez", True, 0),
    (5, "EMAIL", "Correo electronico", "Tu email", "correo@ejemplo.com", True, 1),
    (5, "SELECT_ONE", "Calificacion", "Como calificas?", "", True, 2),
    (5, "TEXTAREA", "Comentarios", "Tus comentarios", "", False, 3)
]

for q in questions:
    cur.execute(
        'INSERT INTO questions (form_id, question_type, label, description, placeholder, required, "order", options, validation, skip_logic, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())',
        (q[0], q[1], q[2], q[3], q[4], q[5], q[6], json.dumps([]), json.dumps({}), json.dumps({}))
    )

# Add options to select_one question
options = [
    {"value": "excelente", "label": "Excelente"},
    {"value": "bueno", "label": "Bueno"},
    {"value": "regular", "label": "Regular"}
]
cur.execute(
    'UPDATE questions SET options = %s WHERE form_id = 5 AND question_type = %s',
    (json.dumps(options), "SELECT_ONE")
)

conn.commit()
print("Preguntas insertadas correctamente")
cur.close()
conn.close()
