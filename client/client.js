angular.module('mecab-translate', []).directive('keypressEvents', [
    '$document',
    '$rootScope',
    function($document, $rootScope) {
        return {
            restrict: 'A',
            link: function() {
                $document.bind('keydown', function(e) {
                    console.log(e.which)
                    if (e.altKey) {
                        var preventDefault = true;
                        if (e.which == 49) // Alt+1
                            $rootScope.$broadcast('input-history-back');
                        else if (e.which == 50) // Alt+2
                            $rootScope.$broadcast('input-history-forward');
                        else
                            preventDefault = false;
                        if (preventDefault)
                            e.preventDefault();
                    } else if (e.shiftKey) {
                        if (e.which == 87) // Shift+w
                            $rootScope.$broadcast('navigate-element-up', e);
                        else if (e.which == 83) // Shift+s
                            $rootScope.$broadcast('navigate-element-down', e);
                        else if (e.which == 65) // Shift+a
                            $rootScope.$broadcast('navigate-left-special', e);
                        else if (e.which == 83) // Shift+d
                            $rootScope.$broadcast('navigate-right-special', e);
                        else if (e.which == 69) // Shift+e
                            $rootScope.$broadcast('key-e-special', e);
                    } else if (e.which == 65) { // a
                        $rootScope.$broadcast('navigate-left', e);
                    } else if (e.which == 68) { // d
                        $rootScope.$broadcast('navigate-right', e);
                    } else if (e.which == 87) { // w
                        $rootScope.$broadcast('navigate-up', e);
                    } else if (e.which ==  83) { // s
                        $rootScope.$broadcast('navigate-down', e);
                    } else if (e.which == 70) { // f
                        $rootScope.$broadcast('key-f', e);
                    } else if (e.which == 69) { // e
                        $rootScope.$broadcast('key-e', e);
                    } else if (e.which == 81) { // q
                        $rootScope.$broadcast('key-q', e);
                    } else if (e.which == 49) { // 1
                        $rootScope.$broadcast('key-1', e);
                    } else if (e.which == 50) { // 2
                        $rootScope.$broadcast('key-2', e);
                    } else if (e.which == 36) { // pgup
                        $rootScope.$broadcast('key-1', e);
                    } else if (e.which == 35) { // pgdn
                        $rootScope.$broadcast('key-2', e);
                    } else if (e.which == 72) { // h
                        $rootScope.$broadcast('navigate-left', e);
                    } else if (e.which == 74) { // j
                        $rootScope.$broadcast('navigate-down', e);
                    } else if (e.which == 75) { // k
                        $rootScope.$broadcast('navigate-up', e);
                    } else if (e.which == 76) { // l
                        $rootScope.$broadcast('navigate-right', e);
                    } else if (e.which == 85) { // u
                        $rootScope.$broadcast('key-u', e);
                    } else if (e.which == 73) { // i
                        $rootScope.$broadcast('key-i', e);
                    } else if (e.which == 79) { // o
                        $rootScope.$broadcast('key-o', e);
                    } else if (e.which == 9) { // Tab
                        $rootScope.$broadcast('focus-input');
                        e.preventDefault();
                    } else if (e.which == 27) { // Esc
                        $rootScope.$broadcast('unfocus-input');
                        e.preventDefault();
                    }
                });
            }
        }
    }
]);
