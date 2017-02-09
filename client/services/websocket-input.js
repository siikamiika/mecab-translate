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

    var regex = Config.get('websocket-input-regex');

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
                text = text.data;
                if (!text) return;
                for (i = 0; i < regex.length; i++) {
                    if (!regex[i].enabled) continue;
                    text = textReplace(text, regex[i].pattern, regex[i].replacement);
                }
                function textReplace(text, re, replacement) {
                    re = re.match('^/(.*)/([a-z]*)$');
                    if (!re) return text;
                    re = new RegExp(re[1], re[2]);
                    return text.replace(re, replacement.replace('\\n', '\n'));
                }
                input.value = text;
                Mecab.analyze(text);
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
