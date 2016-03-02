angular.module('mecab-translate')
.controller('Output', function($scope, Mecab, Edict2, Kanjidic2, KanjiVG, Helpers) {

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

    $scope.translateSelection = function() {
        var selection = window.getSelection().toString();
        if (selection) {
            Edict2.translate(selection);
        }
    }

    $scope.getKanjidic2 = function(kanji) {
        if (kanji && kanji.length == 1) {
            var url = 'kanji/' + ('00000' + kanji.charCodeAt(0).toString(16)).slice(-5) + '.svg';
            Helpers.ifExists(url, function() {
                $scope.kanji = url;
            });
        }
        Kanjidic2.get(kanji);
    }

    KanjiVG.setKanjidic($scope.getKanjidic2);

    $scope.showReading = function(reading) {
       $scope.reading = reading;
    }

});
