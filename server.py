#!/usr/bin/env python3

from tornado import web, ioloop
from tornado.log import enable_pretty_logging
from subprocess import check_output
import json
import re

class Edict2(object):

    def __init__(self):

        self.dictfile = open('edict2', 'rb')
        self.line_offset = []
        self.dictionary = dict()
        self._parse()

    def get(self, word):
        word = self.dictionary.get(word)
        if not word:
            return

        lines = [self.line_offset[e] for e in word]

        entries = []
        for pos in lines:
            self.dictfile.seek(pos)
            line = self.dictfile.readline().decode('euc-jp')
            entries.append(self._entry(line))
        return entries

    def _entry(self, line):
        entry = dict(words=[], readings=[], translations=[], common=False)
        jp, eng = line.split('/', 1)

        # words, readings
        if '[' in jp:
            words, readings = jp.split(None, 1)
            entry['readings'] = readings.strip()[1:-1].split(';')
        else:
            words = jp
        entry['words'] = words.strip().split(';')

        # common
        eng = re.sub(r'/EntL\d+X?/$', r'', eng.strip())
        if eng.endswith('/(P)'):
            entry['common'] = True
            eng = eng[:-4]

        # translations
        if re.match(r'(\(.*?\)) \(1\)', eng):
            i = 1
            while True:
                translation = dict()
                # (n) (1) (esp. 例え) example/(2) (esp. 譬え, 喩え) simile/metaphor/allegory/fable/parable
                # |1|-----|        2       |-|                           3                            |
                pos, definition, eng = re.match(
                    r'(?:\((.*?)\) )?\({}\) ' # (n) (1) 
                    r'(.*?)' # (esp. 例え) example
                    r'(?:/(?=(?:\(.*?\) )?\({}\))|$)(.*)'.format(i, i+1), # /(2) (esp. .....
                    eng).groups()
                translation['definition'] = definition
                translation['parts_of_speech'] = pos.split(',') if pos else []
                entry['translations'].append(translation)
                if not eng:
                    break
                i += 1
        else:
            translation = dict()
            pos, definition = re.match(r'\((.*?)\) (.*)', eng).groups()
            entry['translations'].append(
                dict(parts_of_speech=pos.split(','), definition=definition))

        return entry

    def _parse(self):

        print(self.dictfile.readline())

        position = self.dictfile.tell()
        while True:
            line = self.dictfile.readline().decode('euc-jp')
            if not line:
                break
            self.line_offset.append(position)
            position = self.dictfile.tell()

            keys = line.split('/', 1)[0].strip()
            if '[' in keys:
                keys = keys.split(None, 1)
                keys = '{};{}'.format(keys[0], keys[1][1:-1])

            keys = [re.match(r'[^\(]+', k).group(0) for k in keys.split(';')]

            for k in keys:
                if not self.dictionary.get(k):
                    self.dictionary[k] = []
                self.dictionary[k].append(len(self.line_offset) - 1)

        print('dictionary parsed!')


class IndexHandler(web.RequestHandler):

    def get(self):
        self.render('client.html')


class JsHandler(web.RequestHandler):

    def get(self):
        self.render('client.html')


class VeHandler(web.RequestHandler):

    def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        data = data.replace('\n', '')
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
