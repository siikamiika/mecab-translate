angular.module('mecab-translate')
.controller('Output', function($scope, Mecab, JMdict_e, Kanjidic2, KanjiVG, KanjiVGParts, ResponsiveVoice, Helpers) {

    $scope.posClass = Helpers.posClass;

    $scope.blend = Helpers.blend;

    Mecab.setOutput(function(output) {
        $scope.lines = output;
    });

    Kanjidic2.setOutput(function(output) {
        $scope.kanjidicInfo = output;
    });

    $scope.showWordInfo = function(word) {
        if (!window.getSelection().toString()) {
            $scope.word = word;
            JMdict_e.translate(word.lemma || word.literal);
        }
    }

    $scope.translateSelection = function() {
        var selection = window.getSelection().toString();
        if (selection) {
            JMdict_e.translate(selection);
        }
    }

    $scope.getKanjidic2 = function(kanji) {
        Kanjidic2.get(kanji);
    }

    var getKanjiVGParts = function(kanji) {
        $scope.selectedKanjivgParts = [];
        $scope.kanjivgCombinations = [];
        $scope.kanjivgKanji = kanji;
        KanjiVGParts.getParts(kanji, function(parts) {
            $scope.kanjivgParts = parts;
        });
        KanjiVGParts.getCombinations([$scope.kanjivgKanji], function(combinations) {
            $scope.kanjivgCombinations = combinations;
        });
    }

    $scope.getKanjiVGCombinations = function() {
        var parts = [];
        for (i in $scope.kanjivgParts) {
            if ($scope.selectedKanjivgParts[i]) {
                parts.push($scope.kanjivgParts[i]);
            }
        }
        KanjiVGParts.getCombinations(parts.length ? parts : [$scope.kanjivgKanji], function(combinations) {
            $scope.kanjivgCombinations = combinations;
        });
    }

    $scope.setKanjivgChar = function(kanji) {
        if (kanji && kanji.length == 1) {
            var url = 'kanji/' + ('00000' + kanji.charCodeAt(0).toString(16)).slice(-5) + '.svg';
            Helpers.ifExists(url, function() {
                getKanjiVGParts(kanji);
                $scope.kanjivgUrl = url;
                $scope.kanji = kanji;
            });
        }
    }

    $scope.TTS = function(text, line) {
        if (line) {
            text = text.map(function(w) {
                return w.literal;
            }).join('');
        }
        ResponsiveVoice.TTS(text);
    }

    KanjiVG.setOutput($scope.setKanjivgChar);

});
