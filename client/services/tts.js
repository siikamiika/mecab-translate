angular.module('mecab-translate')
.factory('Tts', function($http) {

    var voiceId = -1;

    return {
        TTS: function(text) {
            $http.post('/tts', angular.toJson(text));
        },
        getVoices: function(cb) {
            $http.get('/tts').then(function success(data) {
                cb(data.data);
            });
        },
        setVoice: function(id) {
            $http({
                method: 'GET',
                url: '/tts',
                params: {voice_id: id}
            }).then(function success(data) {
                voiceId = parseInt(id);
            });
        },
        getVoiceId: function() {
            return voiceId;
        }
    }

});
