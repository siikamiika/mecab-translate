angular.module('mecab-translate')
.factory('JMdict_e', function($http) {

    return {
        translate: function(val, exact) {
            this.last = val;
            $http({
                method: 'GET',
                url: '/jmdict_e',
                params: {query: val, exact: exact === false ? 'no' : 'yes'}
            }).then(function success(data) {
                this.output(data.data);
            }.bind(this), function error(data) {
                this.output([]);
            }.bind(this));
        },
        setOutput: function(fn) {
            this.output = fn;
        },
        getLast: function() {
            return this.last;
        }
    }

});
