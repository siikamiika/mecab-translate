angular.module('mecab-translate')
.controller('Input', function($scope, Mecab) {
    $scope.analyze = function() {
        Mecab.analyze($scope.textInput);
    };
});