angular.module('mecab-translate', []);
angular.module('mecab-translate').directive('keypressEvents', [
    '$document',
    '$rootScope',
    function($document, $rootScope) {
        return {
            restrict: 'A',
            link: function() {
                $document.bind('keydown', function(e) {
                    console.log(e.which)
                    if (e.which == 9) { // Tab
                        $rootScope.$broadcast('focus-input');
                        e.preventDefault();
                    } else if (e.altKey) {
                        var preventDefault = true;
                        if (e.which == 49) // Alt+1
                            $rootScope.$broadcast('input-history-back');
                        else if (e.which == 50) // Alt+2
                            $rootScope.$broadcast('input-history-forward');
                        else if (e.which == 78) // Alt+n
                            $rootScope.$broadcast('toggle-non-click-mode');
                        else if (e.which == 82) // Alt+r
                            $rootScope.$broadcast('clear-input');
                        else
                            preventDefault = false;
                        if (preventDefault)
                            e.preventDefault();
                    }
                });
            }
        }
    }
]);

angular.module('mecab-translate').directive('fileInputOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.fileInputOnChange);
      element.bind('change', onChangeHandler);
    }
  };
});
