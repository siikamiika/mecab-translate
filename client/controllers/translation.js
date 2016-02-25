angular.module('mecab-translate')
.controller('Translation', function($scope, $sce, Edict2) {

    Edict2.setOutput(function(output) {
        $scope.entries = output.sort(function(a, b) {
            if ((a.common && b.common) || (!a.common && !b.common)) {
                return 0;
            }
            else if (b.common) {
                return 1;
            }
            else {
                return -1;
            }
        });
    });

    $scope.color = function(text, color) {
        return '<span style="color:'+color+'">'+text+'</span>';
    }

    $scope.paren_hilite = function(text) {
        var output = '';
        var buffer = '';
        var depth = 0;
        for (var i = 0; i < text.length; i++) {
            if (depth) {
                buffer += text[i];
                if (text[i] == '(') {
                    depth++;
                }
                else if (text[i] == ')') {
                    if (!--depth) {
                        output += $scope.color(buffer, '#8090FF');
                        buffer = '';
                    }
                }
            }
            else {
                if (text[i] == '(') {
                    depth++;
                    buffer += text[i];
                }
                else {
                    output += text[i];
                }
            }
        }
        if (buffer.length) {
            output += $scope.color(buffer, '#8090FF');
        }
        return output;
    }

    $scope.w = function(text) {
        return $sce.trustAsHtml($scope.paren_hilite($scope.color(text, 'red')));
    }

    $scope.r = function(text) {
        return $sce.trustAsHtml($scope.paren_hilite($scope.color(text, 'green')));
    }

    $scope.d = function(text) {
        return $sce.trustAsHtml($scope.paren_hilite(text));
    }

});
