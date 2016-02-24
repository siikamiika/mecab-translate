angular.module('mecab-translate')
.controller('Output', function($scope, Mecab, Edict2) {
    $scope.$on('mecabResponse', function() {
        $scope.words = Mecab.response;
    });
    $scope.translate = function(word) {
        Edict2.translate(word);
    }
});
