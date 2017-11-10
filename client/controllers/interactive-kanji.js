angular.module('mecab-translate')
.controller('InteractiveKanji', function($scope, KanjiVG, Config, EventBridge, Kanjidic2, SimilarKanji) {

    var interactiveKanji = document.getElementById('interactive-kanji');

    EventBridge.addEventListener('kanjivg-response', function(response) {
        var div = document.createElement('div');
        div.innerHTML = response.data;
        interactiveKanji.innerHTML = '';
        interactiveKanji.appendChild(div.querySelector('svg'));
        activateElement();
    });

    var kanjiPartColors = [
        '#5ea8f2',
        '#dd7373',
        '#55fb97',
        '#ffcf51',
        '#d27d8e',
        '#5151ff',
        '#ff5151',
        '#51ff51',
        '#51ffff',
        '#ff51ff',
        '#ffff51'
    ];

    var mouseOver = null;

    var getMouseOver = function() {
        return mouseOver;
    }

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
                KanjiVG.get(kanjiPart, true);
                Kanjidic2.get(kanjiPart);
                SimilarKanji.get(kanjiPart);
                EventBridge.dispatch('original-kanji-part', {event: 'click', originalPart: originalKanjiPart});
            }
            part.onmouseenter = function() {
                parts.forEach(function(_part) {
                    _part.setAttribute('stroke', 'gray');
                });
                mouseOver = kanjiPart;
                Kanjidic2.get(kanjiPart, getMouseOver);
                SimilarKanji.get(kanjiPart, getMouseOver);
                EventBridge.dispatch('original-kanji-part', {event: 'mouseenter', originalPart: originalKanjiPart, expected: kanjiPart, mouseOver: getMouseOver});
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
                mouseOver = original;
                Kanjidic2.get(original, getMouseOver);
                SimilarKanji.get(original, getMouseOver);
                EventBridge.dispatch('original-kanji-part', {event: 'mouseleave', expected: original, mouseOver: getMouseOver});
            }
        });
    }

    var activateElement = function() {
        interactiveKanji.querySelector('svg').setAttribute('width', 200);
        interactiveKanji.querySelector('svg').setAttribute('height', 200);
        var textElements = interactiveKanji.getElementsByTagName('text');
        for (var i = 0; i < textElements.length; i++) {
            textElements[i].setAttribute('style', 'font-size: 8px; pointer-events: none;');
        }

        var groups = [].slice.call(interactiveKanji.getElementsByTagName('g'), 1);
        groups[0].setAttribute('stroke-width', 5);
        groups[0].setAttribute('stroke', '#fff');
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

});
