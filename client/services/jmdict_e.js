angular.module('mecab-translate')
.factory('JMdict_e', function($http) {

    var output;
    var last;

    return {
        translate: function(val) {
            last = val;
            $http({
                method: 'GET',
                url: '/jmdict_e',
                params: {query: val}
            }).then(function success(data) {
                output(data.data);
            }, function error(data) {
                output([]);
            });
        },
        setOutput: function(fn) {
            output = fn;
        },
        getLast: function() {
            return last;
        }
    }

});
