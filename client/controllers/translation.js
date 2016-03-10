angular.module('mecab-translate')
.controller('Translation', function($scope, JMdict_e, Tatoeba, Helpers) {

    $scope.isCommon = function(word) {
        return Helpers.intersection(Helpers.commonPriority, word.pri).length;
    }

    $scope.setEntries = function(entries) {
        $scope.entries = entries ? entries.sort(function(a, b) {

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

            return Helpers.commonSort(a, b);

        }) : [];
    }

    $scope.demonstrate = function(words, readings, sense, cb) {
        words = words.map(function(word) {
            return word.text;
        }).join(',');
        readings = readings.map(function(reading) {
            return reading.text;
        }).join(',');
        Tatoeba.demonstrate(words, readings, sense, cb);
    }

    // kill it with directives
    $scope.showTatoeba = function(event) {
        return function(examples) {
            var tatoeba = examples.map(function(example){
                return '<br>' +
                    example.jpn.replace(new RegExp('('+example.form+')', 'g'), '<span style="color: red">$1</span>') + '<br>' +
                    example.eng;
            });
            event.target.parentElement.innerHTML = tatoeba;
        }
    }

    $scope.showLongerEntries = function() {
        $scope.longerEntryListing = $scope.longerEntries;
        $scope.longerEntries = [];
    }

    JMdict_e.setOutput(function(output) {
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

    $scope.translate = function(text) {
        JMdict_e.translate(text);
    }

    $scope.parseReference = function(ref) {
        return ref.split('・')[0];
    }

});
