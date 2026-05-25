import codecs

with codecs.open('dashboard/dashboard.html', 'r', 'utf-8') as f:
    html = f.read()

html = html.replace('<script src=\"common/js/api/api-dashboard.js\"></script>\\n    <script src=\"common/js/api/api-frontdesk.js\"></script>\\n    <script src=\"common/js/api/api-operations.js\"></script>\\n    <script src=\"common/js/dashboard-dynamic.js\"></script>', '<script src=\"common/js/api/api-dashboard.js\"></script>\n    <script src=\"common/js/api/api-frontdesk.js\"></script>\n    <script src=\"common/js/api/api-operations.js\"></script>\n    <script src=\"common/js/dashboard-dynamic.js\"></script>')

with codecs.open('dashboard/dashboard.html', 'w', 'utf-8') as f:
    f.write(html)
