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

    $scope.translateSelection = function() {
        var selection = window.getSelection().toString();
        if (selection) {
            Edict2.translate(selection);
        }
    }

    var kanjivg = document.getElementById('kanjivg');

    var activateKanjivgPart = function (part, i, original) {
        part.setAttribute('stroke', Helpers.kanjiPartColors[i]);
        var kanjiPart = part.getAttribute('kvg:original');
        if (!kanjiPart) {
            kanjiPart = part.getAttribute('kvg:element');
        }
        part.onclick = function() {
            $scope.getKanjidic2(kanjiPart);
        }
        part.onmouseover = function() {
            part.setAttribute('stroke', 'gray');
            Kanjidic2.get(kanjiPart);
        }
        part.onmouseleave = function() {
            part.setAttribute('stroke', Helpers.kanjiPartColors[i]);
            Kanjidic2.get(original);
        }
    }

    kanjivg.onload = function() {
        var parts = kanjivg.contentDocument.children[0].children[0].children[0];
        parts.setAttribute('stroke-width', 5);
        var original = parts.getAttribute('kvg:element');
        parts = parts.children;
        var color = 0;
        for (var i = 0; i < parts.length; i++) {
            var el = parts[i].getAttribute('kvg:element');
            if (!el) {
                try {
                    var subparts = parts[i].children;
                    var good = false;
                    for (var j = 0; j < 3; j++) {
                        for (var k = 0; k < subparts.length; k++) {
                            el = subparts[k].getAttribute('kvg:element');
                            if (el) {
                                good = true;
                                break;
                            }
                        }
                        if (good) {
                            break;
                        }
                        else {
                            subparts = subparts[0].children;
                        }
                    }
                    for (var l = 0; l < subparts.length; l++) {
                        el = subparts[l].getAttribute('kvg:element');
                        if (el) {
                            activateKanjivgPart(subparts[l], color, original);
                            color++;
                        }
                    }
                }
                catch(error) {
                    console.log(error.message);
                }
            }
            else {
                activateKanjivgPart(parts[i], color, original);
                color++;
            }
        }
    }

    $scope.getKanjidic2 = function(kanji) {
        $scope.kanji = kanji || $scope.kanji;
        Kanjidic2.get(kanji);
    }

    $scope.reading = '-';

    $scope.showReading = function(reading) {
       $scope.reading = reading;
    }

});
