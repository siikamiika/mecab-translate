#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import pyperclip
from tornado import websocket, web, ioloop
import time
from threading import Thread
import sys
import os
from itertools import zip_longest

try:
    from tornado.platform.asyncio import AnyThreadEventLoopPolicy
    import asyncio
    asyncio.set_event_loop_policy(AnyThreadEventLoopPolicy())
except:
    pass

if os.name == 'posix':
    pyperclip.set_clipboard('xclip')

clients = []

def remove_repetition(text, n):
    if len(text) % n != 0:
        return text

    output = []
    args = [iter(text)] * n
    for group in zip_longest(*args):
        first_char = group[0]
        output.append(first_char)
        for c in group[1:]:
            if c != first_char:
                return text

    return ''.join(output)

JP_TEXT = (
    (0x3040, 0x309f), # hiragana
    (0x30a0, 0x30ff), # katakana
    (0x4e00, 0x9fcc), # kanji
)

def is_japanese(text):
    pos = 0
    length = len(text)
    while pos < length:
        if not text[pos].strip():
            pos += 1
            continue
        char_code = ord(text[pos])
        for start, end in JP_TEXT:
            if start <= char_code <= end:
                return True
        pos += length // 10 or 1

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
            try:
                self._check_clipboard()
            except Exception as e:
                print(e)
            time.sleep(0.2)

    def _check_clipboard(self):
        text = pyperclip.paste().strip()
        if not is_japanese(text):
            return
        if not text or text == self.old:
            return
        filtered_text = remove_repetition(text, 2)
        for c in clients:
            c.write_message(filtered_text)
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
