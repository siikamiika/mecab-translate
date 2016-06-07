angular.module('mecab-translate')
.controller('Input', function($scope, Mecab) {

    Mecab.setInput(document.getElementById('text-input'));

    $scope.analyze = function() {
        Mecab.analyze($scope.textInput);
    }

    $scope.analyzeHistory = function(offset) {
        Mecab.analyzeHistory(offset);
    }

});
