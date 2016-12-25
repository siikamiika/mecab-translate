angular.module('mecab-translate')
.controller('RadicalInput', function($scope, Radkfile, EventBridge, Helpers) {

    $scope.blend = Helpers.blend;

    $scope.locked = false;
    $scope.charIndex = 0;
    $scope.selectedRadicals = [[]];
    $scope.validRadicals = [[]];
    $scope.radicalInputCandidates = [[]];
    $scope.decomposedRadicals = [[]];

    var lock = function() {
        $scope.locked = true;
        setTimeout(function() {
            $scope.locked = false;
        }, 5000);
    }

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
            } else if ($scope.decomposedRadicals[$scope.charIndex].length && $scope.decomposedRadicals[$scope.charIndex].indexOf(radical.text) == -1) {
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
            $scope.decomposedRadicals[$scope.charIndex] = data.decomposed_radicals;
        } else if (data.valid_radicals) {
            $scope.validRadicals[$scope.charIndex] = data.valid_radicals;
            $scope.radicalInputCandidates[$scope.charIndex] = data.kanji.sort(sortInputCandidates($scope.selectedRadicals[$scope.charIndex]));
        } else {
            for (i in data) {
                if (!$scope.selectedRadicals[i]) {
                    $scope.selectedRadicals[i] = [];
                }
                $scope.validRadicals[i] = data[i].valid_radicals;
                if (data[i].kanji.length == 1 && i != data.length - 1 && typeof $scope.selectedRadicals[i] == 'object') {
                     $scope.selectedRadicals[i] = data[i].kanji[0][0];
                }
                $scope.radicalInputCandidates[i] = data[i].kanji.sort(sortInputCandidates($scope.selectedRadicals[i]));
            }
        }
        refresh();
        $scope.locked = false;
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
        if ($scope.locked) {
            return;
        }
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
            lock();
            if ($scope.selectedRadicals.length > 1) {
                Radkfile.multichar(null, $scope.selectedRadicals, null);
            } else {
                Radkfile.lookup($scope.selectedRadicals[$scope.charIndex]);
            }
        } else {
            if ($scope.selectedRadicals.length > 1) {
                lock();
                Radkfile.multichar(null, $scope.selectedRadicals, null);
            } else {
                $scope.validRadicals[$scope.charIndex] = [];
                $scope.radicalInputCandidates = [];
                refresh();
            }
        }
    }

    $scope.addChar = function() {
        if ($scope.locked) {
            return;
        }
        lock();
        $scope.selectedRadicals.push([]);
        $scope.charIndex = $scope.selectedRadicals.length - 1;
        $scope.decomposedRadicals.push([]);
        Radkfile.multichar(null, $scope.selectedRadicals, null);
    }

    $scope.changeChar = function(i) {
        if ($scope.locked) {
            return;
        }
        $scope.charIndex = i;
        refresh();
    }

    $scope.decomposeText = function() {
        lock();
        Radkfile.decompose($scope.decomposeInput[$scope.charIndex]);
    }

    $scope.resetRadicals = function() {
        if ($scope.locked) {
            return;
        }
        $scope.selectedRadicals[$scope.charIndex] = [];
        if ($scope.selectedRadicals.length > 1) {
            lock();
            Radkfile.multichar(null, $scope.selectedRadicals, null);
        } else {
            $scope.validRadicals[0] = [];
            $scope.radicalInputCandidates[0] = [];
            $scope.decomposedRadicals = [[]];
            $scope.decomposeInput[0] = '';
            refresh();
        }
    }

    $scope.resetText = function() {
        if ($scope.locked) {
            return;
        }
        $scope.charIndex = 0;
        $scope.selectedRadicals = [[]];
        $scope.validRadicals = [[]];
        $scope.radicalInputCandidates = [[]];
        $scope.decomposedRadicals = [[]];
        $scope.decomposeInput = [''];
        refresh();
    }

    $scope.toggleShowRadicalInput = function() {
        $scope.showRadicalInput = !$scope.showRadicalInput;
    }

    $scope.commitText = function() {
        if ($scope.locked) {
            return;
        }
        var text = [];
        var empty = [];
        for (c in $scope.selectedRadicals) {
            if (typeof $scope.selectedRadicals[c] == 'object') {
                empty.push(c);
            } else {
                text.push($scope.selectedRadicals[c]);
            }
        }
        if (empty.length) {
            if (empty[empty.length - 1] == $scope.selectedRadicals.length - 1) {
                var pos = $scope.selectedRadicals.length - 1;
                for (var i = empty.length - 2; i >= 0; i--) {
                    if (empty[i] != pos - 1) {
                        $scope.changeChar(empty[0]);
                        return;
                    } else {
                        pos--;
                    }
                }
            }
        }
        EventBridge.dispatch('input-text', text.join(''));
        $scope.resetText();
    };

    $scope.commitCharacter = function(character) {
        if ($scope.locked) {
            return;
        }
        $scope.selectedRadicals[$scope.charIndex] = character;
        lock();
        Radkfile.multichar(null, $scope.selectedRadicals, null);
        
    }

    $scope.multicharText = function(c) {
        return typeof c == 'object'
            ? '[' + (c.map(function(r) {return $scope.radicals[r]}).join('') || '_') + ']' || '_'
            : c;
    }

    EventBridge.addEventListener('toggle-radical-input', $scope.toggleShowRadicalInput);

});
