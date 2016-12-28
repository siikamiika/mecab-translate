angular.module('mecab-translate')
.factory('KanjiVG', function($http, EventBridge, Helpers) {

    return {
        get: function(kanji) {
            var url = 'kanji/' + ('00000' + kanji.charCodeAt(0).toString(16)).slice(-5) + '.svg';
            Helpers.ifExists(url, function then() {
                $http({
                    method: 'GET',
                    url: url
                }).then(function success(data) {
                    EventBridge.dispatch('kanjivg-response', {data: data.data, kanji: kanji});
                }, function error(data) {
                    EventBridge.dispatch('kanjivg-response', null);
                });
            }, function otherwise() {
                $http({
                    method: 'GET',
                    url: 'kanji/0003f.svg' // "?"
                }).then(function success(data) {
                    EventBridge.dispatch('kanjivg-response', {data: data.data, kanji: kanji});
                }, function error(data) {
                    EventBridge.dispatch('kanjivg-response', null);
                });
            });
        }
    }

});
