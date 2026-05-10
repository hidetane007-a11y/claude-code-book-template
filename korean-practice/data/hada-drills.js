/**
 * hada-drills.js - 하다動詞ドリルデータ
 */

window.HADA_STAGES = [
  {
    stage: 1,
    title: '現在形',
    subtitle: '합니다 / 해요',
    explanation: '하다動詞の基本形。합니다はフォーマル（改まった場面）、해요はカジュアル丁寧（日常会話）に使います。',
    examples: [
      { kr: '공부해요', jp: '勉強します', romanization: 'gong-bu-hae-yo' },
      { kr: '일합니다', jp: '働きます（フォーマル）', romanization: 'il-ham-ni-da' },
      { kr: '운동해요', jp: '運動します', romanization: 'un-dong-hae-yo' }
    ],
    drills: [
      {
        type: 'translate',
        question: '「毎日勉強します」を韓国語で（해요体）',
        answer: '매일 공부해요',
        hint: '공부하다 → 공부해요'
      },
      {
        type: 'choice',
        question: '「운동하다」の해요体は？',
        choices: ['운동해요', '운동합니다', '운동했어요', '운동하고'],
        answer: '운동해요',
        hint: '하다 → 해요'
      },
      {
        type: 'translate',
        question: '「料理します」を韓国語で（해요体）',
        answer: '요리해요',
        hint: '요리하다 → 요리해요'
      },
      {
        type: 'choice',
        question: '「일하다」の합니다体は？',
        choices: ['일해요', '일합니다', '일했어요', '일하면'],
        answer: '일합니다',
        hint: '하다 → 합니다（フォーマル）'
      },
      {
        type: 'translate',
        question: '「電話します」を韓国語で（합니다体）',
        answer: '전화합니다',
        hint: '전화하다 → 전화합니다'
      },
      {
        type: 'choice',
        question: '「노래하다」（歌う）の해요体は？',
        choices: ['노래합니다', '노래해요', '노래했어요', '노래하고'],
        answer: '노래해요',
        hint: '하다 → 해요'
      }
    ]
  },
  {
    stage: 2,
    title: '過去・未来・否定',
    subtitle: '했어요 / 할 거예요 / 안 해요',
    explanation: '過去形は「했어요」、未来形は「할 거예요」、否定は「안 해요」または「하지 않아요」を使います。',
    examples: [
      { kr: '공부했어요', jp: '勉強しました', romanization: 'gong-bu-haess-eo-yo' },
      { kr: '내일 운동할 거예요', jp: '明日運動するつもりです', romanization: 'nae-il un-dong-hal geo-ye-yo' },
      { kr: '오늘은 일 안 해요', jp: '今日は仕事しません', romanization: 'o-neu-reun il an hae-yo' }
    ],
    drills: [
      {
        type: 'translate',
        question: '「昨日運動しました」を韓国語で',
        answer: '어제 운동했어요',
        hint: '운동하다 → 운동했어요（過去形）'
      },
      {
        type: 'choice',
        question: '「공부하다」の過去形（해요体）は？',
        choices: ['공부할 거예요', '공부해요', '공부했어요', '공부하지 않아요'],
        answer: '공부했어요',
        hint: '하다 → 했어요（過去）'
      },
      {
        type: 'translate',
        question: '「明日旅行します（予定）」を韓国語で',
        answer: '내일 여행할 거예요',
        hint: '여행하다 → 여행할 거예요（未来）'
      },
      {
        type: 'choice',
        question: '「요리하다」の否定形（안）は？',
        choices: ['요리 안 해요', '안 요리해요', '요리없어요', '요리하지해요'],
        answer: '요리 안 해요',
        hint: '動詞の前に「안」をつける: 안 해요'
      },
      {
        type: 'translate',
        question: '「電話しませんでした」を韓国語で',
        answer: '전화 안 했어요',
        hint: '안 + 했어요'
      },
      {
        type: 'choice',
        question: '「내년에 결혼할 거예요」の意味は？',
        choices: ['去年結婚しました', '来年結婚するつもりです', '結婚したくないです', '明日結婚します'],
        answer: '来年結婚するつもりです',
        hint: '내년에 = 来年に、할 거예요 = するつもりです'
      }
    ]
  },
  {
    stage: 3,
    title: '接続形',
    subtitle: '하고 / 해서 / 하면',
    explanation: '하고は「して・と」（並列）、해서は「して・から」（理由/順序）、하면は「すれば・したら」（条件）を表します。',
    examples: [
      { kr: '공부하고 운동해요', jp: '勉強して運動します', romanization: 'gong-bu-ha-go un-dong-hae-yo' },
      { kr: '운동해서 건강해요', jp: '運動するので健康です', romanization: 'un-dong-hae-seo geon-gang-hae-yo' },
      { kr: '열심히 공부하면 합격해요', jp: '一生懸命勉強すれば合格します', romanization: 'yeol-sim-hi gong-bu-ha-myeon hap-gyeok-hae-yo' }
    ],
    drills: [
      {
        type: 'translate',
        question: '「働いて（から）休みます」を韓国語で',
        answer: '일해서 쉬어요',
        hint: '일하다 → 일해서（理由/順序）'
      },
      {
        type: 'choice',
        question: '「공부하다」の하고形は？',
        choices: ['공부해서', '공부하면', '공부하고', '공부했어요'],
        answer: '공부하고',
        hint: '하다 → 하고（並列・順序接続）'
      },
      {
        type: 'translate',
        question: '「料理すれば（したら）おいしいです」を韓国語で',
        answer: '요리하면 맛있어요',
        hint: '요리하다 → 요리하면（条件）'
      },
      {
        type: 'choice',
        question: '「피곤해서 쉬어요」の意味は？',
        choices: ['疲れているので休みます', '疲れたら休みます', '疲れて休みません', '休んで疲れました'],
        answer: '疲れているので休みます',
        hint: '피곤하다 = 疲れる、해서 = から/なので'
      },
      {
        type: 'translate',
        question: '「電話して話します」を韓国語で',
        answer: '전화하고 얘기해요',
        hint: '전화하다 → 전화하고（並列）'
      },
      {
        type: 'choice',
        question: '「운동하면」の意味は？',
        choices: ['運動して', '運動するから', '運動すれば', '運動した'],
        answer: '運動すれば',
        hint: '하면 = すれば（条件形）'
      }
    ]
  },
  {
    stage: 4,
    title: '尊敬語・進行形',
    subtitle: '하세요 / 하고 있어요',
    explanation: '尊敬語は「하세요」（〜してください/なさいます）、進行形は「하고 있어요」（〜しています）を使います。',
    examples: [
      { kr: '공부하세요', jp: 'お勉強なさいます / 勉強してください', romanization: 'gong-bu-ha-se-yo' },
      { kr: '지금 일하고 있어요', jp: '今仕事しています', romanization: 'ji-geum il-ha-go iss-eo-yo' },
      { kr: '여기서 기다리고 계세요', jp: 'こちらでお待ちになっています', romanization: 'yeo-gi-seo gi-da-ri-go gye-se-yo' }
    ],
    drills: [
      {
        type: 'translate',
        question: '「今勉強しています」を韓国語で（進行形）',
        answer: '지금 공부하고 있어요',
        hint: '공부하다 → 공부하고 있어요'
      },
      {
        type: 'choice',
        question: '「운동하다」の尊敬語（하세요）は？',
        choices: ['운동해요', '운동했어요', '운동하세요', '운동하고 있어요'],
        answer: '운동하세요',
        hint: '하다 → 하세요（尊敬語）'
      },
      {
        type: 'translate',
        question: '「料理してください（お願い）」を韓国語で',
        answer: '요리해 주세요',
        hint: '요리하다 → 요리해 주세요（お願いの표현）'
      },
      {
        type: 'choice',
        question: '「일하고 있어요」の意味は？',
        choices: ['仕事します', '仕事してください', '仕事しています', '仕事しました'],
        answer: '仕事しています',
        hint: '하고 있어요 = 〜しています（進行形）'
      },
      {
        type: 'translate',
        question: '「先生は今お食事中です（尊敬）」を韓国語で',
        answer: '선생님은 지금 식사하고 계세요',
        hint: '식사하다 → 하고 계세요（尊敬・進行）'
      },
      {
        type: 'choice',
        question: '「어서 오세요」の意味は？',
        choices: ['行ってください', 'いらっしゃいませ', 'ありがとうございます', 'お待ちください'],
        answer: 'いらっしゃいませ',
        hint: '어서 오세요 = いらっしゃいませ（定型表現）'
      }
    ]
  }
];
