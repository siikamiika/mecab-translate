#!/usr/bin/env python3

from tornado import web, ioloop
from tornado.log import enable_pretty_logging
from subprocess import check_output
import json

class Edict2(object):

    def __init__(self):

        self.dictfile = open('edict2', 'rU', encoding='euc-jp')
        self.dictionary = dict()
        self._parse()

    def get(self, word):
        return self.dictionary.get(word)

    def _parse(self):

        print(self.dictfile.readline())

        for line in self.dictfile:

            keys = line.split('/', 1)[0].strip()
            if '[' in keys:
                keys = keys.split(None, 1)
                keys = '{};{}'.format(keys[0], keys[1][1:-1])
            keys = [(k[:-3], True) if k[-3:] == '(P)' else (k, False)
                for k in keys.split(';')]

            # TODO: use (P) somehow
            for key in keys:
                if not self.dictionary.get(key[0]):
                    self.dictionary[key[0]] = []
                self.dictionary[key[0]].append(line)

        self.dictfile.close()


class IndexHandler(web.RequestHandler):

    def get(self):
        self.render('client.html')


class JsHandler(web.RequestHandler):

    def get(self):
        self.render('client.html')


class VeHandler(web.RequestHandler):

    def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        ve_output = check_output(['ruby', 've_json.rb', data])
        self.write(ve_output)


class Edict2Handler(web.RequestHandler):

    def post(self):
        query = json.loads(self.request.body.decode('utf-8'))
        self.write(json.dumps(edict2.get(query)))


def get_app():

    return web.Application([
        (r'/', IndexHandler),
        (r'/ve', VeHandler),
        (r'/edict2', Edict2Handler),
        (r'/static/(.*)', web.StaticFileHandler, {'path': 'static'}),
    ])


if __name__ == '__main__':
    edict2 = Edict2()
    app = get_app()
    app.listen(9874)
    main_loop = ioloop.IOLoop.instance()
    main_loop.start()
