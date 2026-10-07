import os
import sys
import socket
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import webview

def get_base_dir():
    """Get absolute path to resource, works for dev and for PyInstaller bundle."""
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

def find_free_port():
    """Find an available port on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

class StaticWebHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        base_dir = os.path.join(get_base_dir(), 'dist')
        super().__init__(*args, directory=base_dir, **kwargs)

    def log_message(self, format, *args):
        # Suppress logging in production
        pass

def start_local_server(port):
    server = ThreadingHTTPServer(('127.0.0.1', port), StaticWebHandler)
    server.serve_forever()

def main():
    port = find_free_port()
    server_thread = threading.Thread(target=start_local_server, args=(port,), daemon=True)
    server_thread.start()

    app_url = f'http://127.0.0.1:{port}/'
    
    # Create native application window
    window = webview.create_window(
        title='Vòng Quay May Mắn - Wheel of Names',
        url=app_url,
        width=1340,
        height=850,
        min_size=(980, 640),
        resizable=True,
        background_color='#f3eeff'
    )

    webview.start(private_mode=False)

if __name__ == '__main__':
    main()
