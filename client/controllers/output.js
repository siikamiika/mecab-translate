angular.module('mecab-translate')
.controller('Output', function($scope, $rootScope, Mecab, JMdict_e, Kanjidic2, SimilarKanji, KanjiVG, ResponsiveVoice, RemoteTts, Tts, TtsEvents, EventBridge, Config, Helpers) {

    $scope.posClass = Helpers.posClass;

    Config.listen('output-font-size', function(val) {
        $scope.outputFontSize = val;
    });

    Config.listen('output-max-height', function(val) {
        $scope.outputMaxHeight = val ? val + 'px' : 'none';
    });

    Config.listen('show-mecab-info', function(val) {
        $scope.showMecabInfo = val;
    });

    Config.listen('context-based-search', function(val) {
        $scope.contextBasedSearch = val;
    });

    Config.listen('output-line-max-length', function(val) {
        $scope.outputLineMaxLength = val;
        if ($scope.lines) {
            var lines = [[].concat.apply([], $scope.lines)];
            if (val > 0) {
                lines = processMecabLines(lines);
            }
            $scope.lines = lines;
        }
    });

    var nonclick;
    Config.listen('non-click-mode', function(val) {
        nonclick = val;
        $scope.nonclick = val;
    });

    $rootScope.$on('toggle-non-click-mode', function() {
        Config.set('non-click-mode', !nonclick);
    });

    $scope.pauseNonClickMode = function() {
        $scope.nonclick = false;
    }

    $scope.resumeNonClickMode = function() {
        $scope.nonclick = nonclick;
    }

    $rootScope.$on('shift-down', function() {
        $scope.nonclick = !nonclick;
        if (kanjiInfoQueue)
            $scope.getKanjiInfo(kanjiInfoQueue);
        if (wordInfoQueue)
            $scope.showWordInfo(wordInfoQueue);
    });

    $rootScope.$on('shift-up', function() {
        $scope.nonclick = nonclick;
    });

    function processMecabLines(lines) {
        lines = lines || [];

        var processedLines = [];
        var lineLength, punctuationIndex, particleIndex, lineOffset, delimiter;
        for (var i = 0; i < lines.length; i++) {
            punctuationIndex = -1;
            particleIndex = -1;
            lineOffset = 0;
            lineLength = 0;
            for (var j = 0; j < lines[i].length; j++) {
                if (lines[i][j].literal === undefined) {
                    continue;
                }
                delimiter = false;
                lineLength += lines[i][j].literal.length;
                if (Helpers.isPunctuation(lines[i][j].literal)) {
                    punctuationIndex = j;
                    if (punctuationIndex > particleIndex) {
                        particleIndex = -1;
                    }
                    delimiter = true;
                } else if (['が','の','を','に','へ','と','か','や','な','わ','よ','ね'].indexOf(lines[i][j].literal) != -1) {
                    particleIndex = j;
                    delimiter = true;
                }
                if (!delimiter && lineLength > $scope.outputLineMaxLength) {
                    if (punctuationIndex == -1) {
                        if (particleIndex == -1) {
                            processedLines.push(lines[i].slice(lineOffset, j));
                            lineOffset = j;
                        } else {
                            processedLines.push(lines[i].slice(lineOffset, particleIndex + 1));
                            lineOffset = particleIndex + 1;
                            particleIndex = -1;
                        }
                    } else {
                        processedLines.push(lines[i].slice(lineOffset, punctuationIndex + 1));
                        lineOffset = punctuationIndex + 1;
                        punctuationIndex = -1;
                    }
                    lineLength = lines[i].slice(lineOffset, j).map(function(a, b) {
                        return a.literal;
                    }).join('').length;
                }
            }
            processedLines.push(lines[i].slice(lineOffset));
        }
        return processedLines;
    }

    Mecab.setOutput(function(output) {
        if ($scope.outputLineMaxLength > 0) {
            $scope.lines = processMecabLines(output);
        } else {
            $scope.lines = output;
        }
    });

    $scope.clearKanjiInfoQueue = function() {
        kanjiInfoQueue = null;
    }
    var kanjiInfoQueue;
    var kanjiInfoTimer;
    $scope.getKanjiInfo = function(kanji, mouseover) {
        if (mouseover) {
            if (!Helpers.isKanji(kanji))
                return;
            kanjiInfoQueue = kanji;
            if (!$scope.nonclick)
                return;
            if (kanjiInfoTimer) {
                clearTimeout(kanjiInfoTimer);
            }
            kanjiInfoTimer = setTimeout(function() {
                if (kanjiInfoQueue) {
                    $scope.getKanjiInfo(kanjiInfoQueue);
                }
            }, 100);
        } else {
            KanjiVG.get(kanji);
            Kanjidic2.get(kanji);
            SimilarKanji.get(kanji);
        }
    }

    $scope.clearWordInfoQueue = function() {
        wordInfoQueue = null;
    }
    var wordInfoQueue;
    var wordInfoTimer;
    $scope.showWordInfo = function(word, mouseover, position) {
        if (mouseover) {
            wordInfoQueue = word;
            if (!$scope.nonclick)
                return;
            if (wordInfoTimer) {
                clearTimeout(wordInfoTimer);
            }
            wordInfoTimer = setTimeout(function() {
                if (wordInfoQueue) {
                    $scope.showWordInfo(wordInfoQueue, false, position);
                }
            }, 100);
        } else if (!window.getSelection().toString()) {
            $scope.word = word;
            JMdict_e.translate(word, true, false, position && $scope.contextBasedSearch
                ? {lines: $scope.lines, pos: position} : null);
        }
    }

    $scope.translateSelection = function() {
        var selection = window.getSelection().toString();
        if ($scope.lastSelection == selection)
            return;
        else
            $scope.lastSelection = selection;
        if (selection) {
            JMdict_e.translate(selection);
            $scope.TTS(selection);
        }
    }

    $scope.updateWordLookup = function() {
        var selection = window.getSelection().toString();
        if (selection)
            EventBridge.dispatch('text-selected', selection);
    }

    $scope.TTS = function(text, line) {
        if (line) {
            text = text.map(function(w) {
                return w.literal;
            }).join('');
        } else {
            $scope.ttsRow = -1;
        }
        if (Config.get('tts-provider') == 'responsivevoice') {
            ResponsiveVoice.TTS(text);
        } else if (Config.get('tts-provider').startsWith('tts')) {
            Tts.TTS(text);
        } else if (Config.get('tts-provider') == 'remotetts') {
            RemoteTts.TTS(text);
        }
    }

    $scope.updateRow = function(row) {
        $scope.ttsRow = row;
    }

    $scope.ttsRow = -1;

    $scope.ttsPos = {row: -1, char_pos: -1, length: -1};

    TtsEvents.setOutput(function(e) {
        if ($scope.ttsRow == -1)
            return;
        var row;
        if ($scope.ttsPos.char_pos != -1) {
            row = document.querySelectorAll('.row-'+$scope.ttsPos.row+' .character');
            for (var i = $scope.ttsPos.char_pos; i < $scope.ttsPos.char_pos + $scope.ttsPos.length; i++) {
                try {
                    row[i].style.backgroundColor = '';
                } catch (e) {};
            }
        }

        var ev = JSON.parse(e.data);

        if (ev.type == 'word') {
            $scope.ttsPos.row = $scope.ttsRow;
            $scope.ttsPos.char_pos = ev.char_pos;
            $scope.ttsPos.length = ev.length;
            row = document.querySelectorAll('.row-'+$scope.ttsPos.row+' .character');
            for (var i = $scope.ttsPos.char_pos; i < $scope.ttsPos.char_pos + $scope.ttsPos.length; i++) {
                try {
                    row[i].style.backgroundColor = '#bbb';
                } catch (e) {};
            }
        }

    });

});
