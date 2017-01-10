angular.module('mecab-translate')
.controller('Translation', function($scope, JMdict_e, Kanjidic2, SimilarKanji, KanjiVG, Helpers, EventBridge, Config) {

    $scope.externalSites = Config.get('external-sites');

    $scope.externalLink = function(link, text) {
        return (link || '').replace('%QUERY%', text);
    }

    $scope.setEntries = function(entries) {
        $scope.entries = entries;
    }

    $scope.showLongerEntries = function() {
        $scope.longerEntryListing = $scope.longerEntries;
        $scope.longerEntries = [];
    }

    EventBridge.addEventListener('jmdict-response', function(output) {
        window.getSelection().removeAllRanges();
        $scope.query = JMdict_e.getLast();
        $scope.longerEntryListing = [];
        $scope.regexResults = [];
        $scope.shorterEntries = output.shorter;
        $scope.longerEntries = output.longer;
        if (output.shorter) {
            $scope.setEntries(output.shorter);
        }
        else {
            $scope.setEntries(output.exact || []);
        }
        if (output.regex) {
            $scope.regexResults = output.regex;
        }
    });

    $scope.translate = function(text) {
        var obj = false;
        if (typeof text == 'object') {
            obj = true;
            text = {
                lemma: text[0],
                reading: isNaN(text[1]) ? text[1] : null
            }
        }
        JMdict_e.translate(text, obj);
    }

    $scope.parseReference = function(ref) {
        return ref.split('・');
    }

    $scope.getKanjiInfo = function(kanji) {
        KanjiVG.get(kanji);
        Kanjidic2.get(kanji);
        SimilarKanji.get(kanji);
    }

});
