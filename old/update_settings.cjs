const fs = require('fs');

const path = 'dashboard/settings/settings.html';
let content = fs.readFileSync(path, 'utf8');

const regex = /<div class="form-group full" style="display: flex; flex-direction: column; height: 100%;">[\s\S]*?<\/textarea>\s*<\/div>\s*<\/div>/;

const newHTML = `<style>
.lang-btn { padding: 8px 16px; border: 1px solid var(--border); border-radius: 6px; background: #fff; color: var(--txt2); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.lang-btn.active { background: var(--primary-lt); color: var(--primary); border-color: var(--primary); }
</style>
                            <div class="form-group full">
                                <label class="form-label" data-i18n-key="Default Multilingual Settings">기본다국어 설정</label>
                                <div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap;">
                                    <button type="button" class="lang-btn active" onclick="this.classList.toggle('active')">한국어 (KO)</button>
                                    <button type="button" class="lang-btn active" onclick="this.classList.toggle('active')">English (EN)</button>
                                    <button type="button" class="lang-btn" onclick="this.classList.toggle('active')">日本語 (JA)</button>
                                    <button type="button" class="lang-btn" onclick="this.classList.toggle('active')">简体中文 (ZH)</button>
                                    <button type="button" class="lang-btn" onclick="this.classList.toggle('active')">Tiếng Việt (VI)</button>
                                </div>
                            </div>`;

content = content.replace(regex, newHTML);
fs.writeFileSync(path, content);
console.log('settings.html updated with language toggle buttons.');
