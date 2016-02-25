angular.module('mecab-translate')
.controller('Output', function($scope, Mecab, Edict2) {

    Mecab.setOutput(function(output) {
        $scope.words = output;
    });

    $scope.translate = function(lemma) {
        Edict2.translate(lemma);
    }

    $scope.reading = '-';

    $scope.show_reading = function(reading) {
       $scope.reading = reading;
    }

});
