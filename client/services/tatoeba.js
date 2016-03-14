angular.module('mecab-translate')
.factory('Tatoeba', function($http) {

    return {
        demonstrate: function(words, readings, cb) {

            words = words.map(function(word) {
                return word.text;
            }).join(',');
            readings = readings.map(function(reading) {
                return reading.text;
            }).join(',');

            $http({
                method: 'GET',
                url: '/tatoeba',
                params: {query: words, readings: readings}
            }).then(function success(data) {
                cb(data.data);
            }, function error(data) {
                cb([]);
            });

        }
    }

});
