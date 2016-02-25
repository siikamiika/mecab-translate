angular.module('mecab-translate')
.controller('Translation', function($scope, $sce, Edict2, Helpers) {

    Edict2.setOutput(function(output) {
        $scope.entries = output.sort(Helpers.commonSort);
    });

    $scope.w = function(text) {
        return $sce.trustAsHtml(Helpers.parenHilite(Helpers.color(text, 'red')));
    }

    $scope.r = function(text) {
        return $sce.trustAsHtml(Helpers.parenHilite(Helpers.color(text, 'green')));
    }

    $scope.d = function(text) {
        return $sce.trustAsHtml(Helpers.parenHilite(text));
    }

});
