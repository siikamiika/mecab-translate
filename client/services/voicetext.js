angular.module('mecab-translate')
.factory('VoiceText', function($http) {

    return {
        TTS: function(text) {
            $http.post('http://127.0.0.1:9871/voicetext', angular.toJson(text));
        }
    }

});
