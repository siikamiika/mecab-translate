angular.module('mecab-translate')
.controller('Output', function($scope, Mecab, JMdict_e, Kanjidic2, KanjiVG, KanjiVGParts, ResponsiveVoice, RemoteTts, Tts, TtsEvents, Phrase, Config, Helpers) {

    $scope.posClass = Helpers.posClass;

    $scope.blend = Helpers.blend;

    $scope.showMecabInfo = Config.get('show-mecab-info');
    Config.listen('show-mecab-info', function(val) {
        $scope.showMecabInfo = val;
    });

    $scope.showKanjiInfo = Config.get('show-kanji-info');
    Config.listen('show-kanji-info', function(val) {
        $scope.showKanjiInfo = val;
    });

    $scope.showKanjiPartBrowser = Config.get('show-kanji-part-browser');
    Config.listen('show-kanji-part-browser', function(val) {
        $scope.showKanjiPartBrowser = val;
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
            JMdict_e.translate(word, true);
            Phrase.customOutput([]);
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
            Phrase.customOutput([]);
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

    KanjiVG.setOutput($scope.setKanjivgChar);

});
