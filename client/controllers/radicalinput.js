angular.module('mecab-translate')
.controller('RadicalInput', function($scope, Radkfile, EventBridge, Helpers) {

    $scope.blend = Helpers.blend;

    $scope.selectedRadicals = [];
    $scope.validRadicals = [];

    var refresh = function() {
        for (i in $scope.radicalInputRadicals) {
            $scope.radicalInputRadicals[i].selected = false;
            $scope.radicalInputRadicals[i].invalid = false;
            if ($scope.selectedRadicals.indexOf($scope.radicalInputRadicals[i].text) > -1) {
                $scope.radicalInputRadicals[i].selected = true;
            } else if ($scope.validRadicals.length && $scope.validRadicals.indexOf($scope.radicalInputRadicals[i].text) == -1) {
                $scope.radicalInputRadicals[i].invalid = true;
            }
        }
    }

    Radkfile.setOutput(function(data) {
        $scope.validRadicals = data.valid_radicals;
        $scope.radicalInputCandidates = data.kanji.sort(function(a, b) {
            if (a[1] == b[1]) {
                return 0;
            } else if (a[1] > b[1]) {
                return 1;
            } else {
                return -1;
            }
        });
        refresh();
    });

    Radkfile.getRadicals(function(radicals) {
        $scope.radicals = radicals;
        $scope.radicalInputRadicals = [];
        var strokes = 0;
        for(i in $scope.radicals) {
            if (strokes != $scope.radicals[i][1]) {
                strokes = $scope.radicals[i][1];
                $scope.radicalInputRadicals.push({class: 'radical-input-label', text: $scope.radicals[i][1]});
            }
            $scope.radicalInputRadicals.push({class: 'radical-input-radical', text: $scope.radicals[i][0], alt_text: $scope.radicals[i][2]});
        }
    });

    $scope.toggleRadical = function(radical, invalid) {
        if (invalid) {
            return;
        }

        if ($scope.selectedRadicals.indexOf(radical) == -1) {
            $scope.selectedRadicals.push(radical);
        } else {
            var index = $scope.selectedRadicals.indexOf(radical);
            $scope.selectedRadicals.splice(index, 1);
        }
        if ($scope.selectedRadicals.length) {
            Radkfile.lookup($scope.selectedRadicals);
        } else {
            $scope.validRadicals = [];
            $scope.radicalInputCandidates = [];
            refresh();
        }
    }

    $scope.resetRadicals = function() {
        $scope.selectedRadicals = [];
        $scope.validRadicals = [];
        $scope.radicalInputCandidates = [];
        refresh();
    }

    $scope.toggleShowRadicalInput = function() {
        $scope.showRadicalInput = !$scope.showRadicalInput;
    }

    $scope.inputCharacter = function(character) {
        EventBridge.dispatch('input-character', character);
    };

    EventBridge.addEventListener('toggle-radical-input', $scope.toggleShowRadicalInput);

});
