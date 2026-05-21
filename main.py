import os
from dotenv import load_dotenv

try:
    from google.genai import Client
    from google.genai import types
except ImportError as exc:
    raise ImportError(
        "google-genai 패키지가 설치되어 있지 않습니다.\n"
        "pip install google-genai\n"
    ) from exc


load_dotenv()


def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "GEMINI_API_KEY 환경 변수가 설정되어 있지 않습니다.\n"
            "Windows PowerShell에서는: $env:GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'"
        )

    client = Client(api_key=api_key)

    model_id = os.environ.get("GEMINI_MODEL", "models/gemini-3.1-pro-preview")
    prompt = os.environ.get("GEMINI_PROMPT", "안녕! 자기소개 좀 해줘.")

    try:
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
        )
    except Exception as exc:
        print("모델 요청 중 오류가 발생했습니다:", exc)
        print("모델 이름이 지원되지 않거나 인증/네트워크 문제일 수 있습니다.")
        # 모델 목록 시도 (API 키가 유효한 경우)
        try:
            print("사용 가능한 모델 목록을 조회합니다...")
            models = client.models.list()
            for m in models:
                # 모델 객체는 .name 또는 .model_id 같은 필드를 가질 수 있음
                name = getattr(m, "name", None) or getattr(m, "model", None) or str(m)
                print(" -", name)
        except Exception:
            print("모델 목록 조회에 실패했습니다. 네트워크 또는 권한을 확인하세요.")
        raise

    print("=== Prompt ===")
    print(prompt)
    print("\n=== Response (debug) ===")
    try:
        print(repr(response))
        # candidates 구조가 있을 수 있으므로 안전하게 출력
        if hasattr(response, 'candidates') and response.candidates:
            for i, cand in enumerate(response.candidates):
                print(f"-- candidate {i} --")
                print(getattr(cand, 'content', cand))
        # 기존 텍스트 필드도 출력
        print('\nresponse.text:')
        print(getattr(response, 'text', None))
    except Exception as e:
        print('응답 디버그 출력 중 오류:', e)


if __name__ == "__main__":
    main()
