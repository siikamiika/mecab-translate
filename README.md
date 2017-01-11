# mecab-translate

Make sense of Japanese text with minimal effort and learn kanji in the process. Uses [MeCab](https://github.com/taku910/mecab) to break the input to words, allowing their dictionary form to be looked up from [JMDict](http://www.edrdg.org/jmdict/j_jmdict.html). Kanji information is provided by [KANJIDIC2](http://www.edrdg.org/kanjidic/kanjd2index.html) and [KanjiVG](http://kanjivg.tagaini.net/). Text-to-speech is also available.

## Requirements

### Back-end

* Tested on Windows XP, Windows 7, Linux, should work on Mac as well
* [Python](https://www.python.org/downloads/) 2 or 3
* [MeCab](https://github.com/taku910/mecab)
* (recommended if Windows) some SAPI5 text-to-speech engine that can speak Japanese. [ResponsiveVoice](http://responsivevoice.org/) can be used as well, though.

### Front-end

* A modern web browser (Blink-based browsers should work better with SVG)
* Mouse highly recommended, but touch devices should work to some extent

## Deployment

    git clone https://github.com/siikamiika/mecab-translate
    cd mecab-translate
    pip install --upgrade tornado pypiwin32 # omit pypiwin32 if you aren't on Windows or you plan not to use SAPI5 based text-to-speech
    ./download_dependencies.py
    # read below first
    ./server.py

On Windows, mecab.exe must be set available in PATH. Linux package managers should do this by default.

## Use

Nothing yet!
