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

    var between = function(n, a, b) {
        return n >= a && n <= b;
    }

    var isHira = function(c) {
        return between(c.charCodeAt(0), HIRAGANA_START, HIRAGANA_END);
    }

    var isKata = function(c) {
        return between(c.charCodeAt(0), KATAKANA_START, KATAKANA_END);
    }

    return {
        wildcardToRegex: function(wildcard) {
            var regex = '';
            for (i in wildcard) {
                if (wildcard[i] == '*') {
                    regex += '.*?';
                } else if (wildcard[i] == '?') {
                    regex += '.';
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
                    code += HIRAGANA_START - KATAKANA_START;
                    kata.push(String.fromCharCode(code));
                } else {
                    kata.push(h);
                }
            });
            return kata.join('');
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
        ifExists: function(url, callback) {
            $http.get(url)
            .then(function success(data) {
                callback();
            }, function error(data) {});
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
        commonPriority: [
            'news1',
            'ichi1',
            'spec1',
            'spec2',
            'gai1'
        ],
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
