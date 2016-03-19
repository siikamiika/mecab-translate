import xml.etree.ElementTree as ET
import os
import json

KANJIVG = 'client/kanji'
NS = {
    'svg': 'http://www.w3.org/2000/svg',
    'kvg': 'http://kanjivg.tagaini.net'
}

def get_parts(group):
    parts = []
    for g in group.findall('svg:g', NS):
        element = g.attrib.get('{'+NS['kvg']+'}element')
        if element:
            parts.append(element)
        else:
            parts += get_parts(g)
    return parts


def get_info(f):

    kanji = ET.parse(os.path.join(KANJIVG, f)).getroot().find('svg:g', NS).find('svg:g', NS)
    char = kanji.attrib.get('{'+NS['kvg']+'}element')
    parts = get_parts(kanji)
    return char, parts


def main():

    info = dict()

    for f in os.listdir(KANJIVG):
        char, parts = get_info(f)
        if char:
            info[char] = parts

    with open('data/kanjivg_parts.json', 'w', encoding='utf-8') as f:
        json.dump(info, f, ensure_ascii=False)


if __name__ == '__main__':
    main()
