import http.server
import socketserver
import os
import sys

PORTS = [3000, 3001, 5000, 5500, 8000, 8081, 8082, 8888]

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    for port in PORTS:
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print(f"Calcify suite running at: http://localhost:{port}")
                httpd.serve_forever()
        except OSError:
            print(f"Port {port} in use, trying next...")
            continue

if __name__ == '__main__':
    run_server()
