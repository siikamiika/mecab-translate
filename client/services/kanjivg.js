angular.module('mecab-translate')
.factory('KanjiVG', function(Kanjidic2) {

    var setKanjivgChar;

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
            if (!part.isTop) {
                return;
            }
            part.setAttribute('stroke', kanjiPartColors[color]);
            var outlines = part.cloneNode(true);
            outlines.setAttribute('stroke-width', 24);
            outlines.setAttribute('style', 'opacity: 0;');
            part.appendChild(outlines);
            var originalKanjiPart = part.getAttribute('kvg:original');
            var kanjiPart = part.getAttribute('kvg:element');
            part.onclick = function() {
                setKanjivgChar(kanjiPart);
                Kanjidic2.get(kanjiPart);
            }
            part.onmouseenter = function() {
                parts.forEach(function(_part) {
                    _part.setAttribute('stroke', 'gray');
                });
                Kanjidic2.get(originalKanjiPart || kanjiPart);
            }
            part.onmouseleave = function() {
                parts.forEach(function(_part) {
                    if (_part.isTop) {
                        _part.setAttribute('stroke', kanjiPartColors[color]);
                    }
                    else {
                        _part.removeAttribute('stroke');
                    }
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
                    group.isTop = true;
                    return true;
                }
            }
        });

        var color = 0;
        var queue = [];
        var queueElements = [];

        for (var i = 0; i < topGroups.length; i++) {(function() {
            var kvgPart = topGroups[i].getAttribute('kvg:part');
            var kvgElement = topGroups[i].getAttribute('kvg:element');
            if (queueElements.indexOf(kvgElement) == -1) {
                queueElements.push(kvgElement);
                queue.push({
                    element: kvgElement,
                    groups: [topGroups[i]],
                    color: color++,
                    hasParts: !!kvgPart
                });
            }
            else if (kvgPart) {
                for (var j = 0; j < queue.length; j++) {
                    if (queue[j].element == kvgElement && queue[j].hasParts) {
                        queue[j].groups.push(topGroups[i]);
                        break;
                    }
                }
            }
            else {
                queueElements.push(kvgElement);
                queue.push({
                    groups: [topGroups[i]],
                    color: color++
                });
            }
        })()}

        for (var i = 0; i < queue.length; i++) {(function() {
            queue[i].groups = queue[i].groups.concat(groups.filter(function(group) {
                return queue[i].element == group.getAttribute('kvg:element') &&
                    group.getAttribute('kvg:part') && queue[i].groups.indexOf(group) == -1;
            }));
        })()}

        for (var i = 0; i < queue.length; i++) {
            activateKanjivgPart(queue[i].groups, queue[i].color, original);
        }
    }

    return {
        setOutput: function(fn) {
            setKanjivgChar = fn;
        },
        setKanjivgChar: function(kanji) {
            setKanjivgChar(kanji);
        }
    }

});
