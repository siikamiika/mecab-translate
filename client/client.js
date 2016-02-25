angular.module('mecab-translate', [])
.filter('unsafe', function($sce) {
    return $sce.trustAsHtml;
});
