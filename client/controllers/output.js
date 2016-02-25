angular.module('mecab-translate')
.controller('Output', function($scope, Mecab, Edict2) {

    $scope.$on('mecabResponse', function() {
        $scope.words = Mecab.response;
    });

    $scope.translate = function(lemma) {
        Edict2.translate(lemma);
    }

    $scope.reading = '-';

    $scope.show_reading = function(reading) {
       $scope.reading = reading;
    }

});
