angular.module('mecab-translate')
.controller('Input', function($scope, $rootScope, Mecab) {

    var input = document.getElementById('text-input');
    var back = document.getElementById('input-history-back');
    var forward = document.getElementById('input-history-forward');
    
    var output = document.getElementById('output');
    var translations = document.getElementById('translation-element');

    var UIelements = [output, translations];
    var elementIndex = 0;
    var inputFocused = false;

    Mecab.setInput(input);
    Mecab.setButtons(back, forward);

    $scope.analyze = function() {
        Mecab.analyze($scope.textInput);
    }

    $scope.analyzeHistory = function(offset) {
        Mecab.analyzeHistory(offset);
    }

    $rootScope.$on('input-history-back', function() {
        Mecab.analyzeHistory(-1);
    });

    $rootScope.$on('input-history-forward', function() {
        Mecab.analyzeHistory(1);
    });

    $rootScope.$on('focus-input', function() {
        elementIndex = 0;
        input.focus();
        inputFocused = true;
    });

    $rootScope.$on('unfocus-input', function() {
        elementIndex = 0;
        UIelements[elementIndex].focus();
        inputFocused = false;
    });

    $rootScope.$on('navigate-element-down', function(e) {
        if (inputFocused)
            return
        e.preventDefault();
        var newValue = elementIndex + 1;
        if (newValue < UIelements.length)
            elementIndex = newValue;
        else
            elementIndex = 0;
        UIelements[elementIndex].focus();
    });

    $rootScope.$on('navigate-element-up', function(e) {
        if (inputFocused)
            return
        e.preventDefault();
        var newValue = elementIndex - 1;
        if (newValue > -1)
            elementIndex = newValue;
        else
            elementIndex = UIelements.length - 1;
        UIelements[elementIndex].focus();
    });

});
