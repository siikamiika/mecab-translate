angular.module('mecab-translate')
.controller('ConfigMenu', function($scope, $rootScope, Config, Tts, EventBridge) {

    $scope.toggleShowConfigMenu = function() {
        $scope.showConfigMenu = !$scope.showConfigMenu;
    }

    $scope.importConfig = function(event) {
        var file = event.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            Config.import(e.target.result);
        }
        reader.readAsText(file);
    }

    $scope.exportConfig = function() {
        var saveData = (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            return function (data, fileName) {
                var blob = new Blob([data], {type: "text/plain"});
                var url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = fileName;
                a.click();
                setTimeout(function(){
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
            };
        }());
        saveData(Config.export(), 'mecab-translate.config');
    }

    $scope.wsInputConnected = false;
    EventBridge.addEventListener('websocket-input-connected', function() {
        $scope.wsInputConnected = true;
        $scope.$apply();
    });

    EventBridge.addEventListener('websocket-input-close', function() {
        $scope.wsInputConnected = false;
        $scope.$apply();
    });

    $scope.websocketInputConnect = function() {
        $scope.wsInputConnected = false;
        Config.set('websocket-input-host', $scope.websocketInputHost);
        if ($scope.websocketInputHost) {
            Config.set('websocket-input-enabled', true);
        } else {
            Config.set('websocket-input-enabled', false);
        }
    }

    $scope.websocketInputHost = Config.get('websocket-input-host');
    $scope.websocketInputEnabled = Config.get('websocket-input-enabled');
    $scope.websocketInputRegex = Config.get('websocket-input-regex');
    $scope.addWebsocketInputRegex = function() {
        $scope.websocketInputRegex.push({enabled: true, name: '', pattern: '', replacement: ''});
        $scope.saveWebsocketInputRegex();
    }
    $scope.removeWebsocketInputRegex = function(index) {
        $scope.websocketInputRegex.splice(index, 1);
        $scope.saveWebsocketInputRegex();
    }
    $scope.saveWebsocketInputRegex = function() {
        $scope.setConfig('websocket-input-regex', $scope.websocketInputRegex, true);
    }
    $scope.showHistoryNavigationButtons = Config.get('show-history-navigation-buttons');
    $scope.showTextInput = Config.get('show-text-input');
    $scope.showMecabInfo = Config.get('show-mecab-info');
    $scope.showKanjiInfo = Config.get('show-kanji-info');
    $scope.showKanjiPartBrowser = Config.get('show-kanji-part-browser');
    Config.listen('non-click-mode', function(val) {
        $scope.nonClickMode = val;
    });
    $scope.contextBasedSearch = Config.get('context-based-search');
    $scope.outputLineMaxLength = Config.get('output-line-max-length');
    $scope.externalSites = Config.get('external-sites');
    $scope.addExternalSite = function() {
        $scope.externalSites.push({aboveResults: true});
        $scope.saveExternalSites();
    }
    $scope.removeExternalSite = function(index) {
        $scope.externalSites.splice(index, 1);
        $scope.saveExternalSites();
    }
    $scope.saveExternalSites = function() {
        $scope.setConfig('external-sites', $scope.externalSites, true);
    }
    $scope.outputFontSize = Config.get('output-font-size');
    $scope.outputMaxHeight = Config.get('output-max-height');
    $scope.kanjiPartBrowserSize = Config.get('kanji-part-browser-size');
    $scope.similarKanjiSize = Config.get('similar-kanji-size');

    $scope.setConfig = function(key, value, noListen) {
        Config.set(key, value, noListen);
    }

    $scope.ttsProvider = Config.get('tts-provider');

    Tts.getVoices(function(data) {
        $scope.voices = data;
    });

    $scope.updateTts = function() {
        Config.set('tts-provider', $scope.ttsProvider);
        var provider = $scope.ttsProvider.split('.');
        if (provider.length == 2 && provider[0] == 'tts' && Tts.getVoiceId() != parseInt(provider[1])) {
            Tts.setVoice(parseInt(provider[1]));
        }
    }

    $scope.updateTts();

    $scope.websocketInputConnect();
});
