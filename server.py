#!/usr/bin/env python3
"""
YTMonetization — Local API Server
Serves static files + stores orders/plans in JSON files
so iPhone orders show up in PC admin panel.
"""
import json, os, sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

PORT        = 3000
ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'data_orders.json')
PLANS_FILE  = os.path.join(os.path.dirname(__file__), 'data_plans.json')

def read_json(path, default):
    try:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f'[read_json] {e}')
    return default

def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

class Handler(SimpleHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin',  '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/orders':
            self._json(200, read_json(ORDERS_FILE, []))
        elif path == '/api/plans':
            data = read_json(PLANS_FILE, None)
            self._json(200, {'plans': data})
        else:
            super().do_GET()

    def do_POST(self):
        path   = urlparse(self.path).path
        length = int(self.headers.get('Content-Length', 0))
        try:
            body = json.loads(self.rfile.read(length))
        except Exception:
            self._json(400, {'error': 'invalid json'}); return

        if path == '/api/orders':
            orders = read_json(ORDERS_FILE, [])
            # avoid duplicates
            ids = {o.get('id') for o in orders}
            if body.get('id') not in ids:
                orders.insert(0, body)
                write_json(ORDERS_FILE, orders)
            self._json(200, {'ok': True})

        elif path == '/api/plans':
            write_json(PLANS_FILE, body)
            self._json(200, {'ok': True})

        else:
            self._json(404, {'error': 'not found'})

    def _json(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type',   'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print(f'  {self.address_string()}  {fmt % args}')

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    srv = HTTPServer(('0.0.0.0', PORT), Handler)
    print(f'\nYTMonetization server running at http://0.0.0.0:{PORT}')
    print(f'   iPhone / LAN access: http://192.168.10.139:{PORT}\n')
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
        sys.exit(0)
