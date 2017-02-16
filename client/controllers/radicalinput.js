angular.module('mecab-translate')
.controller('RadicalInput', function($scope, Radkfile, EventBridge, Helpers) {

    $scope.blend = Helpers.blend;

    $scope.locked = false;
    $scope.charIndex = 0;
    $scope.selectedRadicals = [[]];
    $scope.validRadicals = [[]];
    $scope.radicalInputCandidates = [[]];
    $scope.decomposedRadicals = [[]];
    $scope.decomposeInput = [''];
    $scope.before = '';
    $scope.after = '';

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
            var decomposed = false;
            if ($scope.selectedRadicals[$scope.charIndex].indexOf(radical.text) > -1) {
                selected = true;
            }
            if ($scope.validRadicals[$scope.charIndex].length && $scope.validRadicals[$scope.charIndex].indexOf(radical.text) == -1) {
                invalid = true;
            }
            if ($scope.decomposedRadicals[$scope.charIndex].indexOf(radical.text) > -1) {
                decomposed = true;
            }
            radical.selected = selected;
            radical.invalid = invalid;
            radical.decomposed = decomposed;
        }
    }

    var inputCandidates = function(kanji, radicals) {
        var shapeGroups = {'vertical': [], 'horizontal': [], 'enclosed': [], 'other': []};
        var shapeDict = {'1': 'vertical', '2': 'horizontal', '3': 'enclosed', '4': 'other'};

        for (var i in kanji) {
            shapeGroups[shapeDict[kanji[i][3]]].push(kanji[i]);
        }

        for (var k in shapeGroups) {
            if (!shapeGroups.hasOwnProperty(k)) continue;
            shapeGroups[k] = splitStrokeCount(shapeGroups[k]);
            for (var i in shapeGroups[k]) {
                shapeGroups[k][i].kanji.sort(function(a, b) {
                    return sortRadical(a, b) || sortFreq(a, b) || sortOrd(a, b);
                });
            }
        }

        function splitStrokeCount(shapeGroup) {
            var max = 10;
            var output = [];

            shapeGroup.sort(sortStrokeCount);

            var count = 0;
            var start = 0;
            var last = -1;
            for (var i = 0; i < shapeGroup.length; i++) {
                count++;
                if (count >= max) {
                    if (last != shapeGroup[i][2]) {
                        output.push({
                            'start': shapeGroup[start][2],
                            'end': shapeGroup[i - 1][2],
                            'kanji': shapeGroup.slice(start, i)
                        });
                        start = i;
                        count = 0;
                    }
                }
                last = shapeGroup[i][2];
            }

            if (start < shapeGroup.length) {
                output.push({
                    'start': shapeGroup[start][2],
                    'end': shapeGroup[shapeGroup.length - 1][2],
                    'kanji': shapeGroup.slice(start, shapeGroup.length)
                });
            }

            return output;
        }

        function sortRadical(_a, _b) {
            var aInRadicals = radicals.indexOf($scope.radicals[_a[0]]) > -1;
            var bInRadicals = radicals.indexOf($scope.radicals[_b[0]]) > -1;
            if (aInRadicals == bInRadicals) {
                return 0;
            } else if (aInRadicals) {
                return -1;
            } else {
                return 1;
            }
        }

        function sortOrd(_a, _b) {
            if (_a[0] == _b[0]) {
                return 0;
            } else if (_a[0] > _b[0]) {
                return 1;
            } else {
                return -1;
            }
        }

        function sortFreq(_a, _b) {
            if (_a[1] == _b[1]) {
                return 0;
            } else if (_a[1] > _b[1]) {
                return 1;
            } else {
                return -1;
            }
        }

        function sortStrokeCount(_a, _b) {
            if (_a[2] == _b[2]) {
                return 0;
            } else if (_a[2] > _b[2]) {
                return 1;
            } else {
                return -1;
            }
        }

        return shapeGroups;
    }

    Radkfile.setOutput(function(data) {
        var reload = false;
        if (data.decomposed_radicals) {
            $scope.decomposedRadicals[$scope.charIndex] = data.decomposed_radicals;
        } else if (data.valid_radicals) {
            $scope.validRadicals[$scope.charIndex] = data.valid_radicals;
            $scope.radicalInputCandidates[$scope.charIndex] = inputCandidates(data.kanji, $scope.selectedRadicals[$scope.charIndex]);
        } else {
            for (i in data) {
                if (!$scope.selectedRadicals[i]) {
                    $scope.selectedRadicals[i] = [];
                }
                $scope.validRadicals[i] = data[i].valid_radicals;
                if (data[i].kanji.length == 1 && i != data.length - 1 && typeof $scope.selectedRadicals[i] == 'object') {
                     $scope.selectedRadicals[i] = data[i].kanji[0][0];
                     reload = true;
                }
                $scope.radicalInputCandidates[i] = inputCandidates(data[i].kanji, $scope.selectedRadicals[i]);
            }
        }
        if (reload) {
            Radkfile.multichar(null, $scope.selectedRadicals, null);
        } else {
            refresh();
            $scope.locked = false;
        }
    });

    Radkfile.getRadicals(function(radicals) {
        $scope.radicals = {};
        $scope.radicalInputRadicals = [];
        var strokes = 0;
        for(i in radicals) {
            $scope.radicals[radicals[i][0]] = radicals[i][2];
            $scope.radicals[radicals[i][2]] = radicals[i][0];
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

    $scope.removeChar = function() {
        if ($scope.locked || $scope.selectedRadicals.length == 1) {
            return;
        }
        lock();
        $scope.selectedRadicals.splice($scope.charIndex, 1);
        $scope.decomposedRadicals.splice($scope.charIndex, 1);
        $scope.decomposeInput.splice($scope.charIndex, 1);
        if ($scope.charIndex >= $scope.selectedRadicals.length) {
            $scope.charIndex = $scope.selectedRadicals.length - 1;
        }
        Radkfile.multichar(null, $scope.selectedRadicals, null);
    }

    $scope.changeChar = function(i) {
        if ($scope.locked) {
            return;
        }
        $scope.charIndex = i;
        refresh();
    }

    $scope.decomposeText = function(text) {
        Radkfile.decompose(text);
    }

    $scope.resetRadicals = function() {
        if ($scope.locked) {
            return;
        }
        $scope.selectedRadicals[$scope.charIndex] = [];
        if ($scope.selectedRadicals.length > 1) {
            lock();
            $scope.decomposedRadicals[$scope.charIndex] = [];
            $scope.decomposeInput[$scope.charIndex] = '';
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
        $scope.before = '';
        $scope.after = '';
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

    $scope.inputEditText = function() {
        var separator = ($scope.before || $scope.after) ? '|' : '';
        return $scope.before + separator + $scope.selectedRadicals.map(function(c) {
            return $scope.multicharText(c);
        }).join('') + separator + $scope.after;
    }

    $scope.parseInputEditText = function() {
        var parsed = {before: '', input: [], after: ''};
        var inputEdit = $scope.inputEdit.split(/[|｜\/・／]/);
        if (inputEdit.length > 1) {
            parsed.before = inputEdit[0];
            parsed.after = inputEdit[2] || '';
            inputEdit = inputEdit[1];
        } else {
            inputEdit = inputEdit[0];
        }
        var inRadicals = false;
        var radicals = [];
        for (i in inputEdit) {
            if (!inRadicals && ['[', '「', '『'].indexOf(inputEdit[i]) != -1) {
                inRadicals = true;
            } else if (inRadicals) {
                if ([']', '」', '』'].indexOf(inputEdit[i]) != -1) {
                    inRadicals = false;
                    parsed.input.push(radicals.slice(0));
                    radicals = [];
                } else if (inputEdit[i] != '_') {
                    radicals.push($scope.radicals[inputEdit[i]]);
                }
            } else if (['_', '.', '?', '＿', '。', '？'].indexOf(inputEdit[i]) != -1) {
                parsed.input.push([]);
            } else {
                parsed.input.push(inputEdit[i]);
            }
        }
        if (parsed.input.length == 0) {
            parsed.input.push([]);
        }
        return parsed;
    }

    $scope.toggleInputEdit = function() {
        $scope.showInputEdit = !$scope.showInputEdit;
        if ($scope.showInputEdit == true) {
            $scope.inputEdit = $scope.inputEditText();
        } else {
            lock();
            var parsed = $scope.parseInputEditText();
            $scope.before = parsed.before;
            $scope.selectedRadicals = parsed.input;
            $scope.after = parsed.after;

            $scope.charIndex = 0;
            $scope.decomposeInput = [''];
            $scope.decomposedRadicals = parsed.input.map(function(c) {
                return [];
            });
            Radkfile.multichar($scope.before, $scope.selectedRadicals, $scope.after);
        }
    }

    EventBridge.addEventListener('toggle-radical-input', $scope.toggleShowRadicalInput);

});
