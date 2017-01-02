angular.module('mecab-translate')
.factory('JMdict_e', function($http, Helpers) {

    var output;
    var last;

    return {
        translate: function(word, obj, regex, context) {
            last = word;
            var reading, pos;
            if (obj) {
                reading = word.lemma_reading;
                pos = Helpers.mecabToEdictPos(word.pos) || [];
                pos = pos.join(',');
                word = (word.lemma||'').split('-')[0] || word.literal;
            }
            var wordContext;
            if (context) {
                var len = 0;
                var contextWords = [];
                var _w;
                var first = true;
                for (var i = context.pos[1]; i < context.lines[context.pos[0]].length; i++) {
                    _w = context.lines[context.pos[0]][i];
                    if (Helpers.isPunctuation(_w.literal)) {
                        break;
                    }
                    len += _w.literal.length;
                    if (first || len <= 20) {
                        contextWords.push(_w);
                    } else {
                        break;
                    }
                    first = false;
                }
                if (contextWords.length) {
                    wordContext = {
                        raw: contextWords.map(function(w) {
                            return w.literal;
                        }),
                        reading: contextWords.map(function(w) {
                            return Helpers.removeChouon(w.reading);
                        }),
                        lemma: contextWords.map(function(w) {
                            return w.lemma.split('-')[0];
                        }),
                        lemma_reading: contextWords.map(function(w) {
                            return w.lemma_reading;
                        })
                    }
                }
            }
            $http({
                method: 'GET',
                url: '/jmdict_e',
                params: {
                    query: word,
                    regex: regex ? 'yes' : 'no',
                    reading: reading,
                    pos: pos,
                    context: wordContext
                }
            }).then(function success(data) {
                output(data.data);
            }, function error(data) {
                output([]);
            });
        },
        setOutput: function(fn) {
            output = fn;
        },
        getLast: function() {
            return last;
        }
    }

});
