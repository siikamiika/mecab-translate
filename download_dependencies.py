#!/usr/bin/env python3
import sys
if sys.version_info[0] == 3:
    from urllib.request import urlopen
    from io import BytesIO as StringIO
elif sys.version_info[0] == 2:
    from urllib2 import urlopen
    from StringIO import StringIO
import zlib
from zipfile import ZipFile
import os

MONASH_MIRRORS = [
    'http://ftp.monash.edu.au/pub/nihongo/',
    'ftp://ftp.uni-duisburg.de/Mirrors/ftp.monash.edu.au/pub/nihongo/',
    'ftp://ftp.monash.edu.au/pub/nihongo/'
]

MONASH = None
for m in MONASH_MIRRORS:
    try:
        print('Testing {}...'.format(m))
        urlopen(m + '00INDEX.html').read()
        MONASH = m
        print('Success! Using {} as monash ftp provider'.format(m))
        break
    except:
        print('Failed.')
else:
    print('All monash mirrors failed. Skipping JMdict_e.gz, kanjidic2.xml.gz and radkfile.gz')

JMDICT = 'JMdict_e.gz'
KANJIDIC2 = 'kanjidic2.xml.gz'
RADKFILE = 'radkfile.gz'
TATOEBA = 'http://tatoeba.org/files/downloads/wwwjdic.csv'
KANJIVG = 'https://github.com/KanjiVG/kanjivg/releases/download/r20160426/kanjivg-20160426-main.zip'
ANGULAR = 'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js'
UNIDIC_MECAB_TRANSLATE = 'https://github.com/siikamiika/unidic-mecab-translate/releases/download/1.2/unidic-mecab-translate-1.2.zip'
SIMILAR_KANJI = 'https://raw.githubusercontent.com/siikamiika/similar-kanji/master/kanji.tgz_similars.ut8'


def download(url, destination, compression=None):

    try:
        os.makedirs(destination)
    except:
        pass

    print('Downloading {}...'.format(url))
    try:
        data = urlopen(url).read()
    except:
        print('Failed, skipping')
        return


    if compression == 'zip':
        data = ZipFile(StringIO(data))
        for f in data.infolist():
            data.extract(f, path=destination)

    else:
        filename = os.path.split(url)[-1]
        if compression == 'gz':
            filename = os.path.splitext(filename)[0]
            data = zlib.decompress(data, 16+zlib.MAX_WBITS)

        with open(os.path.join(destination, filename), 'wb') as f:
            f.write(data)

    print('Success!')


def main():
    if MONASH:
        download(MONASH + JMDICT, 'data', 'gz')
        download(MONASH + KANJIDIC2, 'data', 'gz')
        download(MONASH + RADKFILE, 'data', 'gz')
    download(TATOEBA, 'data')
    download(KANJIVG, 'client', 'zip')
    download(ANGULAR, 'client/vendor')
    download(UNIDIC_MECAB_TRANSLATE, 'data', 'zip')
    download(SIMILAR_KANJI, 'data')


if __name__ == '__main__':
    main()
