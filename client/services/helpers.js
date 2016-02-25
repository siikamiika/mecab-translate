angular.module('mecab-translate')
.factory('Helpers', function() {

    var mecabPos = {
        MEISHI: '名詞',
        KOYUUMEISHI: '固有名詞',
        DAIMEISHI: '代名詞',
        JODOUSHI: '助動詞',
        KAZU: '数',
        JOSHI: '助詞',
        SETTOUSHI: '接頭詞',
        DOUSHI: '動詞',
        KIGOU: '記号',
        FIRAA: 'フィラー',
        SONOTA: 'その他',
        KANDOUSHI: '感動詞',
        RENTAISHI: '連体詞',
        SETSUZOKUSHI: '接続詞',
        FUKUSHI: '副詞',
        SETSUZOKUJOSHI: '接続助詞',
        KEIYOUSHI: '形容詞'
    }

    return {
        parenHilite: function(text) {
            var output = '';
            var buffer = '';
            var depth = 0;
            for (var i = 0; i < text.length; i++) {
                if (depth) {
                    buffer += text[i];
                    if (text[i] == '(') {
                        depth++;
                    }
                    else if (text[i] == ')') {
                        if (!--depth) {
                            output += this.color(buffer, '#8090FF');
                            buffer = '';
                        }
                    }
                }
                else {
                    if (text[i] == '(') {
                        depth++;
                        buffer += text[i];
                    }
                    else {
                        output += text[i];
                    }
                }
            }
            if (buffer.length) {
                output += this.color(buffer, '#8090FF');
            }
            return output;
        },
        color: function(text, color) {
            return '<span style="color:'+color+'">'+text+'</span>';
        },
        commonSort: function(a, b) {
            if ((a.common && b.common) || (!a.common && !b.common)) {
                return 0;
            }
            else if (b.common) {
                return 1;
            }
            else {
                return -1;
            }
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
                    return 'postposition';
                case mecabPos.SETTOUSHI:
                    return 'prefix';
                case mecabPos.DOUSHI:
                    return 'verb';
                case mecabPos.KIGOU:
                    return 'other';
                case mecabPos.FIRAA:
                    return 'other';
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
                case mecabPos.KEIYOUSHI:
                    return 'adjective';
                default:
                    return 'other';
            }
        }
    }

});
