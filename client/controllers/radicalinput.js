angular.module('mecab-translate')
.controller('RadicalInput', function($scope, Radkfile, EventBridge, Helpers) {

    $scope.blend = Helpers.blend;

    $scope.charIndex = 0;
    $scope.selectedRadicals = [[]];
    $scope.validRadicals = [[]];
    $scope.radicalInputCandidates = [[]];
    $scope.decomposedRadicals = [];

    var refresh = function() {
        for (i in $scope.radicalInputRadicals) {
            refreshRadical($scope.radicalInputRadicals[i]);
        }

        function refreshRadical(radical) {
            var selected = false;
            var invalid = false;
            if ($scope.selectedRadicals[$scope.charIndex].indexOf(radical.text) > -1) {
                selected = true;
            } else if ($scope.validRadicals[$scope.charIndex].length && $scope.validRadicals[$scope.charIndex].indexOf(radical.text) == -1) {
                invalid = true;
            } else if ($scope.decomposedRadicals.length && $scope.decomposedRadicals.indexOf(radical.text) == -1) {
                invalid = true;
            }
            radical.selected = selected;
            radical.invalid = invalid;
        }
    }

    var sortInputCandidates = function(radicals) {
        return function(a, b) {
            function sortFreq(_a, _b) {
                if (_a[1] == _b[1]) {
                    return 0;
                } else if (_a[1] > _b[1]) {
                    return 1;
                } else {
                    return -1;
                }
            }
            var aInRadicals = radicals.indexOf($scope.radicals[a[0]]) > -1;
            var bInRadicals = radicals.indexOf($scope.radicals[b[0]]) > -1;
            if (aInRadicals == bInRadicals) {
                return sortFreq(a, b);
            } else if (aInRadicals) {
                return -1;
            } else {
                return 1;
            }
        }
    }

    Radkfile.setOutput(function(data) {
        if (data.decomposed_radicals) {
            $scope.decomposedRadicals = data.decomposed_radicals;
        } else if (data.valid_radicals) {
            $scope.validRadicals[$scope.charIndex] = data.valid_radicals;
            $scope.radicalInputCandidates[$scope.charIndex] = data.kanji.sort(sortInputCandidates($scope.selectedRadicals[$scope.charIndex]));
        } else {
            for (i in data) {
                if (!$scope.selectedRadicals[i]) {
                    $scope.selectedRadicals[i] = [];
                }
                $scope.validRadicals[i] = data[i].valid_radicals;
                $scope.radicalInputCandidates[i] = data[i].kanji.sort(sortInputCandidates($scope.selectedRadicals[i]));
            }
        }
        refresh();
    });

    Radkfile.getRadicals(function(radicals) {
        $scope.radicals = {};
        $scope.radicalInputRadicals = [];
        var strokes = 0;
        for(i in radicals) {
            $scope.radicals[radicals[i][0]] = radicals[i][2];
            if (strokes != radicals[i][1]) {
                strokes = radicals[i][1];
                $scope.radicalInputRadicals.push({class: 'radical-input-label', text: radicals[i][1]});
            }
            $scope.radicalInputRadicals.push({class: 'radical-input-radical', text: radicals[i][0], alt_text: radicals[i][2]});
        }
    });

    $scope.toggleRadical = function(radical, invalid) {
        if (invalid) {
            return;
        }
        if (typeof $scope.selectedRadicals[$scope.charIndex] == 'string') {
            $scope.selectedRadicals[$scope.charIndex] = [];
        }

        if ($scope.selectedRadicals[$scope.charIndex].indexOf(radical) == -1) {
            $scope.selectedRadicals[$scope.charIndex].push(radical);
        } else {
            var index = $scope.selectedRadicals[$scope.charIndex].indexOf(radical);
            $scope.selectedRadicals[$scope.charIndex].splice(index, 1);
        }
        if ($scope.selectedRadicals[$scope.charIndex].length) {
            if ($scope.selectedRadicals.length > 1) {
                Radkfile.multichar(null, $scope.selectedRadicals, null);
            } else {
                Radkfile.lookup($scope.selectedRadicals[$scope.charIndex]);
            }
        } else {
            if ($scope.selectedRadicals.length > 1) {
                Radkfile.multichar(null, $scope.selectedRadicals, null);
            } else {
                $scope.validRadicals[$scope.charIndex] = [];
                $scope.radicalInputCandidates = [];
                refresh();
            }
        }
    }

    $scope.addChar = function() {
        $scope.selectedRadicals.push([]);
        $scope.charIndex = $scope.selectedRadicals.length - 1;
        Radkfile.multichar(null, $scope.selectedRadicals, null);
    }

    $scope.changeChar = function(i) {
        $scope.charIndex = i;
        refresh();
    }

    $scope.decomposeText = function() {
        Radkfile.decompose($scope.decomposeInput);
    }

    $scope.resetRadicals = function() {
        $scope.selectedRadicals[$scope.charIndex] = [];
        if ($scope.selectedRadicals.length > 1) {
            Radkfile.multichar(null, $scope.selectedRadicals, null);
        } else {
            $scope.validRadicals[$scope.charIndex] = [];
            $scope.radicalInputCandidates[$scope.charIndex] = [];
            $scope.decomposedRadicals = [];
            $scope.decomposeInput = '';
            refresh();
        }
    }

    $scope.resetText = function() {
        $scope.charIndex = 0;
        $scope.selectedRadicals = [[]];
        $scope.validRadicals = [[]];
        $scope.radicalInputCandidates = [[]];
        $scope.decomposedRadicals = [];
        $scope.decomposeInput = '';
        refresh();
    }

    $scope.toggleShowRadicalInput = function() {
        $scope.showRadicalInput = !$scope.showRadicalInput;
    }

    $scope.commitText = function() {
        var text = [];
        for (c in $scope.selectedRadicals) {
            if (typeof $scope.selectedRadicals[c] == 'object') {
                text.push('?');
            } else {
                text.push($scope.selectedRadicals[c]);
            }
        }
        EventBridge.dispatch('input-text', text.join(''));
        $scope.resetText();
    };

    $scope.commitCharacter = function(character) {
        $scope.selectedRadicals[$scope.charIndex] = character;
        Radkfile.multichar(null, $scope.selectedRadicals, null);
        
    }

    $scope.multicharText = function(c) {
        return typeof c == 'object'
            ? '[' + (c.map(function(r) {return $scope.radicals[r]}).join('') || '_') + ']' || '_'
            : c;
    }

    EventBridge.addEventListener('toggle-radical-input', $scope.toggleShowRadicalInput);

});
