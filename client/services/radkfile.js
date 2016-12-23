angular.module('mecab-translate')
.factory('Radkfile', function($http) {

    var output;

    return {
        lookup: function(radicals) {
            $http({
                method: 'GET',
                url: '/radkfile',
                params: {
                    query: radicals.join('')
                }
            }).then(function success(data) {
                output(data.data);
            }, function error(data) {
                output([]);
            });
        },
        decompose: function(text) {
            $http({
                method: 'GET',
                url: '/radkfile',
                params: {
                    query: text,
                    mode: 'decompose'
                }
            }).then(function success(data) {
                output(data.data);
            }, function error(data) {
                output([]);
            });
        },
        getRadicals: function(fn) {
            $http({
                method: 'GET',
                url: '/radkfile'
            }).then(function success(data) {
                fn(data.data);
            });
        },
        setOutput: function(fn) {
            output = fn;
        }
    }

});
