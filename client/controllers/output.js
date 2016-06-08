angular.module('mecab-translate')
.controller('Output', function($scope, $rootScope, Mecab, JMdict_e, Kanjidic2, KanjiVG, KanjiVGParts, ResponsiveVoice, RemoteTts, Tts, TtsEvents, Helpers) {

    $scope.posClass = Helpers.posClass;

    $scope.blend = Helpers.blend;

    $scope.ttsProvider = localStorage.ttsProvider || 'responsivevoice';

    Tts.getVoices(function(data) {
        $scope.voices = data;
    });

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
        if ($scope.lastSelection == selection)
            return;
        else
            $scope.lastSelection = selection;
        if (selection) {
            JMdict_e.translate(selection);
            $scope.TTS(selection);
        }
    }

    $scope.getKanjivgCombinationMouseover = function() {
        return $scope.kanjivgCombinationMouseover;
    }

    $scope.getKanjidic2 = function(kanji) {
        $scope.kanjivgCombinationMouseover = kanji;
        Kanjidic2.get(kanji, $scope.getKanjivgCombinationMouseover);
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
        } else {
            $scope.ttsRow = -1;
        }
        if ($scope.ttsProvider == 'responsivevoice') {
            ResponsiveVoice.TTS(text);
        } else if ($scope.ttsProvider.startsWith('tts')) {
            Tts.TTS(text);
        } else if ($scope.ttsProvider == 'remotetts') {
            RemoteTts.TTS(text);
        }
    }

    $scope.updateTts = function() {
        localStorage.ttsProvider = $scope.ttsProvider;
        var provider = $scope.ttsProvider.split('.');
        if (provider.length == 2 && provider[0] == 'tts' && Tts.getVoiceId() != parseInt(provider[1])) {
            Tts.setVoice(parseInt(provider[1]));
        }
    }

    $scope.updateTts();

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

    var outputNavigation = [0,0];
    var outputElements;
    var outputFocusedFlag = false;

    $scope.outputFocused = function() {
        outputFocusedFlag = true;
        outputElements = [];
        var lines = document.querySelectorAll('.output-line');
        for (var i = 0; i < lines.length; i++) {
            outputElements.push(getWords(lines[i]));
        }
        function getWords(line) {
            line = line.querySelectorAll('.word');
            var words = [];
            for (var i = 0; i < line.length; i++) {
                words.push(line[i]);
            }
            return words;
        }
        if (outputElements.length < outputNavigation[0] + 1) {
            outputNavigation = [0,0];
        }
        focusWord();
    }

    function focusWord() {
        if (outputElements[outputNavigation[0]].length == 0) {
            return;
        } else if (outputElements[outputNavigation[0]].length <= outputNavigation[1]) {
            outputNavigation[1] = outputElements[outputNavigation[0]].length - 1;
        }
        outputElements[outputNavigation[0]][outputNavigation[1]].focus();
    }

    $rootScope.$on('navigate-left', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            var newValue = outputNavigation[1] - 1;
            if (newValue > -1) {
                outputNavigation[1] = newValue;
            } else if (outputNavigation[0] > 0) {
                outputNavigation[0]--;
                outputNavigation[1] = outputElements[outputNavigation[0]].length - 1;
            }
            focusWord();
        } else {
            
        }
    });

    $rootScope.$on('navigate-right', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            var newValue = outputNavigation[1] + 1;
            if (newValue < outputElements[outputNavigation[0]].length) {
                outputNavigation[1] = newValue;
            } else if (outputElements.length > outputNavigation[0] + 1) {
                outputNavigation[0]++;
                outputNavigation[1] = 0;
            }
            focusWord();
        } else {
            
        }
    });

    $rootScope.$on('navigate-up', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            var newValue = outputNavigation[0] - 1;
            if (newValue > -1)
                outputNavigation[0] = newValue;
            focusWord();
        } else {
            
        }
    });

    $rootScope.$on('navigate-down', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            var newValue = outputNavigation[0] + 1;
            if (newValue < outputElements.length)
                outputNavigation[0] = newValue;
            focusWord();
        } else {
            
        }
    });

    $rootScope.$on('key-e', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            var txt = outputElements[outputNavigation[0]][outputNavigation[1]].textContent;
            $scope.TTS(txt);
        } else {
            
        }
    });

    $rootScope.$on('key-e-special', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            var el = outputElements[outputNavigation[0]][outputNavigation[1]];
            el.parentElement.parentElement.querySelector('button').click();
        } else {
            
        }
    });

    $rootScope.$on('key-f', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            outputElements[outputNavigation[0]][outputNavigation[1]].click();
        } else {
            
        }
    });

    $rootScope.$on('key-q', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            outputNavigation = [0,0];
            focusWord();
        } else {
            
        }
    });

    $rootScope.$on('key-1', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            outputNavigation[1] = 0;
            focusWord();
        } else {
            
        }
    });

    $rootScope.$on('key-2', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            outputNavigation[1] = outputElements[outputNavigation[0]].length - 1;
            focusWord();
        } else {
            
        }
    });

    $rootScope.$on('key-u', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            var txt = outputElements[outputNavigation[0]][outputNavigation[1]].textContent;
            $scope.TTS(txt);
        } else {
            
        }
    });

    $rootScope.$on('key-i', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            var el = outputElements[outputNavigation[0]][outputNavigation[1]];
            el.parentElement.parentElement.querySelector('button').click();
        } else {
            
        }
    });

    $rootScope.$on('key-o', function(e) {
        if (outputFocusedFlag) {
            e.preventDefault();
            outputElements[outputNavigation[0]][outputNavigation[1]].click();
        } else {
            
        }
    });

    //$scope.kanjivgFocused = function() {
    //    console.log('kanjivgFocused');
    //}

    KanjiVG.setOutput($scope.setKanjivgChar);

});
