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
        removeChouon: function(text) {
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
        },
        isPunctuation : function(char) {
            return '.。．‥…,،，、;；:：!！?？\'´‘’"”“-－―～~[]「」『』【】〈〉《》〔〕()（）{}｛｝'.indexOf(char) != -1
        },
        posClass: function(pos) {
            switch(pos) {
                case mecabPos.MEISHI:
                    return 'noun';
                case mecabPos.KOYUUMEISHI:
                    return 'proper-noun';
                case mecabPos.DAIMEISHI:
                    return 'pronoun';
                case mecabPos.JODOUSHI:
                    return 'verb';
                case mecabPos.KAZU:
                    return 'number';
                case mecabPos.JOSHI:
                    return 'particle';
                case mecabPos.SETTOUSHI:
                    return 'prefix';
                case mecabPos.SETTOUJI:
                    return 'prefix';
                case mecabPos.DOUSHI:
                    return 'verb';
                case mecabPos.KIGOU:
                    return 'symbol';
                case mecabPos.HOJOKIGOU:
                    return 'symbol';
                case mecabPos.FIRAA:
                    return 'filler';
                case mecabPos.SONOTA:
                    return 'other';
                case mecabPos.KANDOUSHI:
                    return 'interjection';
                case mecabPos.RENTAISHI:
                    return 'determiner';
                case mecabPos.SETSUZOKUSHI:
                    return 'conjunction';
                case mecabPos.FUKUSHI:
                    return 'adverb';
                case mecabPos.SETSUZOKUJOSHI:
                    return 'postposition';
                case mecabPos.SETSUBIJI:
                    return 'suffix';
                case mecabPos.KEIYOUSHI:
                    return 'adjective';
                case mecabPos.KEIJOUSHI:
                    return 'adjective';
                default:
                    return 'other';
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
