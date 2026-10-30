"""
=============================================================================
Student Details:
Name: Pranjali Nitin Bharsakale | PRN: 1251070295 | Roll No: 2
Course: Discrete Mathematics
Project Title: Graph-Theoretic Exam Seating Arrangement: Minimising Adjacent Conflicts Using Graph Colouring
=============================================================================

File: server.py
Description: Lightweight local HTTP server using the Python 3 Standard Library
             (no pip packages required). Serves the interactive web UI and
             automatically opens it in the default web browser.
=============================================================================
"""

import http.server
import socketserver
import webbrowser
import os
import sys

DEFAULT_PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean, minimal console logging
        sys.stdout.write(f"[Web Server] {self.address_string()} - {format % args}\n")


def start_server(port=DEFAULT_PORT):
    os.chdir(DIRECTORY)
    
    # Try preferred port, or fall back to alternative if busy
    server_address = ("", port)
    try:
        httpd = socketserver.TCPServer(server_address, CustomHTTPRequestHandler)
    except OSError:
        port = port + 1
        server_address = ("", port)
        httpd = socketserver.TCPServer(server_address, CustomHTTPRequestHandler)

    url = f"http://localhost:{port}"
    border = "=" * 76
    print(border)
    print("  DISCRETE MATHEMATICS EXAM SEATING OPTIMIZER - WEB UI SERVER")
    print("  Student: Pranjali Nitin Bharsakale | PRN: 1251070295 | Roll No: 2")
    print("-" * 76)
    print(f"  Web application successfully launched!")
    print(f"  URL: {url}")
    print("  Press Ctrl+C in this terminal window to stop the server.")
    print(border)
    print()

    # Automatically open the web browser
    webbrowser.open(url)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Web Server] Server shutting down gracefully.")
        httpd.server_close()


if __name__ == "__main__":
    start_server()
