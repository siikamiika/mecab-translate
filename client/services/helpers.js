angular.module('mecab-translate')
.factory('Helpers', function($http) {

    var mecabPos = {
        MEISHI: '名詞',
        KOYUUMEISHI: '固有名詞',
        DAIMEISHI: '代名詞',
        JODOUSHI: '助動詞',
        KAZU: '数',
        JOSHI: '助詞',
        SETTOUSHI: '接頭詞',
        SETTOUJI: '接頭辞',
        DOUSHI: '動詞',
        KIGOU: '記号',
        HOJOKIGOU: '補助記号',
        FIRAA: 'フィラー',
        SONOTA: 'その他',
        KANDOUSHI: '感動詞',
        RENTAISHI: '連体詞',
        SETSUZOKUSHI: '接続詞',
        FUKUSHI: '副詞',
        SETSUZOKUJOSHI: '接続助詞',
        SETSUBIJI: '接尾辞',
        KEIYOUSHI: '形容詞',
        KEIJOUSHI: '形状詞'
    }

    var mecabInfoTranslation = {
        'inflection_type': {
            // unidic
            'カ行変格': 'irreg. kuru',
            'サ行変格': 'irreg. suru',
            '上一段': 'ichidan',
            '下一段': 'ichidan',
            '五段': 'godan',
            '助動詞': 'aux',
            '形容詞': 'i-adj',
            '文語カ行変格': 'lit. irreg. kuru',
            '文語サ行変格': 'lit. irreg. suru/su',
            '文語ナ行変格': 'lit. irreg. nu',
            '文語ラ行変格': 'lit. irreg. ru',
            '文語上一段': 'lit. ichidan',
            '文語上二段': 'lit. nidan',
            '文語下一段': 'lit. ichidan',
            '文語下二段': 'lit. nidan',
            '文語助動詞': 'lit. aux',
            '文語四段': 'lit. yodan',
            '文語形容詞': 'lit. i-adj',
            '無変化型': 'non-inflecting'
        },
        'inflection_form': {
            // unidic
            'ク語法': 'ku-noun',
            '仮定形': 'hypothetical',
            '命令形': 'imperative',
            '已然形': 'realis',
            '意志推量形': 'volitional',
            '未然形': 'irrealis',
            '終止形': 'terminal',
            '語幹': 'stem',
            '連体形': 'attributive',
            '連用形': 'continuative'
        },
        'pos': {
            // unidic
            '代名詞': 'pronoun',
            '副詞': 'adverb',
            '助動詞': 'aux. verb',
            '助詞': 'particle',
            '動詞': 'verb',
            '名詞': 'noun',
            '形容詞': 'i-adjective',
            '形状詞': 'na-adjective',
            '感動詞': 'interjection',
            '接尾辞': 'suffix',
            '接続詞': 'conjunction',
            '接頭辞': 'prefix',
            '空白': ' ',
            '補助記号': 'symbol',
            '記号': 'symbol',
            '連体詞': 'determiner'
        },
        'pos2': {
            // unidic
            'タリ': 'classical tari',
            'フィラー': 'filler',
            '一般': 'ordinary',
            '係助詞': 'binding',
            '副助詞': 'adverbial',
            '助動詞語幹': 'aux. stem',
            '動詞的': 'verbal',
            '句点': 'period',
            '名詞的': 'substantive',
            '固有名詞': 'proper',
            '形容詞的': 'adjectival',
            '形状詞的': 'adjectival',
            '括弧閉': 'closing bracket',
            '括弧開': 'opening bracket',
            '接続助詞': 'conjunctive',
            '数詞': 'numeral',
            '文字': 'character',
            '普通名詞': 'common',
            '格助詞': 'case',
            '準体助詞': 'acts on the whole phrase',
            '終助詞': 'final',
            '読点': 'comma',
            '非自立可能': 'non-independent?',
            'ＡＡ': ''
        },
        'pos3': {
            // unidic
            'サ変可能': 'irreg. suru/su?',
            'サ変形状詞可能': 'irreg. suru/su adj.?',
            '一般': 'ordinary',
            '人名': 'person\'s name',
            '副詞可能': 'adverb?',
            '助数詞': 'counter',
            '助数詞可能': 'counter?',
            '地名': 'place name',
            '形状詞可能': 'adjective?',
            '顔文字': 'emoticon'
        },
        'pos4': {
            // unidic
            '一般': 'ordinary',
            '名': 'given',
            '国': 'country',
            '姓': 'family'
        }
    }

    var mecabToEdictPos = {};
    mecabToEdictPos[mecabPos.JOSHI] = ['prt', 'aux'];
    mecabToEdictPos[mecabPos.JODOUSHI] = ['aux-v', 'aux-adj'];
    mecabToEdictPos[mecabPos.SETSUBIJI] = ['suf', 'n-suf'];
    mecabToEdictPos[mecabPos.SETTOUJI] = ['pref'];
    mecabToEdictPos[mecabPos.SETTOUSHI] = ['pref'];
    mecabToEdictPos[mecabPos.KANDOUSHI] = ['int'];
    mecabToEdictPos[mecabPos.SETSUZOKUSHI] = ['conj'];
    mecabToEdictPos[mecabPos.FUKUSHI] = ['adv'];
    mecabToEdictPos[mecabPos.RENTAISHI] = ['adj-pn'];

    var HIRAGANA_START = 0x3041;
    var HIRAGANA_END = 0x3096;
    var KATAKANA_START = 0x30A1;
    var KATAKANA_END = 0x30FA;
    var CJK_IDEO_START = 0x4e00;
    var CJK_IDEO_END = 0x9faf;

    var between = function(n, a, b) {
        return n >= a && n <= b;
    }

    var isHira = function(c) {
        return between(c.charCodeAt(0), HIRAGANA_START, HIRAGANA_END);
    }

    var isKata = function(c) {
        return between(c.charCodeAt(0), KATAKANA_START, KATAKANA_END);
    }

    var isKanji = function(c) {
        return between(c.charCodeAt(0), CJK_IDEO_START, CJK_IDEO_END);
    }

    var removeChouon = function(text) {
        if (!text)
            return '';
        var t = [];
        var previous;
        for (var i = 0; i < text.length; i++) {
            if (text[i] == 'ー') {
                if ('アカガサザタダナハバパマヤャラワ'.indexOf(previous) != -1) {
                    t.push('ア');
                } else if ('イキギシジチヂニヒビピミリヰエケゲセゼテデネヘベペメレヱ'.indexOf(previous) != -1) {
                    t.push('イ');
                } else if ('ウクグスズツヅヌフブプムユュルオコゴソゾトドノホボポモヨョロヲ'.indexOf(previous) != -1) {
                    t.push('ウ');
                } else {
                    t.push('ー');
                }
            } else {
                t.push(text[i]);
            }
            previous = text[i];
        }
        return t.join('');
    }

    return {
        okuriganaRegex: function(str) {
            var output = '';
            for (i in str) {
                if (isKanji(str[i])) {
                    output += str[i] + '.*?';
                } else if (i == 0) {
                    output += '.+?';
                }
            }
            return output == '.+?' ? '' : output;
        },
        wildcardToRegex: function(wildcard) {
            var regex = '';
            for (i in wildcard) {
                if (['*', '＊'].indexOf(wildcard[i]) != -1) {
                    regex += '.*?';
                } else if (['?', '？'].indexOf(wildcard[i]) != -1) {
                    regex += '.';
                } else if (['+', '＋'].indexOf(wildcard[i]) != -1) {
                    regex += '.+?';
                } else {
                    regex += wildcard[i];
                }
            }
            regex += '$';
            return regex;
        },
        mecabToEdictPos: function(pos) {
            return mecabToEdictPos[pos];
        },
        kataToHira: function(kata) {
            var hira = [];
            kata.split('').forEach(function(k) {
                if (isKata(k)) {
                    var code = k.charCodeAt(0);
                    code += HIRAGANA_START - KATAKANA_START;
                    hira.push(String.fromCharCode(code));
                } else {
                    hira.push(k);
                }
            });
            return hira.join('');
        },
        hiraToKata: function(hira) {
            var kata = [];
            hira.split('').forEach(function(h) {
                if (isHira(h)) {
                    var code = h.charCodeAt(0);
                    code += KATAKANA_START - HIRAGANA_START;
                    kata.push(String.fromCharCode(code));
                } else {
                    kata.push(h);
                }
            });
            return kata.join('');
        },
        isKanji: function(char) {
            return typeof char == 'string' && char.length == 1 && isKanji(char);
        },
        removeChouon: removeChouon,
        isPunctuation : function(char) {
            return char !== '' && '.。．‥…,،，、;；:：!！?？\'´‘’"”“-－―～~[]「」『』【】〈〉《》〔〕()（）{}｛｝'.indexOf(char) != -1;
        },
        posClass: function(pos) {
            return mecabInfoTranslation.pos[pos] || 'other';
        },
        mecabInfoTranslation: function(category, info) {
            function strip(text) {
                return text.split('-')[0];
            }
            function getField(field) {
                return mecabInfoTranslation[field][strip(info[field])];
            }
            if (category == 'pos') {
                return ['pos', 'pos2', 'pos3', 'pos4'].map(getField).join(', ');
            } else if (category == 'inflection') {
                if (info.inflection_type.match(/^.一段/) && info.orth_reading && info.lemma_reading.slice(-2) !== removeChouon(info.orth_reading).slice(-2)) {
                    return 'godan, potential, ' + mecabInfoTranslation.inflection_form[strip(info.inflection_form)];
                } else if (['助動詞-ダ', '助動詞-デス', '形容詞'].indexOf(info.inflection_type) != -1 && info.inflection_form == '意志推量形') {
                    return mecabInfoTranslation.inflection_type[strip(info.inflection_type)] + ', speculation';
                } else {
                    return ['inflection_type', 'inflection_form'].map(getField).join(', ');
                }
            }
        },
        ifExists: function(url, callback, e) {
            $http.get(url)
            .then(function success(data) {
                callback();
            }, function error(data) {
                if (e) {
                    e();
                }
            });
        },
        intersection: function(a, b) {
            return a.filter(function(i) {
                if(b.indexOf(i) > -1) {
                    return true;
                }
                else {
                    return false;
                }
            });
        },
        blend: function(color1, color2, weight) {
            var outputColor = [];

            function channel(a, b) {
                return Math.round((a + (b - a) * weight));
            }

            for (var i = 0; i < 3; i++) {
                outputColor.push(channel(color1[i], color2[i]));
            }

            return '#' + outputColor.map(function(channel) {
                return ('00' + Math.max(Math.min(channel, 255), 0).toString(16)).slice(-2);
            }).join('');
        }
    }

});
