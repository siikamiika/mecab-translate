angular.module('mecab-translate')
.factory('Tatoeba', function($http) {

    return {
        demonstrate: function(words, readings, sense, cb) {
            $http({
                method: 'GET',
                url: '/tatoeba',
                params: {query: words, readings: readings, sense: sense}
            }).then(function success(data) {
                cb(data.data);
            }.bind(this), function error(data) {
                cb([]);
            }.bind(this));
        }
    }

});
