angular.module('mecab-translate')
.factory('JMdict_e', function($http) {

    return {
        translate: function(val) {
            $http({
                method: 'GET',
                url: '/jmdict_e',
                params: {query: val}
            }).then(function success(data) {
                this.output(data.data);
            }.bind(this), function error(data) {
                this.output([]);
            }.bind(this));
        },
        setOutput: function(fn) {
            this.output = fn;
        }
    }

});
