angular.module('mecab-translate')
.controller('Translation', function($scope, Edict2) {
    $scope.$on('edict2Response', function() {
        $scope.entries = Edict2.response;
    });
});
