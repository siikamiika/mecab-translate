angular.module('mecab-translate')
.factory('TtsEvents', function() {

    var address = 'ws://' + window.location.host + '/tts_events';
    ws = new WebSocket(address);

    return {
        setOutput: function(fn) {
            ws.onmessage = fn;
        }
    }

});
