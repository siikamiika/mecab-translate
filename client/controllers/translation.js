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
        var responseType = Object.prototype.toString.call(output);
        if(responseType === '[object Object]' ) {
            $scope.shorterEntries = output.shorter;
            $scope.longerEntries = output.longer;
            if (output.shorter) {
                $scope.setEntries(output.shorter);
            }
        }
        else if (responseType == '[object Array]') {
            $scope.shorterEntries = null;
            $scope.longerEntries = null;
            $scope.setEntries(output);
            JMdict_e.translate(JMdict_e.getLast(), false);
        }
    });

    $scope.translate = function(text) {
        JMdict_e.translate(text);
    }

    $scope.parseReference = function(ref) {
        return ref.split('・')[0];
    }

});
