angular.module('mecab-translate')
.factory('SimilarKanji', function($http) {

    return {
        get: function(kanji, mouseover) {
            $http({
                method: 'GET',
                url: '/kanjisimilars',
                params: {query: kanji}
            }).then(function success(data) {
                if (!mouseover || mouseover() == kanji) {
                    output(data.data);
                }
            }, function error(data) {
                if (!mouseover || mouseover() == kanji) {
                    output([]);
                }
            })
        },
        setOutput: function(fn) {
            output = fn;
        }
    }

});
