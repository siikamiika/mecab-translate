angular.module('mecab-translate')
.controller('Input', function($scope, $rootScope, Mecab, JMdict_e, Config, Helpers) {

    var input = document.getElementById('text-input');
    var back = document.getElementById('input-history-back');
    var forward = document.getElementById('input-history-forward');

    Mecab.setInput(input);
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

    $scope.translateWildcard = function(query) {
        JMdict_e.translate(Helpers.wildcardToRegex(query), false, true);
    }

    $rootScope.$on('input-history-back', function() {
        Mecab.analyzeHistory(-1);
    });

    $rootScope.$on('input-history-forward', function() {
        Mecab.analyzeHistory(1);
    });

    $rootScope.$on('focus-input', function() {
        input.focus();
    });

});
