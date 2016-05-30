angular.module('mecab-translate')
.factory('Tts', function($http) {

    return {
        TTS: function(text) {
            $http.post('/tts', angular.toJson(text));
        }
    }

});
