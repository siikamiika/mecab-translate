angular.module('mecab-translate')
.factory('JMdict_e', function($http) {

    var output;
    var last;

    return {
        translate: function(word, lemma, regex) {
            last = word;
            if (lemma)
                word = (word.lemma||'').split('-')[0] || word.literal;
            $http({
                method: 'GET',
                url: '/jmdict_e',
                params: {
                    query: word,
                    regex: regex ? 'yes' : 'no'
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
