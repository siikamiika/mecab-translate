angular.module('mecab-translate')
.factory('JMdict_e', function($http, Helpers) {

    var output;
    var last;

    return {
        translate: function(word, obj, regex) {
            last = word;
            var reading, pos;
            if (obj) {
                reading = word.reading;
                pos = Helpers.mecabToEdictPos(word.pos) || [];
                pos = pos.join(',');
                word = (word.lemma||'').split('-')[0] || word.literal;
            }
            $http({
                method: 'GET',
                url: '/jmdict_e',
                params: {
                    query: word,
                    regex: regex ? 'yes' : 'no',
                    reading: reading,
                    pos: pos
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
