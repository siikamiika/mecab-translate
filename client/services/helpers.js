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
