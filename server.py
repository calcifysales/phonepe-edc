import http.server
import socketserver
import os
import sys

PORTS = [5000, 5001, 8085, 8086, 3000, 3001, 8080]

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    for port in PORTS:
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print(f"Calcify (No UPI) running at: http://localhost:{port}")
                httpd.serve_forever()
        except OSError:
            continue

if __name__ == '__main__':
    run_server()
