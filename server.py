import http.server
import socketserver
import os
import sys
import webbrowser

PORTS = [5500, 5001, 5002, 8080, 8085, 3000, 3001, 5000]

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    
    for port in PORTS:
        try:
            with socketserver.TCPServer(("127.0.0.1", port), Handler) as httpd:
                url = f"http://localhost:{port}"
                print(f"Calcify (With UPI QR Generator) running at: {url}", flush=True)
                if "--open" in sys.argv or "-o" in sys.argv:
                    webbrowser.open(url)
                httpd.serve_forever()
        except OSError:
            continue

if __name__ == '__main__':
    run_server()
