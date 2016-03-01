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

    var activateKanjivgPart = function (part, color, original) {
        part.setAttribute('stroke', Helpers.kanjiPartColors[color]);
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
            part.setAttribute('stroke', Helpers.kanjiPartColors[color]);
            Kanjidic2.get(original);
        }
    }

    kanjivg.onload = function() {
        // firefox
        var textElements = kanjivg.contentDocument.getElementsByTagName('text');
        for (var i = 0; i < textElements.length; i++) {
            textElements[i].setAttribute('style', 'font-size: 8px;');
        }

        var groups = [].slice.call(kanjivg.contentDocument.getElementsByTagName('g'), 1, -1);
        groups[0].setAttribute('stroke-width', 5);
        var original = groups[0].getAttribute('kvg:element');

        var topGroups = groups.slice(1).filter(function(group) {
            var parent = group.parentElement;
            var parentKvgElement;
            while (true) {
                try {
                    parentKvgElement = parent.getAttribute('kvg:element');
                    if (parentKvgElement && parentKvgElement !== original) {
                        return false;
                    }
                }
                catch (error) {
                    if (group.getAttribute('kvg:element')) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                parent = parent.parentElement;
            }
        });

        var color = 0;
        var queue = {};
        var character;
        for (var i = 0; i < topGroups.length; i++) {
            character = topGroups[i].getAttribute('kvg:original');
            if (!character) {
                character = topGroups[i].getAttribute('kvg:element');
            }

            if (queue[character] === undefined) {
                queue[character] = {
                    color: color,
                    parts: []
                }
                color++;
            }
            queue[character].parts.push(topGroups[i]);
        }

        for (var x in queue) {
            queue[x].parts.forEach(function(g) {
                activateKanjivgPart(g, queue[x].color, original);
            });
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

    $scope.showReading = function(reading) {
       $scope.reading = reading;
    }

});
