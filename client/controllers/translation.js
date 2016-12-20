angular.module('mecab-translate')
.controller('Translation', function($scope, JMdict_e, Kanjidic2, SimilarKanji, KanjiVG, Helpers) {

    $scope.queryAsString = function() {
        return $scope.query.lemma.split('-')[0] || $scope.query.literal || $scope.query;
    }

    $scope.setEntries = function(entries) {
        $scope.entries = entries;
    }

    $scope.showLongerEntries = function() {
        $scope.longerEntryListing = $scope.longerEntries;
        $scope.longerEntries = [];
    }

    JMdict_e.setOutput(function(output) {
        $scope.query = JMdict_e.getLast();
        $scope.longerEntryListing = [];
        $scope.regexResults = [];
        $scope.shorterEntries = output.shorter;
        $scope.longerEntries = output.longer;
        if (output.shorter) {
            $scope.setEntries(output.shorter);
        }
        else {
            $scope.setEntries(output.exact || []);
        }
        if (output.regex) {
            $scope.regexResults = output.regex;
        }
    });

    $scope.translate = function(text) {
        var obj = false;
        if (typeof text == 'object') {
            obj = true;
            text = {
                lemma: text[0],
                reading: isNaN(text[1]) ? text[1] : null
            }
        }
        JMdict_e.translate(text, obj);
    }

    $scope.parseReference = function(ref) {
        return ref.split('・');
    }

    $scope.getKanjidic2 = function(kanji) {
        Kanjidic2.get(kanji);
    }

    $scope.getSimilarKanji = function(kanji) {
        SimilarKanji.get(kanji);
    }

    $scope.setKanjivgChar = function(kanji) {
        KanjiVG.setKanjivgChar(kanji);
    }

});
