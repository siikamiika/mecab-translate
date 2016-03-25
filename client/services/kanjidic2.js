angular.module('mecab-translate')
.factory('Kanjidic2', function($http) {

    return {
        get: function(val, mouseover) {
            $http({
                method: 'GET',
                url: '/kanjidic2',
                params: {query: val}
            }).then(function success(data) {
                if (!mouseover || mouseover() == val) {
                    this.output(data.data);
                }
            }.bind(this), function error(data) {
                if (!mouseover || mouseover() == val) {
                    this.output({});
                }
            }.bind(this));
        },
        setOutput: function(fn) {
            this.output = fn;
        }
    }

});
