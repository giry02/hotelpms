import os
from dotenv import load_dotenv
from openclaw import OpenClaw


load_dotenv()


def main():
    api_key = os.getenv('CMDOP_API_KEY') or os.getenv('OPENCLAW_API_KEY')
    print('Using API key set:', bool(api_key))
    if not api_key:
        print('OpenClaw 실행 중 오류: CMDOP_API_KEY 또는 OPENCLAW_API_KEY가 설정되어 있지 않습니다.')
        print('`.env` 파일에 다음 항목을 추가하거나 PowerShell에서 환경 변수를 설정하십시오:')
        print('CMDOP_API_KEY=당신의_CMDOP_API_KEY_값')
        return

    try:
        client = OpenClaw.remote(api_key=api_key)
        print('OpenClaw client created:', client)
    except Exception as e:
        print('OpenClaw 실행 중 오류:', e)


if __name__ == '__main__':
    main()
