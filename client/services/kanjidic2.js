angular.module('mecab-translate')
.factory('Kanjidic2', function($http) {

    return {
        get: function(val) {
            $http({
                method: 'GET',
                url: '/kanjidic2',
                params: {query: val}
            }).then(function success(data) {
                this.output(data.data);
            }.bind(this), function error(data) {
                this.output({});
            }.bind(this));
        },
        setOutput: function(fn) {
            this.output = fn;
        }
    }

});
