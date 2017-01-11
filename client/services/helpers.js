angular.module('mecab-translate')
.factory('Helpers', function($http) {

    var mecabToEdictPos = {};
    mecabToEdictPos['particle'] = ['prt', 'aux'];
    mecabToEdictPos['aux-verb'] = ['aux-v', 'aux-adj'];
    mecabToEdictPos['suffix'] = ['suf', 'n-suf'];
    mecabToEdictPos['prefix'] = ['pref'];
    mecabToEdictPos['interjection'] = ['int'];
    mecabToEdictPos['conjunction'] = ['conj'];
    mecabToEdictPos['adverb'] = ['adv'];
    mecabToEdictPos['prenoun'] = ['adj-pn'];

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
            return pos || 'other';
        },
        mecabInfoTranslation: function(category, info) {
            function strip(text) {
                return text.split('-')[0];
            }
            function getField(field) {
                return info[field];
            }
            if (category == 'pos') {
                return ['pos', 'pos2', 'pos3', 'pos4'].map(getField).join(', ');
            } else if (category == 'inflection') {
                if (['aux|da', 'aux|desu', 'i-adjective'].indexOf(info.inflection_type) != -1 && info.inflection_form == 'volitional') {
                    return info.inflection_type + ', speculation';
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
