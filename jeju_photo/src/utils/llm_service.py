import openai
import base64

def multimodal_rag(query, image_path):
    with open(image_path, "rb") as image_file:
        image_bytes = image_file.read()

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


query = "{커플여행}이 이미지 속의 인물은 무엇을 하고 있는지 아름다운 제주 여행 모드로 표현해줘."
print('제주 여행 모드 === ', multimodal_rag(query, "./data/7.jpg"))

query = "이 이미지 속의 인물은 무엇을 하고 있는지 왕자님 주인공 모드로 표현해줘."
print('왕자님 모드 === ', multimodal_rag(query, "./data/7.jpg"))

query = "이 이미지 속의 인물은 무엇을 하고 있는지 외로운 솔로 여행 모드로 표현해줘."
print('솔로 여행 모드 === ', multimodal_rag(query, "./data/7.jpg"))

query = "이 이미지 속의 인물이 여행을 하며 느낄 감정을 재밌게 제주도 방언으로 표현해줘."
print('제주 방언 모드 === ', multimodal_rag(query, "./data/7.jpg"))