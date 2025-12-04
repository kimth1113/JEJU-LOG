import os
import openai
import base64
from dotenv import load_dotenv # .env 파일 로드용 (pip install python-dotenv 필요)

# 환경 변수 로드 및 API 키 설정 (보안 강화)
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY") 

def multimodal_rag(query, image_path):
    """
    이미지 경로와 쿼리를 받아 GPT-4o 모델을 호출하고 응답을 반환합니다.
    """
    try:
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()
    except FileNotFoundError:
        return f"Error: Image file not found at {image_path}"

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": query},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": "data:image/png;base64," +
                                   base64.b64encode(image_bytes).decode("utf-8")
                        }
                    }
                ]
            }
        ]
    )

    return response.choices[0].message.content