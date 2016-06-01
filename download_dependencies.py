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

JMDICT = 'http://ftp.monash.edu.au/pub/nihongo/JMdict_e.gz'
KANJIDIC2 = 'http://www.edrdg.org/kanjidic/kanjidic2.xml.gz'
TATOEBA = 'http://tatoeba.org/files/downloads/wwwjdic.csv'
KANJIVG = 'https://github.com/KanjiVG/kanjivg/releases/download/r20160426/kanjivg-20160426-main.zip'
ANGULAR = 'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js'


def download(url, destination, compression=None):

    try:
        os.makedirs(destination)
    except:
        pass

    print('Downloading', url)
    data = urlopen(url).read()


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


def main():
    download(JMDICT, 'data', 'gz')
    download(KANJIDIC2, 'data', 'gz')
    download(TATOEBA, 'data')
    download(KANJIVG, 'client', 'zip')
    download(ANGULAR, 'client/vendor')


if __name__ == '__main__':
    main()
