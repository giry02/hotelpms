import json
import os

logs = [
    r'C:\Users\Giry\.gemini\antigravity\brain\85eb2b7f-ad19-47b2-ba6a-997d322f144d\.system_generated\logs\transcript.jsonl',
    r'C:\Users\Giry\.gemini\antigravity\brain\54def4f8-8bc1-490e-b08a-49a17fdaed38\.system_generated\logs\transcript.jsonl'
]

targets = [
    r'E:\AI_Project\Hotel_PMS\dashboard\settings\billing.html',
    r'E:\AI_Project\Hotel_PMS\dashboard\settings\notices.html',
    r'E:\AI_Project\Hotel_PMS\dashboard\settings\support.html'
]

found = {}

for log in logs:
    if not os.path.exists(log): continue
    with open(log, 'r', encoding='utf-8') as f:
        for line in f:
            if 'write_to_file' in line:
                try:
                    data = json.loads(line)
                    if 'tool_calls' in data:
                        for call in data['tool_calls']:
                            # It could be formatted in different ways depending on the version
                            args = call.get('function', {}).get('arguments', '')
                            if isinstance(args, str):
                                try:
                                    args = json.loads(args)
                                except:
                                    pass
                            
                            if not isinstance(args, dict):
                                # maybe it's under 'args' directly?
                                args = call.get('args', {})
                            
                            target_file = args.get('TargetFile', '')
                            code_content = args.get('CodeContent', '')
                            
                            if target_file and code_content:
                                # Normalize path
                                tf = os.path.normpath(target_file)
                                for t in targets:
                                    if t == tf:
                                        found[t] = code_content
                except Exception as e:
                    pass

for t in targets:
    if t in found:
        with open(t, 'w', encoding='utf-8') as f:
            f.write(found[t])
        print(f"Successfully restored {os.path.basename(t)} from transcripts!")
    else:
        print(f"Could not find original content for {os.path.basename(t)}")
