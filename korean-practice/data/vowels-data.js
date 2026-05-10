/**
 * vowels-data.js - 韓国語母音データ（全21母音）
 */

window.VOWELS = [
  {
    char: 'ㅏ',
    romanization: 'a',
    sound: '아',
    difficulty: 1,
    jp_hint: '日本語の「ア」に近い',
    mouth_tip: '口を大きく開けて「ア」と発音',
    example_words: [
      { kr: '아이', jp: '子供', romanization: 'a-i' },
      { kr: '사랑', jp: '愛', romanization: 'sa-rang' },
      { kr: '바나나', jp: 'バナナ', romanization: 'ba-na-na' }
    ],
    minimal_pairs: ['ㅓ', 'ㅗ']
  },
  {
    char: 'ㅓ',
    romanization: 'eo',
    sound: '어',
    difficulty: 3,
    jp_hint: '口をやや開けて「オ」と「ア」の中間',
    mouth_tip: '口を横に開かず、やや前に出して「オ」',
    example_words: [
      { kr: '어머니', jp: 'お母さん', romanization: 'eo-meo-ni' },
      { kr: '뭐', jp: '何', romanization: 'mwo' },
      { kr: '언니', jp: 'お姉さん（女性から）', romanization: 'eon-ni' }
    ],
    minimal_pairs: ['ㅏ', 'ㅗ']
  },
  {
    char: 'ㅗ',
    romanization: 'o',
    sound: '오',
    difficulty: 1,
    jp_hint: '日本語の「オ」に近いが唇をより丸める',
    mouth_tip: '唇をしっかり丸めて突き出す',
    example_words: [
      { kr: '오빠', jp: 'お兄さん（女性から）', romanization: 'o-ppa' },
      { kr: '오늘', jp: '今日', romanization: 'o-neul' },
      { kr: '고양이', jp: '猫', romanization: 'go-yang-i' }
    ],
    minimal_pairs: ['ㅓ', 'ㅜ']
  },
  {
    char: 'ㅜ',
    romanization: 'u',
    sound: '우',
    difficulty: 1,
    jp_hint: '日本語の「ウ」に近いが唇をより丸める',
    mouth_tip: '唇を前に突き出して「ウ」',
    example_words: [
      { kr: '우리', jp: '私たち', romanization: 'u-ri' },
      { kr: '구름', jp: '雲', romanization: 'gu-reum' },
      { kr: '우산', jp: '傘', romanization: 'u-san' }
    ],
    minimal_pairs: ['ㅡ', 'ㅗ']
  },
  {
    char: 'ㅡ',
    romanization: 'eu',
    sound: '으',
    difficulty: 3,
    jp_hint: '日本語にない音。口を横に引いて「ウ」',
    mouth_tip: '唇を横に引いたまま、口の奥で「ウ」を発音',
    example_words: [
      { kr: '으로', jp: '〜へ・で（助詞）', romanization: 'eu-ro' },
      { kr: '크다', jp: '大きい', romanization: 'keu-da' },
      { kr: '음악', jp: '音楽', romanization: 'eu-mak' }
    ],
    minimal_pairs: ['ㅜ', 'ㅣ']
  },
  {
    char: 'ㅣ',
    romanization: 'i',
    sound: '이',
    difficulty: 1,
    jp_hint: '日本語の「イ」とほぼ同じ',
    mouth_tip: '口を横に引いて「イ」',
    example_words: [
      { kr: '이름', jp: '名前', romanization: 'i-reum' },
      { kr: '시간', jp: '時間', romanization: 'si-gan' },
      { kr: '미래', jp: '未来', romanization: 'mi-rae' }
    ],
    minimal_pairs: ['ㅡ', 'ㅔ']
  },
  {
    char: 'ㅐ',
    romanization: 'ae',
    sound: '애',
    difficulty: 2,
    jp_hint: '日本語の「エ」よりも口を大きく開ける',
    mouth_tip: '口を「ア」と「エ」の中間ぐらい開けて発音',
    example_words: [
      { kr: '애인', jp: '恋人', romanization: 'ae-in' },
      { kr: '아이', jp: '子供（애도同様）', romanization: 'a-i' },
      { kr: '개', jp: '犬', romanization: 'gae' }
    ],
    minimal_pairs: ['ㅔ', 'ㅏ']
  },
  {
    char: 'ㅔ',
    romanization: 'e',
    sound: '에',
    difficulty: 2,
    jp_hint: '日本語の「エ」に近い（ㅐよりやや口を閉じる）',
    mouth_tip: '口を少し開けて「エ」（現代語ではㅐとほぼ同音）',
    example_words: [
      { kr: '에서', jp: '〜で（助詞）', romanization: 'e-seo' },
      { kr: '세계', jp: '世界', romanization: 'se-gye' },
      { kr: '메뉴', jp: 'メニュー', romanization: 'me-nyu' }
    ],
    minimal_pairs: ['ㅐ', 'ㅣ']
  },
  {
    char: 'ㅑ',
    romanization: 'ya',
    sound: '야',
    difficulty: 1,
    jp_hint: '日本語の「ヤ」と同じ',
    mouth_tip: '「イ」から素早く「ア」へ移動',
    example_words: [
      { kr: '야채', jp: '野菜', romanization: 'ya-chae' },
      { kr: '야구', jp: '野球', romanization: 'ya-gu' },
      { kr: '여야', jp: '여야（与野党）', romanization: 'yeo-ya' }
    ],
    minimal_pairs: ['ㅏ', 'ㅕ']
  },
  {
    char: 'ㅕ',
    romanization: 'yeo',
    sound: '여',
    difficulty: 2,
    jp_hint: '「ヨ」に近いが「eo（어）」の口で発音',
    mouth_tip: '「イ」から素早く「어」へ移動',
    example_words: [
      { kr: '여기', jp: 'ここ', romanization: 'yeo-gi' },
      { kr: '여행', jp: '旅行', romanization: 'yeo-haeng' },
      { kr: '여자', jp: '女性', romanization: 'yeo-ja' }
    ],
    minimal_pairs: ['ㅓ', 'ㅛ']
  },
  {
    char: 'ㅛ',
    romanization: 'yo',
    sound: '요',
    difficulty: 1,
    jp_hint: '日本語の「ヨ」に近い',
    mouth_tip: '「イ」から素早く「オ」へ移動',
    example_words: [
      { kr: '요리', jp: '料理', romanization: 'yo-ri' },
      { kr: '오요', jp: 'yo（助詞・語尾）', romanization: 'yo' },
      { kr: '교실', jp: '教室', romanization: 'gyo-sil' }
    ],
    minimal_pairs: ['ㅗ', 'ㅕ']
  },
  {
    char: 'ㅠ',
    romanization: 'yu',
    sound: '유',
    difficulty: 1,
    jp_hint: '日本語の「ユ」に近い',
    mouth_tip: '「イ」から素早く「ウ」へ移動',
    example_words: [
      { kr: '유명', jp: '有名', romanization: 'yu-myeong' },
      { kr: '음유', jp: '吟遊', romanization: 'eu-myu' },
      { kr: '류', jp: '〜流', romanization: 'ryu' }
    ],
    minimal_pairs: ['ㅜ', 'ㅛ']
  },
  {
    char: 'ㅘ',
    romanization: 'wa',
    sound: '와',
    difficulty: 2,
    jp_hint: '日本語の「ワ」に近い',
    mouth_tip: '「ウ」から素早く「ア」へ移動',
    example_words: [
      { kr: '와', jp: 'わあ！（感嘆）', romanization: 'wa' },
      { kr: '과자', jp: 'お菓子', romanization: 'gwa-ja' },
      { kr: '화이팅', jp: 'ファイティング！', romanization: 'hwa-i-ting' }
    ],
    minimal_pairs: ['ㅏ', 'ㅝ']
  },
  {
    char: 'ㅝ',
    romanization: 'wo',
    sound: '워',
    difficulty: 3,
    jp_hint: '「ウォ」と発音（ウからオへ）',
    mouth_tip: '「ウ」から素早く「어」へ移動',
    example_words: [
      { kr: '워낙', jp: 'もともと・非常に', romanization: 'wo-nak' },
      { kr: '뭐', jp: '何', romanization: 'mwo' },
      { kr: '권리', jp: '権利', romanization: 'gwon-ri' }
    ],
    minimal_pairs: ['ㅓ', 'ㅘ']
  },
  {
    char: 'ㅚ',
    romanization: 'oe',
    sound: '외',
    difficulty: 3,
    jp_hint: 'ドイツ語の「ö」に近い（口をオ形にしてエ）',
    mouth_tip: '唇を「オ」の形に丸めて「エ」と発音',
    example_words: [
      { kr: '외국', jp: '外国', romanization: 'oe-guk' },
      { kr: '외롭다', jp: '孤独だ', romanization: 'oe-rop-da' },
      { kr: '최고', jp: '最高', romanization: 'choe-go' }
    ],
    minimal_pairs: ['ㅔ', 'ㅗ']
  },
  {
    char: 'ㅞ',
    romanization: 'we',
    sound: '웨',
    difficulty: 3,
    jp_hint: '「ウェ」と発音',
    mouth_tip: '「ウ」から「エ」へ移動',
    example_words: [
      { kr: '웨이터', jp: 'ウェイター', romanization: 'we-i-teo' },
      { kr: '궤도', jp: '軌道', romanization: 'gwe-do' },
      { kr: '웨', jp: '（感嘆・疑問）', romanization: 'we' }
    ],
    minimal_pairs: ['ㅔ', 'ㅚ']
  },
  {
    char: 'ㅟ',
    romanization: 'wi',
    sound: '위',
    difficulty: 2,
    jp_hint: '「ウィ」と発音（唇を丸めてイ）',
    mouth_tip: '「ウ」から素早く「イ」へ移動',
    example_words: [
      { kr: '위', jp: '上・胃', romanization: 'wi' },
      { kr: '위험', jp: '危険', romanization: 'wi-heom' },
      { kr: '귀', jp: '耳', romanization: 'gwi' }
    ],
    minimal_pairs: ['ㅣ', 'ㅜ']
  },
  {
    char: 'ㅢ',
    romanization: 'ui',
    sound: '의',
    difficulty: 3,
    jp_hint: '日本語にない音。「ウイ」を一音節で',
    mouth_tip: '「eu（으）」の口で「イ」を発音。または「エ」の音になることも',
    example_words: [
      { kr: '의사', jp: '医者', romanization: 'ui-sa' },
      { kr: '의미', jp: '意味', romanization: 'ui-mi' },
      { kr: '희망', jp: '希望', romanization: 'hi-mang' }
    ],
    minimal_pairs: ['ㅡ', 'ㅣ']
  },
  {
    char: 'ㅒ',
    romanization: 'yae',
    sound: '얘',
    difficulty: 2,
    jp_hint: '「ヤ」と「エ」の中間（ヤエ）',
    mouth_tip: '「イ」から「ㅐ(ae)」へ素早く移動',
    example_words: [
      { kr: '얘기', jp: '話・おしゃべり', romanization: 'yae-gi' },
      { kr: '얘', jp: 'こいつ・この子（会話）', romanization: 'yae' },
      { kr: '걔', jp: 'あいつ（会話）', romanization: 'gyae' }
    ],
    minimal_pairs: ['ㅐ', 'ㅖ']
  },
  {
    char: 'ㅖ',
    romanization: 'ye',
    sound: '예',
    difficulty: 2,
    jp_hint: '「イェ」と発音（ヤエよりも口が閉じ気味）',
    mouth_tip: '「イ」から「ㅔ(e)」へ素早く移動',
    example_words: [
      { kr: '예쁘다', jp: 'かわいい', romanization: 'ye-ppeu-da' },
      { kr: '예의', jp: '礼儀', romanization: 'ye-ui' },
      { kr: '네', jp: 'はい', romanization: 'ne' }
    ],
    minimal_pairs: ['ㅔ', 'ㅒ']
  },
  {
    char: 'ㅙ',
    romanization: 'wae',
    sound: '왜',
    difficulty: 2,
    jp_hint: '「ウェ」に近い（ワとエの中間）',
    mouth_tip: '「ウ」から「ㅐ(ae)」へ移動',
    example_words: [
      { kr: '왜', jp: 'なぜ', romanization: 'wae' },
      { kr: '왜냐하면', jp: 'なぜなら', romanization: 'wae-nya-ha-myeon' },
      { kr: '봐', jp: '見て（命令）', romanization: 'bwa' }
    ],
    minimal_pairs: ['ㅐ', 'ㅞ']
  }
];
