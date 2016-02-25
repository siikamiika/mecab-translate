angular.module('mecab-translate')
.controller('Output', function($scope, Mecab, Edict2) {

    Mecab.setOutput(function(output) {
        $scope.words = output;
    });

    $scope.showInfo = function(word) {
        $scope.word = word;
    }

    $scope.translate = function(lemma) {
        Edict2.translate(lemma);
    }

    $scope.reading = '-';

    $scope.showReading = function(reading) {
       $scope.reading = reading;
    }

});
