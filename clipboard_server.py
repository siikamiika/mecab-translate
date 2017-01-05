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

class Clipboard(object):

    def __init__(self):
        self.clients = []
        self.old = ''
        Thread(target=self._watchdog).start()

    def add_client(self, client):
        if client not in self.clients:
            self.clients.append(client)

    def remove_client(self, client):
        if client in self.clients:
            self.clients.remove(client)

    def _watchdog(self):
        while True:
            self._check_clipboard()
            time.sleep(0.2)

    def _check_clipboard(self):
        text = pyperclip.paste()
        if not text or text == self.old:
            return
        for c in self.clients:
            c.write_message(text)
        self.old = text


class ClipboardHandler(websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        clipboard.add_client(self)
        print('{}--> {}'.format(len(clipboard.clients), self.request.remote_ip))

    def on_close(self):
        clipboard.remove_client(self)
        print('{}<-- {}'.format(len(clipboard.clients), self.request.remote_ip))


def get_app():
    return web.Application([
        (r'/', ClipboardHandler),
    ])

if __name__ == '__main__':
    clipboard = Clipboard()
    address, port = (sys.argv[1] if len(sys.argv) > 1 else ':9873').split(':')
    app = get_app()
    app.listen(int(port), address=address)
    main_loop = ioloop.IOLoop.instance()
    print('listening to {}:{}'.format(address, port))
    print('input this host and port to \'WebSocket input\' field in config menu!')
    main_loop.start()
