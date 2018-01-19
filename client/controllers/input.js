angular.module('mecab-translate')
.controller('Input', function($scope, $rootScope, Mecab, WebsocketInput, JMdict_e, EventBridge, Config, Helpers) {

    var input = document.getElementById('text-input');
    var back = document.getElementById('input-history-back');
    var forward = document.getElementById('input-history-forward');

    Mecab.setInput(input);
    WebsocketInput.setInput(input);
    Mecab.setButtons(back, forward);

    Config.listen('show-history-navigation-buttons', function(val) {
        $scope.showButtons = val;
    });

    Config.listen('show-text-input', function(val) {
        $scope.showTextInput = val;
    });

    $scope.analyze = function() {
        Mecab.analyze($scope.textInput);
    }

    $scope.analyzeHistory = function(offset) {
        Mecab.analyzeHistory(offset);
    }

    $scope.toggleRadicalInput = function() {
        EventBridge.dispatch('toggle-radical-input');
    }

    $scope.translateWildcard = function(query, mode) {
        query = (function() {
            switch (mode) {
                case 'plain': return query;
                case 'startswith': return query + '*';
                case 'endswith': return '*' + query;
                case 'anywhere': return '*' + query + '*';
                case 'middle': return '+' + query + '+';
                case 'okurigana': return Helpers.okuriganaRegex(query);
                default: return query;
            }
        })();
        if (mode != 'okurigana') {
            query = Helpers.wildcardToRegex(query);
        }
        JMdict_e.translate(query || '$', false, true);
    }

    EventBridge.addEventListener('text-selected', function(text) {
        if ($scope.lookupSelected) {
            $scope.wildcardSearch = text;
        }
    });

    EventBridge.addEventListener('input-text', function(text) {
        if ($scope.inputMode == 'wildcard') {
            $scope.wildcardSearch = ($scope.wildcardSearch || '') + text;
        } else if ($scope.inputMode == 'parser') {
            $scope.textInput = ($scope.textInput || '') + text;
            $scope.analyze();
        }
    });

    $rootScope.$on('input-history-back', function() {
        Mecab.analyzeHistory(-1);
    });

    $rootScope.$on('input-history-forward', function() {
        Mecab.analyzeHistory(1);
    });

    $rootScope.$on('focus-input', function() {
        input.focus();
    });

    $rootScope.$on('clear-input', function() {
        input.focus();
        $scope.textInput = '';
        input.value = '';
        $scope.analyze();
    });

});
