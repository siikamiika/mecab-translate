angular.module('mecab-translate')
.controller('KanjiInfo', function($scope, Config, EventBridge, Kanjidic2, SimilarKanji, KanjiVG, KanjiVGParts, Helpers) {

    $scope.blend = Helpers.blend;

    Config.listen('show-kanji-info', function(val) {
        $scope.showKanjiInfo = val;
    });

    Config.listen('show-kanji-part-browser', function(val) {
        $scope.showKanjiPartBrowser = val;
    });

    Config.listen('kanji-part-browser-size', function(val) {
        $scope.kanjiPartBrowserSize = val;
    });

    Config.listen('similar-kanji-size', function(val) {
        $scope.similarKanjiSize = val;
    });

    EventBridge.addEventListener('kanjidic2-response', function(response) {
        $scope.kanjidicInfo = response;
    });

    EventBridge.addEventListener('similar-kanji-response', function(response) {
        $scope.similarKanji = response;
    });

    EventBridge.addEventListener('kanjivg-response', function(response) {
        getKanjiVGParts(response.kanji);
        $scope.kanji = response.kanji;
    });

    $scope.getKanjiMouseover = function() {
        return $scope.kanjiMouseover;
    }

    $scope.getKanjidic2 = function(kanji) {
        $scope.kanjiMouseover = kanji;
        Kanjidic2.get(kanji, $scope.getKanjiMouseover);
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

    $scope.getSimilarKanji = function(kanji) {
        SimilarKanji.get(kanji, $scope.getKanjiMouseover);
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
        KanjiVG.get(kanji);
    }

});
