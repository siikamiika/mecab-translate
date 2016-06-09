angular.module('mecab-translate')
.factory('Kanjidic2', function($http) {

    var output;

    return {
        get: function(val, mouseover) {
            $http({
                method: 'GET',
                url: '/kanjidic2',
                params: {query: val}
            }).then(function success(data) {
                if (!mouseover || mouseover() == val) {
                    output(data.data);
                }
            }, function error(data) {
                if (!mouseover || mouseover() == val) {
                    output({});
                }
            });
        },
        setOutput: function(fn) {
            output = fn;
        }
    }

});
