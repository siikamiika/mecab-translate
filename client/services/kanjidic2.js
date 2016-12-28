angular.module('mecab-translate')
.factory('Kanjidic2', function($http, EventBridge) {

    return {
        get: function(val, mouseover) {
            $http({
                method: 'GET',
                url: '/kanjidic2',
                params: {query: val}
            }).then(function success(data) {
                if (!mouseover || mouseover() == val) {
                    EventBridge.dispatch('kanjidic2-response', data.data);
                }
            }, function error(data) {
                if (!mouseover || mouseover() == val) {
                    EventBridge.dispatch('kanjidic2-response', {});
                }
            });
        }
    }

});
