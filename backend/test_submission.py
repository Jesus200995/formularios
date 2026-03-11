import requests
import json

# Test form submission
url = "https://apidata.geodatos.com.mx/api/submissions/forms/5"
data = {
    "answers": [
        {
            "question_id": 11,
            "value_text": "Juan Perez",
            "repeat_index": 0
        },
        {
            "question_id": 12,
            "value_text": "juan@test.com",
            "repeat_index": 0
        },
        {
            "question_id": 13,
            "value_text": "excelente",
            "repeat_index": 0
        }
    ],
    "status": "completed"
}

response = requests.post(url, json=data, headers={"Content-Type": "application/json"})
print(f"Status Code: {response.status_code}")
if response.status_code == 201:
    print("Respuesta guardada correctamente!")
    result = response.json()
    print(f"Submission ID: {result['id']}")
    print(f"Answers count: {len(result.get('answers', []))}")
else:
    print(f"Error: {response.text}")
