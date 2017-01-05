angular.module('mecab-translate')
.factory('WebsocketInput', function(Config, EventBridge, Mecab) {

    var input;

    var host;
    Config.listen('websocket-input-host', function(val) {
        host = val;
    });

    Config.listen('websocket-input-enabled', function(enabled) {
        if (enabled) {
            connect();
        } else {
            disconnect();
        }
    });

    var ws;
    var connectTimer;
    function connect() {
        disconnect();
        if (connectTimer)
            clearTimeout(connectTimer);
        connectTimer = setTimeout(function() {
            ws = new WebSocket('ws://' + host);
            ws.onopen = function() {
                EventBridge.dispatch('websocket-input-connected');
            }
            ws.onclose = function() {
                EventBridge.dispatch('websocket-input-close');
            }
            ws.onmessage = function(text) {
                input.value = text.data;
                Mecab.analyze(text.data);
            }
        }, 500);
    }

    function disconnect() {
        if (ws && ws.readyState === 1)
            ws.close();
    }

    return {
        setInput: function(element) {
            input = element;
        }
    }

});
