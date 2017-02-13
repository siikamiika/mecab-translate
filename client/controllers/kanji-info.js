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
        if (!response.fromself) {
            $scope.originalKanjiPart = null;
        }
    });

    var originalKanjiPartTmp;
    EventBridge.addEventListener('original-kanji-part', function(data) {
        if (data.event == 'mouseenter' && data.mouseOver() == data.expected) {
            originalKanjiPartTmp = $scope.originalKanjiPart;
            $scope.originalKanjiPart = data.originalPart;
            $scope.kanjiPartMouseOver = true;
        } else if (data.event == 'mouseleave' && data.mouseOver() == data.expected) {
            $scope.originalKanjiPart = originalKanjiPartTmp;
            $scope.kanjiPartMouseOver = false;
        } else if (data.event == 'click') {
            $scope.originalKanjiPart = data.originalPart;
            originalKanjiPartTmp = data.originalPart;
            $scope.kanjiPartMouseOver = false;
        }
    });

    $scope.getKanjiInfo = function(kanji) {
        KanjiVG.get(kanji);
        Kanjidic2.get(kanji);
        SimilarKanji.get(kanji);
    }

    $scope.getKanjiMouseover = function() {
        return $scope.kanjiMouseover;
    }

    $scope.getKanjidic2 = function(kanji) {
        $scope.kanjiMouseover = kanji;
        Kanjidic2.get(kanji, $scope.getKanjiMouseover);
    }

    $scope.getSimilarKanji = function(kanji) {
        $scope.kanjiMouseover = kanji;
        SimilarKanji.get(kanji, $scope.getKanjiMouseover);
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

    $scope.kanjiGrade = function(num, explanation) {
        if (num >= 1 && num <= 6) {
            return explanation ? 'Kyōiku, kanji learned in elementary school' : '教育';
        } else if (num >= 7 && num <= 8) {
            return explanation ? 'Jōyō, regular-use kanji that is not kyōiku' : '常用';
        } else if (num == 9) {
            return explanation ? 'Jinmeiyō, kanji used in names' : '人名用';
        } else if (num == 10) {
            return explanation ? 'Kyūjitai, traditional form kanji' : '旧字体';
        }
    }

    $scope.SKIPExplanation = function(skip) {
        var output = [];
        var shape = {'1': 'vertical', '2': 'horizontal', '3': 'enclosed', '4': 'other'};
        var position = {
            '1': ['left', 'right'],
            '2': ['top', 'bottom'],
            '3': ['enclosing', 'enclosed'],
            '4': [
                'Total stroke count',
                {
                    '1': 'Horizontal line above',
                    '2': 'Horizontal line below',
                    '3': 'Dividing vertical line',
                    '4': 'Does not apply'
                }
            ]
        };
        output.push('Shape: '+skip[0]+' ('+shape[skip[0]]+')');
        if (skip[0] < 4) {
            output.push('Stroke count of the '+position[skip[0]][0]+' part: '+skip[1]);
            output.push('Stroke count of the '+position[skip[0]][1]+' part: '+skip[2]);
        } else {
            output.push(position[skip[0]][0]+': '+skip[1]);
            output.push('Line: '+position[skip[0]][1][skip[2]]);
        }
        return '\n' + output.join('\n');
    }

});
