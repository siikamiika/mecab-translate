angular.module('mecab-translate')
.controller('ConfigMenu', function($scope, $rootScope, Config, Tts) {

    $scope.toggleShowConfigMenu = function() {
        $scope.showConfigMenu = !$scope.showConfigMenu;
    }

    $scope.showHistoryNavigationButtons = Config.get('show-history-navigation-buttons');
    $scope.showTextInput = Config.get('show-text-input');
    $scope.showMecabInfo = Config.get('show-mecab-info');
    $scope.showKanjiInfo = Config.get('show-kanji-info');
    $scope.showKanjiPartBrowser = Config.get('show-kanji-part-browser');
    $scope.checkbox = function() {
        Config.set('show-history-navigation-buttons', $scope.showHistoryNavigationButtons);
        Config.set('show-text-input', $scope.showTextInput);
        Config.set('show-mecab-info', $scope.showMecabInfo);
        Config.set('show-kanji-info', $scope.showKanjiInfo);
        Config.set('show-kanji-part-browser', $scope.showKanjiPartBrowser);
    }

    $scope.kanjivgCombinationSize = Config.get('kanjivg-combination-size');
    $scope.textChange = function(key, value) {
        Config.set(key, value);
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
});
