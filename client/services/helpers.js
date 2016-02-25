angular.module('mecab-translate')
.factory('Helpers', function() {

    return {
        parenHilite: function(text) {
            var output = '';
            var buffer = '';
            var depth = 0;
            for (var i = 0; i < text.length; i++) {
                if (depth) {
                    buffer += text[i];
                    if (text[i] == '(') {
                        depth++;
                    }
                    else if (text[i] == ')') {
                        if (!--depth) {
                            output += this.color(buffer, '#8090FF');
                            buffer = '';
                        }
                    }
                }
                else {
                    if (text[i] == '(') {
                        depth++;
                        buffer += text[i];
                    }
                    else {
                        output += text[i];
                    }
                }
            }
            if (buffer.length) {
                output += this.color(buffer, '#8090FF');
            }
            return output;
        },
        color: function(text, color) {
            return '<span style="color:'+color+'">'+text+'</span>';
        },
        commonSort: function(a, b) {
            if ((a.common && b.common) || (!a.common && !b.common)) {
                return 0;
            }
            else if (b.common) {
                return 1;
            }
            else {
                return -1;
            }
        }
    }

});
