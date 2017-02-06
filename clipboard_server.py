#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import pyperclip
from tornado import websocket, web, ioloop
import time
from threading import Thread
import sys
import os

if os.name == 'posix':
    pyperclip.set_clipboard('xclip')

clients = []

class Clipboard(object):

    def __init__(self):
        self.old = ''
        Thread(target=self._watchdog).start()

    def add_client(self, client):
        if client not in clients:
            clients.append(client)

    def remove_client(self, client):
        if client in clients:
            clients.remove(client)

    def _watchdog(self):
        while True:
            self._check_clipboard()
            time.sleep(0.2)

    def _check_clipboard(self):
        text = pyperclip.paste()
        if not text or text == self.old:
            return
        for c in clients:
            c.write_message(text)
        self.old = text


class ClipboardHandler(websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        clipboard.add_client(self)
        print('{}--> {}'.format(len(clients), self.request.remote_ip))

    def on_close(self):
        clipboard.remove_client(self)
        print('{}<-- {}'.format(len(clients), self.request.remote_ip))

class PostHandler(web.RequestHandler):

    def post(self):
        data = self.request.body.decode(post_encoding, 'ignore').strip()
        for c in clients:
            c.write_message(data)

def get_app():
    return web.Application([
        (r'/', ClipboardHandler),
        (r'/post', PostHandler),
    ])

if __name__ == '__main__':
    clipboard = Clipboard()
    address, port = (sys.argv[1] if len(sys.argv) > 1 else ':9873').split(':')
    post_encoding = 'shift-jis'
    if len(sys.argv) > 2:
        post_encoding = sys.argv[2]
    app = get_app()
    app.listen(int(port), address=address)
    main_loop = ioloop.IOLoop.instance()
    print('listening to {}:{}'.format(address, port))
    print('input this host and port to \'WebSocket input\' field in config menu!')
    main_loop.start()
