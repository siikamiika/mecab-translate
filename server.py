#!/usr/bin/env python3

from tornado import web, ioloop
from tornado.log import enable_pretty_logging; enable_pretty_logging()
from subprocess import PIPE, Popen
import json
import xml.etree.ElementTree as ET
import re
from queue import Queue
from threading import Thread
import time

class Mecab(object):

    def __init__(self):

        self.process = Popen(["mecab"], stdout=PIPE, stdin=PIPE, bufsize=1)
        self.output = Queue()
        self.t = Thread(target=self._handle_stdout)
        self.t.daemon = True
        self.t.start()


    def analyze(self, text):

        self.process.stdin.write((text + '\n').encode('utf-8'))
        self.process.stdin.flush()

        result = []
        while True:
            line = self.output.get()
            if line == 'EOS':
                break

            try:
                part = dict()
                part['literal'], line = line.split('\t')
                part.update(zip(['pos', 'pos2', 'pos3', 'pos4', 'inflection_type',
                    'inflection_form', 'lemma', 'reading', 'hatsuon'],
                    line.split(',')))
            except Exception as e:
                print(e)
            result.append(part)
        return result


    def _handle_stdout(self):

        for line in iter(self.process.stdout.readline, b''):
            self.output.put(line.decode().strip())
        self.process.stdout.close()



class Edict2(object):

    def __init__(self):

        self.dictfile = open('data/edict2', 'rb')
        self.line_offset = []
        self.dictionary = dict()
        self._parse()


    def get(self, word):

        word = self.dictionary.get(word)
        if not word:
            return []

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

        print('edict2 parsed!')



class JMdict_e(object):

    def __init__(self):

        self.dictfile = open('data/JMdict_e', 'rb')
        self.dictionary = dict()
        self.entities = dict()
        self._parse()


    def get(self, word):

        return [self._entry(e) for e in self.dictionary.get(word) or []]


    def _entry(self, entry):

        ent = self.entities

        entry_obj = dict(words=[], readings=[], translations=[])

        position, length = entry

        self.dictfile.seek(position)
        entry = self.dictfile.read(length)
        jmdict_entity = '|'.join(map(re.escape, ent)).encode('utf-8')
        entry = re.sub(b'&('+jmdict_entity+b');', b'\\1', entry)
        entry = ET.fromstring(entry)

        for k_ele in entry.iter('k_ele'):
            word = dict(inf=[], pri=[])
            word['text'] = k_ele.find('keb').text

            for ke_inf in k_ele.iter('ke_inf'):
                word['inf'].append([ke_inf.text, ent[ke_inf.text]])
            for ke_pri in k_ele.iter('ke_pri'):
                word['pri'].append(ke_pri.text)

            entry_obj['words'].append(word)

        for r_ele in entry.iter('r_ele'):
            reading = dict(inf=[], pri=[], restr=[], nokanji=False)
            reading['text'] = r_ele.find('reb').text

            for re_inf in r_ele.iter('re_inf'):
                reading['inf'].append([re_inf.text, ent[re_inf.text]])
            for re_pri in r_ele.iter('re_pri'):
                reading['pri'].append(re_pri.text)
            for re_restr in r_ele.iter('re_restr'):
                reading['restr'].append(re_restr.text)
            if r_ele.find('re_nokanji') is not None:
                reading['nokanji'] = True

            entry_obj['readings'].append(reading)

        for sense in entry.iter('sense'):
            def _get_tags(name):
                return [t.text for t in sense.iter(name)]

            translation = dict(
                gloss=_get_tags('gloss'),
                stagk=_get_tags('stagk'),
                stagr=_get_tags('stagr'),
                pos=[[pos, ent[pos]] for pos in _get_tags('pos')],
                xref=_get_tags('xref'),
                ant=_get_tags('ant'),
                field=[[field, ent[field]] for field in _get_tags('field')],
                misc=[[misc, ent[misc]] for misc in _get_tags('misc')],
                s_inf=_get_tags('s_inf'),
                lsource=[[ls.attrib.get('{http://www.w3.org/XML/1998/namespace}lang') or 'eng', ls.text]
                    for ls in sense.iter('lsource')],
                dial=[[dial, ent[dial]] for dial in _get_tags('dial')],
            )

            entry_obj['translations'].append(translation)

        return entry_obj


    def _parse(self):

        print('parsing JMdict_e...')
        start = time.time()

        inside_jmdict = False
        inside_entry = False
        entry_keys = []
        entry_start = 0

        while True:
            line = self.dictfile.readline()
            if not line:
                break

            if not inside_jmdict:
                if line.startswith(b'<!ENTITY'):
                    line = line.decode('utf-8')
                    key, value = re.match('<!ENTITY (.*?) "(.*?)"', line).groups()
                    self.entities[key] = value
                if line == b'<JMdict>\n':
                    inside_jmdict = True
                continue

            if not inside_entry:
                if line == b'<entry>\n':
                    inside_entry = True
                    entry_start = self.dictfile.tell() - len(line)
                continue

            if line[2:5] == b'eb>':
                entry_keys.append(line[5:-7].decode('utf-8'))
                continue

            if line == b'</entry>\n':
                inside_entry = False
                entry_position = (entry_start, self.dictfile.tell() - entry_start)

                for k in entry_keys:
                    if not self.dictionary.get(k):
                        self.dictionary[k] = []
                    self.dictionary[k].append(entry_position)

                entry_keys = []

        print('    parsed in {:.2f} s'.format(time.time() - start))



class Kanjidic2(object):

    def __init__(self):

        self.dicfile = open('data/kanjidic2.xml', 'rb')
        self.dic = dict()
        self._parse()


    def get(self, kanji):

        dic_entry = self.dic.get(kanji)
        if not dic_entry:
            return

        entry = dict(literal=kanji, on=[], kun=[], nanori=[], meaning=[])

        position, length = dic_entry

        self.dicfile.seek(position)
        character = self.dicfile.read(length)
        character = ET.fromstring(character)

        # stroke count, frequency
        misc = character.find('misc')

        stroke_count = misc.find('stroke_count')
        if stroke_count is not None:
            stroke_count = int(stroke_count.text)
        entry['stroke_count'] = stroke_count

        freq = misc.find('freq')
        if freq is not None:
            freq = int(freq.text)
        entry['freq'] = freq

        reading_meaning = character.find('reading_meaning')
        if not reading_meaning:
            return
        rmgroup = reading_meaning.find('rmgroup')
        # meaning
        for meaning in rmgroup.iter('meaning'):
            if meaning.get('m_lang') and meaning.get('m_lang') != 'en':
                continue
            entry['meaning'].append(meaning.text)
        # reading
        for reading in rmgroup.iter('reading'):
            r_type = reading.get('r_type')
            if r_type == 'ja_on':
                entry['on'].append(reading.text)
            if r_type == 'ja_kun':
                entry['kun'].append(reading.text)
        # nanori
        for nanori in reading_meaning.iter('nanori'):
            entry['nanori'].append(nanori.text)

        return entry


    def _parse(self):

        print('parsing kanjidic2...')
        start = time.time()

        inside_character = False
        literal = None
        character_start = 0

        while True:
            line = self.dicfile.readline()
            if not line:
                break

            if not inside_character:
                if line == b'<character>\n':
                    inside_character = True
                    character_start = self.dicfile.tell() - len(line)
                    literal = self.dicfile.readline()[9:-11].decode('utf-8')
                continue

            if line == b'</character>\n':
                inside_character = False
                character_position = (character_start, self.dicfile.tell() - character_start)
                self.dic[literal] = character_position

        print('    parsed in {:.2f} s'.format(time.time() - start))



class MecabHandler(web.RequestHandler):

    def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        data = data.replace('\n', '')
        self.write(json.dumps(mecab.analyze(data)))



class Edict2Handler(web.RequestHandler):

    def post(self):
        query = json.loads(self.request.body.decode('utf-8'))
        self.write(json.dumps(edict2.get(query)))



class JMdict_eHandler(web.RequestHandler):

    def post(self):
        query = json.loads(self.request.body.decode('utf-8'))
        self.write(json.dumps(jmdict_e.get(query)))



class Kanjidic2Handler(web.RequestHandler):

    def post(self):
        query = json.loads(self.request.body.decode('utf-8'))
        self.write(json.dumps(kanjidic2.get(query)))



def get_app():

    return web.Application([
        (r'/mecab', MecabHandler),
        #(r'/edict2', Edict2Handler),
        (r'/jmdict_e', JMdict_eHandler),
        (r'/kanjidic2', Kanjidic2Handler),
        (r'/(.*)', web.StaticFileHandler,
            {'path': 'client', 'default_filename': 'index.html'}),
    ])



if __name__ == '__main__':
    mecab = Mecab()
    #edict2 = Edict2()
    jmdict_e = JMdict_e()
    kanjidic2 = Kanjidic2()
    app = get_app()
    app.listen(9874)
    main_loop = ioloop.IOLoop.instance()
    print('done!')
    print('server listening to *:9874')
    main_loop.start()
