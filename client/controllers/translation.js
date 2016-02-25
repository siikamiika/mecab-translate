angular.module('mecab-translate')
.controller('Translation', function($scope, $sce, Edict2) {

    $scope.$on('edict2Response', function() {
        $scope.entries = Edict2.response.sort(function(a, b) {
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
        return text.replace(/(\(.*?\))/g, function(_, b) {return $scope.color(b, '#8090FF')});
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
