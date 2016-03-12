from urllib.request import urlopen
import gzip
from zipfile import ZipFile
from io import BytesIO
import os

JMDICT = 'http://ftp.monash.edu.au/pub/nihongo/JMdict_e.gz'
KANJIDIC2 = 'http://www.edrdg.org/kanjidic/kanjidic2.xml.gz'
TATOEBA = 'http://tatoeba.org/files/downloads/wwwjdic.csv'
KANJIVG = 'https://github.com/KanjiVG/kanjivg/releases/download/r20150615-2/kanjivg-20150615-2-main.zip'
ANGULAR = 'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular.min.js'


def download(url, destination, compression=None):

    try:
        os.makedirs(destination)
    except FileExistsError:
        pass

    print('Downloading', url)
    data = urlopen(url).read()


    if compression == 'zip':
        data = ZipFile(BytesIO(data))
        for f in data.infolist():
            data.extract(f, path=destination)

    else:
        filename = os.path.split(url)[-1]
        if compression == 'gz':
            filename = os.path.splitext(filename)[0]
            data = gzip.decompress(data)

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
