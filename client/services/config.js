angular.module('mecab-translate')
.factory('Config', function() {

    var config = {};
    config['tts-provider'] = 'responsivevoice';
    config['websocket-input-host'] = '';
    config['websocket-input-enabled'] = false;
    config['show-history-navigation-buttons'] = true;
    config['show-text-input'] = true;
    config['show-mecab-info'] = true;
    config['show-kanji-info'] = true;
    config['show-kanji-part-browser'] = true;
    config['non-click-mode'] = true;
    config['context-based-search'] = false;
    config['output-line-max-length'] = '';
    config['output-font-size'] = 36;
    config['output-max-height'] = '';
    config['kanji-part-browser-size'] = 20;
    config['similar-kanji-size'] = 20;

    var configListeners = {};

    for (k in config) {
        if (!config.hasOwnProperty(k)) continue;
        if (localStorage[k])
            config[k] = JSON.parse(localStorage[k]);
        configListeners[k] = [];
    }

    return {
        get: function(key) {
            return config[key];
        },
        set: function(key, value) {
            config[key] = value;
            localStorage[key] = JSON.stringify(value);
            for(i in configListeners[key])
                configListeners[key][i](config[key]);
        },
        listen: function(key, cb) {
            configListeners[key].push(cb);
            cb(config[key]);
        }
    }

});
