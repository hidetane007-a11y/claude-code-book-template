const MEASURE_WORDS_DATA = {
  sets: [
    {
      id: 1,
      questions: [
        { sentence: '一__茶',   noun_jp: 'お茶',        correct: '杯', choices: ['杯','本','张','只'],   explanation: '杯(bēi)は液体を入れる容器に使います' },
        { sentence: '一__书',   noun_jp: '本',          correct: '本', choices: ['本','杯','张','件'],   explanation: '本(běn)は本・帳面などに使います' },
        { sentence: '一__纸',   noun_jp: '紙',          correct: '张', choices: ['张','杯','只','双'],   explanation: '张(zhāng)は平らで薄いものに使います' },
        { sentence: '一__鸟',   noun_jp: '鳥',          correct: '只', choices: ['只','张','杯','辆'],   explanation: '只(zhī)は小さな動物に使います' },
        { sentence: '一__鱼',   noun_jp: '魚',          correct: '条', choices: ['条','张','杯','台'],   explanation: '条(tiáo)は細長いものに使います' }
      ]
    },
    {
      id: 2,
      questions: [
        { sentence: '一__衬衫', noun_jp: 'シャツ',      correct: '件', choices: ['件','条','杯','台'],   explanation: '件(jiàn)は衣類などに使います' },
        { sentence: '一__鞋',   noun_jp: '靴（1足）',    correct: '双', choices: ['双','只','件','瓶'],   explanation: '双(shuāng)はペアのものに使います' },
        { sentence: '一__钱',   noun_jp: 'お金（1元）',  correct: '块', choices: ['块','双','件','碗'],   explanation: '块(kuài)はお金の基本単位（元）に使います' },
        { sentence: '一__水',   noun_jp: '水（ボトル）', correct: '瓶', choices: ['瓶','块','杯','台'],   explanation: '瓶(píng)は瓶入りのものに使います' },
        { sentence: '一__饭',   noun_jp: 'ご飯（どんぶり）', correct: '碗', choices: ['碗','瓶','块','张'], explanation: '碗(wǎn)はお椀・どんぶりに使います' }
      ]
    },
    {
      id: 3,
      questions: [
        { sentence: '一__人',   noun_jp: '人',          correct: '个', choices: ['个','碗','台','辆'],   explanation: '个(gè)は最も汎用的な量詞。人・物など幅広く使えます' },
        { sentence: '一__电脑', noun_jp: 'パソコン',    correct: '台', choices: ['台','个','辆','匹'],   explanation: '台(tái)は機械・設備に使います' },
        { sentence: '一__车',   noun_jp: '車',          correct: '辆', choices: ['辆','台','个','棵'],   explanation: '辆(liàng)は車・自転車などに使います' },
        { sentence: '一__马',   noun_jp: '馬',          correct: '匹', choices: ['匹','辆','台','棵'],   explanation: '匹(pǐ)は馬に使います' },
        { sentence: '一__树',   noun_jp: '木',          correct: '棵', choices: ['棵','匹','辆','根'],   explanation: '棵(kē)は木・植物に使います' }
      ]
    },
    {
      id: 4,
      questions: [
        { sentence: '一__米',   noun_jp: '米（1粒）',    correct: '粒', choices: ['粒','棵','片','把'],   explanation: '粒(lì)は粒状のものに使います' },
        { sentence: '一__面包', noun_jp: 'パン（1切れ）', correct: '片', choices: ['片','粒','把','根'],   explanation: '片(piàn)は薄く切ったものに使います' },
        { sentence: '一__伞',   noun_jp: '傘',          correct: '把', choices: ['把','片','粒','套'],   explanation: '把(bǎ)は柄のあるものに使います' },
        { sentence: '一__筷子', noun_jp: '箸（1本）',    correct: '根', choices: ['根','把','片','套'],   explanation: '根(gēn)は細長い棒状のものに使います' },
        { sentence: '一__西装', noun_jp: 'スーツ（一揃い）', correct: '套', choices: ['套','根','把','件'], explanation: '套(tào)は一揃いのセットに使います' }
      ]
    }
  ]
};
