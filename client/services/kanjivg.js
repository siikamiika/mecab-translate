angular.module('mecab-translate')
.factory('KanjiVG', function(Kanjidic2) {

    var getKanjidic2;

    var kanjiPartColors = [
        '#0d5ba6',
        '#ce3434',
        '#049a40',
        '#e6a600',
        '#d27d8e',
        'blue',
        'red',
        'green',
        'cyan',
        'magenta',
        'yellow'
    ]

    var kanjivg = document.getElementById('kanjivg');

    var activateKanjivgPart = function (parts, color, original) {
        parts.forEach(function(part) {
            part.setAttribute('stroke', kanjiPartColors[color]);
            var outlines = part.cloneNode(true);
            outlines.setAttribute('stroke-width', 24);
            outlines.setAttribute('style', 'opacity: 0;');
            part.appendChild(outlines);
            var kanjiPart = part.getAttribute('kvg:original');
            if (!kanjiPart) {
                kanjiPart = part.getAttribute('kvg:element');
            }
            part.onclick = function() {
                getKanjidic2(kanjiPart);
            }
            part.onmouseenter = function() {
                parts.forEach(function(_part) {
                    _part.setAttribute('stroke', 'gray');
                });
                Kanjidic2.get(kanjiPart);
            }
            part.onmouseleave = function() {
                parts.forEach(function(_part) {
                    _part.setAttribute('stroke', kanjiPartColors[color]);
                });
                Kanjidic2.get(original);
            }
        });
    }

    kanjivg.onload = function() {
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

    return {
        setKanjidic: function(fn) {
            getKanjidic2 = fn;
        }
    }

});
