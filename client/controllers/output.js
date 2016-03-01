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

    var activateKanjivgPart = function (parts, color, original) {
        parts.forEach(function(part) {
            part.setAttribute('stroke', Helpers.kanjiPartColors[color]);
            var outlines = part.cloneNode(true);
            outlines.setAttribute('stroke-width', 24);
            outlines.setAttribute('style', 'opacity: 0;');
            part.appendChild(outlines);
            var kanjiPart = part.getAttribute('kvg:original');
            if (!kanjiPart) {
                kanjiPart = part.getAttribute('kvg:element');
            }
            part.onclick = function() {
                $scope.getKanjidic2(kanjiPart);
            }
            part.onmouseover = function() {
                parts.forEach(function(_part) {
                    _part.setAttribute('stroke', 'gray');
                });
                Kanjidic2.get(kanjiPart);
            }
            part.onmouseleave = function() {
                parts.forEach(function(_part) {
                    _part.setAttribute('stroke', Helpers.kanjiPartColors[color]);
                });
                Kanjidic2.get(original);
            }
        });
    }

    kanjivg.onload = function() {
        // firefox
        var textElements = kanjivg.contentDocument.getElementsByTagName('text');
        for (var i = 0; i < textElements.length; i++) {
            textElements[i].setAttribute('style', 'font-size: 8px; pointer-events: none;');
        }

        var groups = [].slice.call(kanjivg.contentDocument.getElementsByTagName('g'), 1);
        groups[0].setAttribute('stroke-width', 5);
        var original = groups[0].getAttribute('kvg:element');

        var topGroups = groups.slice(1).filter(function(group) {
            if (!group.getAttribute('kvg:element')) {
                return false;
            }
            var parent = group;
            var parentKvgElement;
            while (true) {
                try {
                    parent = parent.parentElement;
                    parentKvgElement = parent.getAttribute('kvg:element');
                    if (parentKvgElement && parentKvgElement !== original) {
                        return false;
                    }
                }
                catch (error) {
                    return true;
                }
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
            activateKanjivgPart(queue[x].parts, queue[x].color, original);
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
