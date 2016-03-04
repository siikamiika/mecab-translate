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
import pickle

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

        dictfile = 'data/JMdict_e'
        picklefile = dictfile + '.pickle'

        try:
            print('loading JMdict_e.pickle...')
            start = time.time()
            self.dictionary = pickle.load(open(picklefile, 'rb'))
            print('    loaded in {:.2f} s'.format(time.time() - start))
        except FileNotFoundError:
            print('JMdict_e.pickle not found!')
            self.jmdict = ET.iterparse(dictfile)
            self.dictionary = dict()
            self._parse()
            del self.jmdict
            pickle.dump(self.dictionary, open(picklefile, 'wb'))


    def get(self, word):

        return [self._entry(e) for e in self.dictionary.get(word) or []]


    def _entry(self, entry):

        entry_obj = dict(words=[], readings=[], translations=[])

        entry = ET.fromstring(entry)

        for k_ele in entry.iter('k_ele'):
            word = dict(inf=[], pri=[])
            word['text'] = k_ele.find('keb').text

            for ke_inf in k_ele.iter('ke_inf'):
                word['inf'].append(ke_inf.text)
            for ke_pri in k_ele.iter('ke_pri'):
                word['pri'].append(ke_pri.text)

            entry_obj['words'].append(word)

        for r_ele in entry.iter('r_ele'):
            reading = dict(inf=[], pri=[], restr=[], nokanji=False)
            reading['text'] = r_ele.find('reb').text

            for re_inf in r_ele.iter('re_inf'):
                reading['inf'].append(re_inf.text)
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
                pos=_get_tags('pos'),
                xref=_get_tags('xref'),
                ant=_get_tags('ant'),
                field=_get_tags('field'),
                misc=_get_tags('misc'),
                s_inf=_get_tags('s_inf'),
                lsource=[[ls.attrib['{http://www.w3.org/XML/1998/namespace}lang'], ls.text]
                    for ls in sense.iter('lsource')],
                dial=_get_tags('dial'),
            )

            entry_obj['translations'].append(translation)

        return entry_obj


    def _parse(self):

        print('parsing JMdict_e...')
        start = time.time()

        for _, entry in self.jmdict:

            if entry.tag != 'entry':
                continue

            keys = []

            for k_ele in entry.iter('k_ele'):
                keys.append(k_ele.find('keb').text)

            for r_ele in entry.iter('r_ele'):
                keys.append(r_ele.find('reb').text)

            entry_str = ET.tostring(entry, encoding='utf-8')
            entry.clear()

            for k in keys:
                if not self.dictionary.get(k):
                    self.dictionary[k] = []
                self.dictionary[k].append(entry_str)

        print('    parsed in {:.2f} s'.format(time.time() - start))



class Kanjidic2(object):

    def __init__(self):

        print('parsing kanjidic2...')
        start = time.time()
        self.root = ET.parse('data/kanjidic2.xml').getroot()
        self.dic = dict()
        self._parse()
        del(self.root)
        print('    parsed in {:.2f} s'.format(time.time() - start))


    def get(self, kanji):

        return self.dic.get(kanji)


    def _parse(self):

        for character in self.root.iter('character'):

            literal = character.find('literal').text

            entry = dict(literal=literal, on=[], kun=[], nanori=[], meaning=[])

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
                continue
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

            self.dic[literal] = entry



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
