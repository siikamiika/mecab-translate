angular.module('mecab-translate')
.factory('ResponsiveVoice', function() {

    return {
        TTS: function(text) {
            var url = 'https://code.responsivevoice.org/getvoice.php?t='+encodeURIComponent(text)+'&tl=ja&sv=&vn=&pitch=0.5&rate=0.5&vol=1';
            new Audio(url).play();
        }
    }

});
