var text_input = document.getElementById('text-input');
var output = document.getElementById('output');
var info = document.getElementById('info');
var debug_output = document.getElementById('debug-output');

function XHR (type, path, data, onready, headers, async) {
    if (!onready) {onready = function(){}};
    if (!headers) {headers = []};
    if (!(async === false)) {async = true};
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            onready(xhr.responseText);
        }
    }

    xhr.open(type, path, async);
    for (i = 0; i < headers.length; i++) {
        xhr.setRequestHeader(headers[i][0], headers[i][1]);
    }
    xhr.send(data);
}

function color (text, color) {
    return '<span style="color:'+color+'">'+text+'</span>';
}

function style (text, style) {
    return '<span style="'+style+'">'+text+'</span>';
}

var hira_to_kata = {

    あ: 'ア', い: 'イ', う: 'ウ', ゔ: 'ヴ', え: 'エ', お: 'オ',
    か: 'カ', き: 'キ', く: 'ク', け: 'ケ', こ: 'コ',
    が: 'ガ', ぎ: 'ギ', ぐ: 'グ', げ: 'ゲ', ご: 'ゴ',
    さ: 'サ', し: 'シ', す: 'ス', せ: 'セ', そ: 'ソ',
    ざ: 'ザ', じ: 'ジ', ず: 'ズ', ぜ: 'ゼ', ぞ: 'ゾ',
    た: 'タ', ち: 'チ', つ: 'ツ', て: 'テ', と: 'ト',
    だ: 'ダ', ぢ: 'ヂ', づ: 'ヅ', で: 'デ', ど: 'ド',
    な: 'ナ', に: 'ニ', ぬ: 'ヌ', ね: 'ネ', の: 'ノ',
    は: 'ハ', ひ: 'ヒ', ふ: 'フ', へ: 'ヘ', ほ: 'ホ',
    ば: 'バ', び: 'ビ', ぶ: 'ブ', べ: 'ベ', ぼ: 'ボ',
    ぱ: 'パ', ぴ: 'ピ', ぷ: 'プ', ぺ: 'ペ', ぽ: 'ポ',
    ま: 'マ', み: 'ミ', む: 'ム', め: 'メ', も: 'モ',
    や: 'ヤ', ゆ: 'ユ', よ: 'ヨ',
    ら: 'ラ', り: 'リ', る: 'ル', れ: 'レ', ろ: 'ロ',
    わ: 'ワ', を: 'ヲ',
    ん: 'ン',
    ぁ: 'ァ', ぃ: 'ィ', ぅ: 'ゥ', ぇ: 'ェ', ぉ: 'ォ',
    ゃ: 'ャ', ゅ: 'ュ', ょ: 'ョ',
    っ: 'ッ'

}

function same_kana (a, b) {

    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i] && hira_to_kata[a[i]] != b[i] && hira_to_kata[b[i]] != a[i]) {
            return false;
        }
    }
    return true;
}

function mc_flt (v) {
    return v != '' && v != '*';
}

function common_sort (a, b) {
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

function show_output (data) {

    var output_parts = [];
    var _i, _j, _cls, _fg;

    // words
    for (i = 0; i < data.length; i++) {
        _i = data[i];
        output_parts[i] = document.createElement('span');
        output_parts[i].textContent = _i.literal;
        output_parts[i].classList.add('atom');
        output_parts[i].addEventListener('click', function (_i) {
            // such async
            return function () {
                XHR('POST', '/edict2', JSON.stringify(_i.lemma), function (lemma_trans) {
                    lemma_trans = JSON.parse(lemma_trans);
                    info.innerHTML = ('type: ' + ([_i.pos, _i.pos2, _i.pos3, _i.pos4].filter(mc_flt).join(', ') || '—') + '\n' +
                        'infl: ' + [_i.inflection_type, _i.inflection_form].filter(mc_flt).join(', ') + '\n' +
                        'lemma: ' + (mc_flt(_i.lemma) ? _i.lemma : '') + '\n\n' +
                        (lemma_trans ? lemma_trans.sort(common_sort).map(function (entry) {
                            var output = []
                            if (entry.common) {
                                output.push(color('common word', 'green'));
                            }
                            output.push(style(entry.words.map(function (w) {return color(w, 'red')}).join('; '), 'font-size: 28px;'));
                            if (entry.readings.length) {
                                output.push(style(entry.readings.map(function (w) {return color(w, 'green')}).join('; '), 'font-size: 20px;'));
                            }
                            output.push(entry.translations.map(function (translation, i) {
                                var tl = [];
                                if (translation.parts_of_speech.length) {
                                    tl.push(translation.parts_of_speech.map(function (pos) {return color(pos, 'blue')}).join(', '));
                                }
                                tl.push((i+1) + '. ' + translation.definition);
                                return tl.join('\n')
                            }).join('\n'));
                            return output.join('\n');
                        }).join('\n\n\n') : 'no translation available')).replace(/(\(.*?\))/g, function(_, b) {return color(b, '#8090FF')});
                }, [['Content-Type', 'application/json; charset=utf-8']]);
            }
        }(_i));
    }

    output.innerHTML = '';
    for (i = 0; i < output_parts.length; i++) {
        output.appendChild(output_parts[i]);
        output.appendChild(document.createTextNode(' '));
    }

}


function parse (text) {
    XHR('POST', '/mecab', JSON.stringify(text), function (resp) {
        //debug_output.innerHTML = JSON.stringify(JSON.parse(resp), null, 4);
        show_output(JSON.parse(resp));
    }, [['Content-Type', 'application/json; charset=utf-8']]);
}

text_input.oninput = function () {
    parse(this.value);
}
