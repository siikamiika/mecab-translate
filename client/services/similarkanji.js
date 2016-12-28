angular.module('mecab-translate')
.factory('SimilarKanji', function($http, EventBridge) {

    return {
        get: function(kanji, mouseover) {
            $http({
                method: 'GET',
                url: '/kanjisimilars',
                params: {query: kanji}
            }).then(function success(data) {
                if (!mouseover || mouseover() == kanji) {
                    EventBridge.dispatch('similar-kanji-response', data.data);
                }
            }, function error(data) {
                if (!mouseover || mouseover() == kanji) {
                    EventBridge.dispatch('similar-kanji-response', []);
                }
            })
        }
    }

});
