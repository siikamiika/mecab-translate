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

// This whole part of speech parsing is ported from
// https://github.com/Kimtaro/ve/blob/7a902322befbb0d37dba8e7af552596dfce8bd04/lib/providers/mecab_ipadic.rb
// which is licensed under the MIT license.
// PoS
var MEISHI = '名詞'
var KOYUUMEISHI = '固有名詞'
var DAIMEISHI = '代名詞'
var JODOUSHI = '助動詞'
var KAZU = '数'
var JOSHI = '助詞'
var SETTOUSHI = '接頭詞'
var DOUSHI = '動詞'
var KIGOU = '記号'
var FIRAA = 'フィラー'
var SONOTA = 'その他'
var KANDOUSHI = '感動詞'
var RENTAISHI = '連体詞'
var SETSUZOKUSHI = '接続詞'
var FUKUSHI = '副詞'
var SETSUZOKUJOSHI = '接続助詞'
var KEIYOUSHI = '形容詞'

// Pos2 and Inflection types
var HIJIRITSU = '非自立'
var FUKUSHIKANOU = '副詞可能'
var SAHENSETSUZOKU = 'サ変接続'
var KEIYOUDOUSHIGOKAN = '形容動詞語幹'
var NAIKEIYOUSHIGOKAN = 'ナイ形容詞語幹'
var JODOUSHIGOKAN = '助動詞語幹'
var FUKUSHIKA = '副詞化'
var TAIGENSETSUZOKU = '体言接続'
var RENTAIKA = '連体化'
var TOKUSHU = '特殊'
var SETSUBI = '接尾'
var SETSUZOKUSHITEKI = '接続詞的'
var DOUSHIHIJIRITSUTEKI = '動詞非自立的'
var SAHEN_SURU = 'サ変・スル'
var TOKUSHU_TA = '特殊・タ'
var TOKUSHU_NAI = '特殊・ナイ'
var TOKUSHU_TAI = '特殊・タイ'
var TOKUSHU_DESU = '特殊・デス'
var TOKUSHU_DA = '特殊・ダ'
var TOKUSHU_MASU = '特殊・マス'
var TOKUSHU_NU = '特殊・ヌ'
var FUHENKAGATA = '不変化型'
var JINMEI = '人名'
var MEIREI_I = '命令ｉ'
var KAKARIJOSHI = '係助詞'

// Etc
var NA = 'な'
var NI = 'に'
var TE = 'て'
var DE = 'で'
var BA = 'ば'
var NN = 'ん'
var SA = 'さ'

function show_output (data) {

    var output_parts = [];
    var d, eat_next, attach_to_previous, update_pos, eat_lemma, pos, also_attach_to_lemma;

    // preprocessing
    for (i = 0; i < data.length; i++) {
        d = data[i];

        pos = null;
        eat_next = false;
        eat_lemma = true;
        attach_to_previous = false;
        also_attach_to_lemma = false;
        update_pos = false;

        // part of speech class
        if (d.pos == MEISHI) {
            pos = 'noun';
            if (d.pos2 == KOYUUMEISHI) {
                pos = 'proper-noun';
            }
            else if (d.pos2 == DAIMEISHI) {
                pos = 'pronoun';
            }
            else if  (d.pos2 == FUKUSHIKANOU || d.pos2 == SAHENSETSUZOKU || d.pos2 == KEIYOUDOUSHIGOKAN || d.pos2 == NAIKEIYOUSHIGOKAN) {
                if (data[i + 1] !== undefined) {
                    if (data[i + 1].inflection_type == SAHEN_SURU) {
                        pos = 'verb';
                        eat_next = true;
                    }
                    else if (data[i + 1].inflection_type == TOKUSHU_DA) {
                        pos = 'adjective';
                        if (data[i + 1].inflection_form == TAIGENSETSUZOKU) {
                            eat_next = true;
                            eat_lemma = false;
                        }
                    }
                    else if (data[i + 1].inflection_type == TOKUSHU_NAI) {
                        pos = 'adjective';
                        eat_next =  true;
                    }
                    else if (data[i + 1].pos == JOSHI && data[i + 1].literal == NI) {
                        pos = 'adverb';
                        eat_next = false;
                    }
                }
            }
            else if (d.pos2 == HIJIRITSU || d.pos2 == TOKUSHU) {
                if (data[i + 1] !== undefined) {
                    if (d.pos3 == FUKUSHIKANOU) {
                        if (data[i + 1].pos == JOSHI && data[i + 1].literal == NI) {
                            pos = 'adverb';
                            eat_next = true;
                        }
                    }
                    else if (d.pos3 == JODOUSHIGOKAN) {
                        if (data[i + 1].inflection_type == TOKUSHU_DA) {
                            pos = 'verb'; // aux
                            if (data[i + 1].inflection_form == TAIGENSETSUZOKU) {
                                eat_next = false;
                            }
                        }
                        else if (data[i + 1].pos == JOSHI && data[i + 1].pos2 == FUKUSHIKA) {
                            pos = 'adverb';
                            eat_next = true;
                        }
                    }
                    else if (d.pos3 == KEIYOUDOUSHIGOKAN) {
                        pos = 'adjective';
                        if (data[i + 1].inflection_type == TOKUSHU_DA && data[i + 1].inflection_form == TAIGENSETSUZOKU || data[i + 1].pos2 == RENTAIKA) {
                            eat_next = true;
                        }
                    }
                }
            }
            else if (d.pos2 == KAZU) {
                pos = 'number';
                // meh
            }
            else if (d.pos2 == SETSUBI) {
                if (d.pos3 == JINMEI) {
                    pos = 'suffix';
                }
                else {
                    if (d.pos3 == TOKUSHU && d.lemma == SA) {
                        update_pos = true;
                        pos = 'noun';
                    }
                    else {
                        also_attach_to_lemma = true;
                    }
                    attach_to_previous = true;
                }
            }
            else if (d.pos2 == SETSUZOKUSHITEKI) {
                pos = 'conjunction';
            }
            else if (d.pos2 == DOUSHIHIJIRITSUTEKI) {
                pos = 'verb'; // nominal
            }
        }
        else if (d.pos == SETTOUSHI) {
            pos = 'prefix';
        }
        else if (d.pos == JODOUSHI) {
            pos = 'postposition';
            if ((data[i - 1] === undefined || (data[i - 1] !== undefined && data[i - 1].pos2 != KAKARIJOSHI)) &&
                [TOKUSHU_TA, TOKUSHU_NAI, TOKUSHU_TAI, TOKUSHU_MASU, TOKUSHU_NU].indexOf(d.inflection_type) > -1) {
                attach_to_previous = true;
            }
            else if (d.inflection_type == FUHENKAGATA && d.lemma == NN) {
                attach_to_previous = true;
            }
            else if ((d.inflection_type == TOKUSHU_DA || d.inflection_type == TOKUSHU_DESU) && d.literal != NA) {
                pos = 'verb';
            }
        }
        else if (d.pos == DOUSHI) {
            pos = 'verb';
            if (d.pos2 == SETSUBI) {
                attach_to_previous = true;
            }
            else if (d.pos2 == HIJIRITSU && d.inflection_form != MEIREI_I) {
                attach_to_previous = true;
            }
        }
        else if (d.pos == KEIYOUSHI) {
            pos = 'adjective';
        }
        else if (d.pos == JOSHI) {
            pos = 'postposition';
            if (d.pos2 == SETSUZOKUJOSHI && [TE, DE, BA].indexOf(d.literal) > -1) {
                attach_to_previous = true;
            }
        }
        else if (d.pos == RENTAISHI) {
            pos = 'determiner';
        }
        else if (d.pos == SETSUZOKUSHI) {
            pos = 'conjunction';
        }
        else if (d.pos == FUKUSHI) {
            pos = 'adverb';
        }
        else if (d.pos == KIGOU) {
            pos = 'symbol';
        }
        else if (d.pos == KANDOUSHI || d.pos == FIRAA) {
            pos = 'interjection';
        }
        else {
            pos = 'other';
        }

        if (attach_to_previous && output_parts.length > 0) {
            output_parts[output_parts.length - 1].tokens.push(d);
            if (update_pos) {
                output_parts[output_parts.length - 1].part_of_speech = pos;
            }
        }
        else {
            var word = {
                part_of_speech: pos,
                tokens: [d]
            }
            if (eat_next) {
                i++;
                word.tokens.push(data[i]);
            }
            output_parts.push(word);
        }
    }

    output_parts = output_parts.map(function (part) {
        var part_element = document.createElement('span');
        part_element.classList.add(part.part_of_speech);
        part = part.tokens.map(function (atom) {
            var atom_element = document.createElement('span');
            atom_element.innerHTML = atom.literal;
            atom_element.classList.add('atom');
            atom_element.addEventListener('click', function () {
                XHR('POST', '/edict2', JSON.stringify(atom.lemma), function (lemma_trans) {
                    lemma_trans = JSON.parse(lemma_trans);
                    info.innerHTML = ('type: ' + ([atom.pos, atom.pos2, atom.pos3, atom.pos4].filter(mc_flt).join(', ') || '—') + '\n' +
                        'infl: ' + [atom.inflection_type, atom.inflection_form].filter(mc_flt).join(', ') + '\n' +
                        'lemma: ' + (mc_flt(atom.lemma) ? atom.lemma : '') + '\n\n' +
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
            });
            return atom_element;
        });
        for (i = 0; i < part.length; i++) {
            part_element.appendChild(part[i]);
        }
        return part_element;
    });

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
