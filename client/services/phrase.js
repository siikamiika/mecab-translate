angular.module('mecab-translate')
.factory('Phrase', function($http) {
    
    var output;

    return {
        search: function(phrase, max, start, shuffle) {

            $http({
                method: 'GET',
                url: '/phrase',
                params: {
                    query: phrase,
                    max: max,
                    start: start,
                    shuffle: shuffle ? 'yes' : 'no'
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
        customOutput: function(custom) {
            output(custom);
        }
    }

});
