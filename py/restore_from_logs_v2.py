import json
import os
import ast

logs = [
    r'C:\Users\Giry\.gemini\antigravity\brain\85eb2b7f-ad19-47b2-ba6a-997d322f144d\.system_generated\logs\transcript.jsonl',
    r'C:\Users\Giry\.gemini\antigravity\brain\54def4f8-8bc1-490e-b08a-49a17fdaed38\.system_generated\logs\transcript.jsonl'
]

targets = {
    'billing.html': r'E:\AI_Project\Hotel_PMS\dashboard\settings\billing.html',
    'notices.html': r'E:\AI_Project\Hotel_PMS\dashboard\settings\notices.html',
    'support.html': r'E:\AI_Project\Hotel_PMS\dashboard\settings\support.html'
}

found = {
    'billing.html': '',
    'notices.html': '',
    'support.html': ''
}

for log in logs:
    if not os.path.exists(log): continue
    with open(log, 'r', encoding='utf-8') as f:
        for line in f:
            if 'write_to_file' in line or 'replace_file_content' in line:
                try:
                    data = json.loads(line)
                    for call in data.get('tool_calls', []):
                        name = call.get('name')
                        if name in ['write_to_file', 'replace_file_content']:
                            args = call.get('args', {})
                            if isinstance(args, str):
                                try:
                                    args = json.loads(args)
                                except:
                                    continue
                            
                            target_file_str = args.get('TargetFile', '')
                            # If it's a JSON string like "\"E:\\...\"", decode it
                            if isinstance(target_file_str, str) and target_file_str.startswith('"'):
                                try: target_file_str = json.loads(target_file_str)
                                except: pass
                            
                            if not target_file_str: continue
                            
                            content_str = args.get('CodeContent', '') or args.get('ReplacementContent', '')
                            if isinstance(content_str, str) and content_str.startswith('"'):
                                try: content_str = json.loads(content_str)
                                except: pass
                            
                            for k, t in targets.items():
                                if k in target_file_str or os.path.normpath(t) == os.path.normpath(target_file_str):
                                    # Keep the longest content found!
                                    if len(content_str) > len(found[k]):
                                        found[k] = content_str
                except Exception as e:
                    pass

for k, t in targets.items():
    if found[k]:
        with open(t, 'w', encoding='utf-8') as f:
            f.write(found[k])
        print(f"Restored {k} from logs! Size: {len(found[k])} chars")
    else:
        print(f"Could not find valid code for {k}")
