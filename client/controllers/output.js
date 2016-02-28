angular.module('mecab-translate')
.controller('Output', function($scope, Mecab, Edict2, Kanjidic2, Helpers) {

    $scope.posClass = Helpers.posClass;

    Mecab.setOutput(function(output) {
        $scope.words = output;
    });

    Kanjidic2.setOutput(function(output) {
        $scope.kanjidicInfo = output;
    });

    $scope.showInfo = function(word) {
        $scope.word = word;
    }

    $scope.translate = function(lemma) {
        Edict2.translate(lemma);
    }

    $scope.getKanjidic2 = function(kanji) {
        $scope.kanji = kanji;
        Kanjidic2.get(kanji);
    }

    $scope.reading = '-';

    $scope.showReading = function(reading) {
       $scope.reading = reading;
    }

});
