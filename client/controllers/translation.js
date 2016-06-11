angular.module('mecab-translate')
.controller('Translation', function($scope, JMdict_e, Tatoeba, Phrase, Kanjidic2, KanjiVG, Helpers) {

    $scope.isCommon = function(word) {
        return Helpers.intersection(Helpers.commonPriority, word.pri).length;
    }

    $scope.queryAsString = function() {
        return $scope.query.lemma || $scope.query.literal || $scope.query;
    }

    $scope.setEntries = function(entries) {

        entries.forEach(function(entry) {
            Tatoeba.demonstrate((entry.words.length ? entry.words : entry.readings), entry.readings, function(examples) {
                examples.forEach(function(example) {
                    example.jpn = example.jpn.split(new RegExp('('+example.form+')', 'g')).map(function(part) {
                        return {form: (part == example.form), text: part};
                    });
                    entry.translations[example.sense == 0 ? 0 : example.sense - 1].example = example;
                });
            });
        });

        $scope.entries = entries.sort(function(a, b) {

            [a, b].forEach(function(entry) {
                var common = false;
                for (var i in entry.words) {
                    if ($scope.isCommon(entry.words[i])) {
                        common = true;
                        break;
                    }
                }
                for (var i in entry.readings) {
                    if ($scope.isCommon(entry.readings[i])) {
                        common = true;
                        break;
                    }
                }
                entry.common = common;
            });

            var commonSort = function (a, b) {
                if ((a.common && b.common) || (!a.common && !b.common)) {
                    return 0;
                }
                else if (b.common) {
                    return 1;
                }
                else {
                    return -1;
                }
            }

            var posSort = function (a, b) {
                if (!$scope.query.pos) {
                    return commonSort(a, b);
                }
                var pos = Helpers.mecabToEdictPos($scope.query.pos) || [];
                var aPos = Helpers.intersection(pos, [].concat.apply([], a.translations.map(function(t){
                    return t.pos.map(function(p) {
                        return p[0];
                    });
                }))).length;
                var bPos = Helpers.intersection(pos, [].concat.apply([], b.translations.map(function(t){
                    return t.pos.map(function(p) {
                        return p[0];
                    });
                }))).length;
                if ((aPos && bPos) || (!aPos && !bPos)) {
                    return readingSort(a, b);
                }
                else if (bPos) {
                    return 1;
                }
                else {
                    return -1;
                }
            }

            var readingSort = function(a, b) {
                if (!$scope.query.lemma_reading) {
                    return commonSort(a, b);
                }
                var lemmaReadingHira = Helpers.kataToHira($scope.query.lemma_reading);
                var aReadings = a.readings.map(function(r) {
                    return r.text;
                });
                var bReadings = b.readings.map(function(r) {
                    return r.text;
                });

                a.hasReading = aReadings.indexOf(lemmaReadingHira) >= 0 || aReadings.indexOf($scope.query.lemma_reading) >= 0;
                b.hasReading = bReadings.indexOf(lemmaReadingHira) >= 0|| bReadings.indexOf($scope.query.lemma_reading) >= 0;

                if ((a.hasReading && b.hasReading) || (!a.hasReading && !b.hasReading)) {
                    return commonSort(a, b);
                }
                else if (b.hasReading) {
                    return 1;
                }
                else {
                    return -1;
                }
            }

            return posSort(a, b);

        });
    }

    $scope.showLongerEntries = function() {
        $scope.longerEntryListing = $scope.longerEntries;
        $scope.longerEntries = [];
    }

    JMdict_e.setOutput(function(output) {
        $scope.query = JMdict_e.getLast();
        $scope.phraseExampleButtonClicked = false;
        $scope.phraseExampleStart = 0;
        $scope.longerEntryListing = [];
        $scope.shorterEntries = output.shorter;
        $scope.longerEntries = output.longer;
        if (output.shorter) {
            $scope.setEntries(output.shorter);
        }
        else {
            $scope.setEntries(output.exact || []);
        }
    });

    Phrase.setOutput(function(output) {
        output.forEach(function(example) {
            if (!example.jpn)
                return;
            example.jpn = example.jpn.split(new RegExp('('+$scope.queryAsString()+')', 'g')).map(function(part) {
                return part;
            });
        });
        $scope.phraseExamples = output;
    });

    $scope.phraseExampleButtonClicked = false;
    $scope.phraseExampleStart = 0;

    $scope.getPhraseExamples = function(more, previous) {
        Phrase.customOutput([{message: 'Searching...'}]);
        var q = $scope.queryAsString();
        if (previous) {
            $scope.phraseExampleStart -= 20;
            Phrase.search(q, 20, $scope.phraseExampleStart, false);
        } else if (more) {
            Phrase.search(q, 20, $scope.phraseExampleStart, false);
            $scope.phraseExampleStart += 20;
        } else {
            Phrase.search(q, 5, 0, true);
        }
        $scope.phraseExampleButtonClicked = true;
    }

    $scope.translate = function(text) {
        JMdict_e.translate(text);
    }

    $scope.parseReference = function(ref) {
        return ref.split('・')[0];
    }

    $scope.getKanjidic2 = function(kanji) {
        Kanjidic2.get(kanji);
    }

    $scope.setKanjivgChar = function(kanji) {
        KanjiVG.setKanjivgChar(kanji);
    }

});
