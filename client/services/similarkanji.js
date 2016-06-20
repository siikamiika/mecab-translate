angular.module('mecab-translate')
.factory('SimilarKanji', function($http) {

    return {
        get: function(kanji, cb) {
            $http({
                method: 'GET',
                url: '/kanjisimilars',
                params: {query: kanji}
            }).then(function success(data) {
                cb(data.data);
            }, function error(data) {
                cb([]);
            })
        }
    }

});
