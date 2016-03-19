angular.module('mecab-translate')
.factory('KanjiVGParts', function($http) {

    return {
        getParts: function(kanji, cb) {
            $http({
                method: 'GET',
                url: '/kvgparts',
                params: {query: kanji}
            }).then(function success(data) {
                cb(data.data);
            }, function error(data) {
                cb([]);
            })
        },
        getCombinations: function(parts, cb) {
            $http({
                method: 'GET',
                url: '/kvgcombinations',
                params: {query: parts.join(',')}
            }).then(function success(data) {
                cb(data.data);
            }, function error(data) {
                cb([]);
            });
        }
    }

});
