angular.module('mecab-translate')
.controller('Translation', function($scope, JMdict_e, Helpers) {

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
