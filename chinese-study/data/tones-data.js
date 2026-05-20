const TONES_DATA = {
  stages: [
    {
      id: 1,
      name: '第一声・第二声',
      questions: [
        { zh: '妈', pinyin: 'mā', pinyin_no_tone: 'ma', tone: 1, meaning: 'お母さん' },
        { zh: '麻', pinyin: 'má', pinyin_no_tone: 'ma', tone: 2, meaning: '麻・しびれ' },
        { zh: '马', pinyin: 'mǎ', pinyin_no_tone: 'ma', tone: 3, meaning: '馬' },
        { zh: '骂', pinyin: 'mà', pinyin_no_tone: 'ma', tone: 4, meaning: 'ののしる' },
        { zh: '书', pinyin: 'shū', pinyin_no_tone: 'shu', tone: 1, meaning: '本' },
        { zh: '熟', pinyin: 'shú', pinyin_no_tone: 'shu', tone: 2, meaning: '熟している' }
      ]
    },
    {
      id: 2,
      name: '第三声・第四声',
      questions: [
        { zh: '飞', pinyin: 'fēi', pinyin_no_tone: 'fei', tone: 1, meaning: '飛ぶ' },
        { zh: '红', pinyin: 'hóng', pinyin_no_tone: 'hong', tone: 2, meaning: '赤い' },
        { zh: '好', pinyin: 'hǎo', pinyin_no_tone: 'hao', tone: 3, meaning: '良い' },
        { zh: '大', pinyin: 'dà', pinyin_no_tone: 'da', tone: 4, meaning: '大きい' },
        { zh: '天', pinyin: 'tiān', pinyin_no_tone: 'tian', tone: 1, meaning: '空・天' },
        { zh: '来', pinyin: 'lái', pinyin_no_tone: 'lai', tone: 2, meaning: '来る' }
      ]
    },
    {
      id: 3,
      name: '4声 混合練習',
      questions: [
        { zh: '高', pinyin: 'gāo', pinyin_no_tone: 'gao', tone: 1, meaning: '高い' },
        { zh: '学', pinyin: 'xué', pinyin_no_tone: 'xue', tone: 2, meaning: '学ぶ' },
        { zh: '水', pinyin: 'shuǐ', pinyin_no_tone: 'shui', tone: 3, meaning: '水' },
        { zh: '是', pinyin: 'shì', pinyin_no_tone: 'shi', tone: 4, meaning: '〜です' },
        { zh: '三', pinyin: 'sān', pinyin_no_tone: 'san', tone: 1, meaning: '3' },
        { zh: '国', pinyin: 'guó', pinyin_no_tone: 'guo', tone: 2, meaning: '国' }
      ]
    },
    {
      id: 4,
      name: '軽声を含む総合練習',
      questions: [
        { zh: '吗', pinyin: 'ma', pinyin_no_tone: 'ma', tone: 0, meaning: '〜か（疑問助詞）' },
        { zh: '妈', pinyin: 'mā', pinyin_no_tone: 'ma', tone: 1, meaning: 'お母さん' },
        { zh: '了', pinyin: 'le', pinyin_no_tone: 'le', tone: 0, meaning: '〜した（完了助詞）' },
        { zh: '的', pinyin: 'de', pinyin_no_tone: 'de', tone: 0, meaning: '〜の（助詞）' },
        { zh: '热', pinyin: 'rè', pinyin_no_tone: 're', tone: 4, meaning: '暑い・熱い' },
        { zh: '地', pinyin: 'dì', pinyin_no_tone: 'di', tone: 4, meaning: '大地' }
      ]
    }
  ]
};
