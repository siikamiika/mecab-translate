angular.module('mecab-translate')
.factory('Tatoeba', function($http) {

    return {
        demonstrate: function(word, reading, sense, cb) {
            $http({
                method: 'GET',
                url: '/tatoeba',
                params: {query: word, reading: reading, sense: sense}
            }).then(function success(data) {
                cb(data.data);
            }.bind(this), function error(data) {
                cb([]);
            }.bind(this));
        }
    }

});
