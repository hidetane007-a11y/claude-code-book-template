window.VERB_STAGES = [
  {
    stage: 1, title: 'Simple Present', subtitle: 'Third person singular / Questions / Negatives',
    explanation: 'Use simple present for habits and facts. Add -s/-es for he/she/it. Use "do/does" for questions and negatives.',
    examples: [
      { en: 'She works at a bank.', jp: '彼女は銀行で働いています。' },
      { en: 'Does he attend the meeting?', jp: '彼は会議に出席しますか？' },
      { en: 'They don\'t use that software.', jp: '彼らはそのソフトを使いません。' }
    ],
    drills: [
      { type: 'choice', question: 'Choose the correct form: "She ___ the report every week."', choices: ['write', 'writes', 'writing', 'written'], answer: 'writes', hint: 'She/He/It → add -s to the verb' },
      { type: 'choice', question: 'Choose the correct question: "___ he attend the weekly meeting?"', choices: ['Do', 'Does', 'Is', 'Are'], answer: 'Does', hint: 'He/She/It → use "Does"' },
      { type: 'choice', question: '"They ___ work on weekends." (negative)', choices: ['don\'t', 'doesn\'t', 'isn\'t', 'aren\'t'], answer: 'don\'t', hint: 'They/We/I → use "don\'t"' },
      { type: 'choice', question: '"The CEO ___ final decisions." Complete with correct form of "make".', choices: ['make', 'makes', 'making', 'made'], answer: 'makes', hint: 'The CEO = He/She → makes' },
      { type: 'choice', question: 'Choose the correct negative: "Our team ___ travel internationally."', choices: ['don\'t', 'doesn\'t', 'haven\'t', 'isn\'t'], answer: 'doesn\'t', hint: 'Our team = It → doesn\'t' },
      { type: 'choice', question: '"___ the finance team approve all budgets?" What is correct?', choices: ['Do', 'Does', 'Is', 'Have'], answer: 'Does', hint: '"The finance team" = single entity → Does' }
    ]
  },
  {
    stage: 2, title: 'Past Tense', subtitle: 'Regular & Irregular Verbs',
    explanation: 'Simple past describes completed actions. Regular verbs add -ed. Many common verbs are irregular (go→went, have→had, make→made).',
    examples: [
      { en: 'We launched the product last quarter.', jp: '私たちは前四半期に製品を発売しました。' },
      { en: 'The team made significant progress.', jp: 'チームは大きな進歩を遂げました。' },
      { en: 'Did you attend yesterday\'s meeting?', jp: '昨日の会議に出席しましたか？' }
    ],
    drills: [
      { type: 'choice', question: '"We ___ the project last month." (complete)', choices: ['complete', 'completed', 'completing', 'completes'], answer: 'completed', hint: 'Regular verb: complete → completed' },
      { type: 'choice', question: 'Irregular past tense of "go": "She ___ to the conference."', choices: ['goed', 'gone', 'went', 'going'], answer: 'went', hint: 'Irregular: go → went (not "goed")' },
      { type: 'choice', question: '"The client ___ our proposal." Past tense of "approve".', choices: ['approved', 'approves', 'approving', 'approval'], answer: 'approved', hint: 'approve + d = approved' },
      { type: 'choice', question: 'Past tense of "have": "They ___ a productive session."', choices: ['haved', 'have', 'had', 'has'], answer: 'had', hint: 'Irregular: have → had' },
      { type: 'choice', question: '"___ you send the report before the deadline?"', choices: ['Did', 'Do', 'Done', 'Have'], answer: 'Did', hint: 'Questions in simple past use "did"' },
      { type: 'choice', question: '"The deal ___ through negotiations." Past of "go through".', choices: ['go', 'gone', 'went', 'goes'], answer: 'went', hint: 'Phrasal verb: go through → went through' }
    ]
  },
  {
    stage: 3, title: 'Present Perfect', subtitle: 'have done / have been',
    explanation: 'Use present perfect for past actions with present relevance. "Have/has + past participle." Common with: already, yet, just, recently, ever, never.',
    examples: [
      { en: 'I have already submitted the report.', jp: '私はすでに報告書を提出しました。' },
      { en: 'Have you reviewed the contract yet?', jp: 'もう契約書を確認しましたか？' },
      { en: 'She has been working here for five years.', jp: '彼女はここで5年間働いています。' }
    ],
    drills: [
      { type: 'choice', question: '"I ___ the presentation slides." (just finish)', choices: ['finish', 'finished', 'have finished', 'finishing'], answer: 'have finished', hint: 'Use present perfect: have + past participle' },
      { type: 'choice', question: '"___ you ever negotiated a contract before?"', choices: ['Do', 'Did', 'Have', 'Are'], answer: 'Have', hint: '"Ever" signals present perfect: Have you ever...?' },
      { type: 'choice', question: '"The company ___ significant growth recently."', choices: ['achieved', 'achieves', 'has achieved', 'achieving'], answer: 'has achieved', hint: '"Recently" often signals present perfect: has + achieved' },
      { type: 'choice', question: '"She ___ in sales for ten years." (duration up to now)', choices: ['worked', 'works', 'has worked', 'is working'], answer: 'has worked', hint: 'For duration up to now: has + worked' },
      { type: 'choice', question: '"Have you ___ the manager yet?"', choices: ['contact', 'contacted', 'contacting', 'contacts'], answer: 'contacted', hint: 'Have + past participle: contacted' },
      { type: 'choice', question: '"We ___ already ___ the offer." Which is correct?', choices: ['have / accepted', 'had / accepted', 'did / accept', 'are / accepting'], answer: 'have / accepted', hint: '"Already" with present perfect: have already accepted' }
    ]
  },
  {
    stage: 4, title: 'Future Forms', subtitle: 'will / be going to / present progressive',
    explanation: 'Will: spontaneous decisions and predictions. Be going to: plans and intentions. Present progressive: fixed arrangements. "I\'ll call you back." / "We\'re going to launch next month." / "The meeting is starting at 2."',
    examples: [
      { en: 'I\'ll send you the file right away.', jp: 'すぐにファイルをお送りします。' },
      { en: 'We\'re going to expand to Asia next year.', jp: 'Coming year私たちはアジアに展開する予定です。' },
      { en: 'The conference is starting at 9 AM.', jp: 'その会議は午前9時に始まります。' }
    ],
    drills: [
      { type: 'choice', question: 'Spontaneous offer: "Don\'t worry, I ___ help you with that."', choices: ['am going to', '\'ll', 'going to', 'am helping'], answer: '\'ll', hint: 'Spontaneous decisions → will (\'ll)' },
      { type: 'choice', question: 'Fixed plan: "We ___ launch the product in March." (planned before)', choices: ['will', '\'ll', 'are going to', 'going to'], answer: 'are going to', hint: 'Pre-made plans → be going to' },
      { type: 'choice', question: 'Fixed arrangement: "The CEO ___ arrive at 3 PM tomorrow."', choices: ['will arrive', 'arrives', 'is arriving', 'going to arrive'], answer: 'is arriving', hint: 'Scheduled/confirmed arrangement → present progressive' },
      { type: 'choice', question: 'Prediction based on evidence: "Look at those numbers — we ___ exceed our target!"', choices: ['will', 'are going to', '\'ll', 'going'], answer: 'are going to', hint: 'Evidence-based prediction → be going to' },
      { type: 'choice', question: '"___ you be available for the call tomorrow afternoon?"', choices: ['Will', 'Are going to', 'Do', 'Shall'], answer: 'Will', hint: 'Asking about future availability → Will you...?' },
      { type: 'choice', question: '"I think the market ___ recover by next quarter."', choices: ['recovers', 'recovered', 'will recover', 'is recovering'], answer: 'will recover', hint: 'Opinion/prediction about future → will' }
    ]
  }
];

window.PATTERN_STAGES = [
  {
    stage: 1, title: 'Offers & Suggestions', subtitle: 'I\'d like to / Could I / Shall I',
    explanation: '"I\'d like to" is polite intention. "Could I" asks for permission. "Shall I" offers help. These are essential for professional settings.',
    examples: [
      { en: 'I\'d like to schedule a meeting.', jp: '会議をスケジュールしたいと思います。' },
      { en: 'Could I ask you a question?', jp: '質問してもよろしいでしょうか？' },
      { en: 'Shall I send you the details?', jp: '詳細をお送りしましょうか？' }
    ],
    drills: [
      { type: 'choice', question: 'Politely say you want to discuss the budget: "___ discuss the budget in more detail."', choices: ['I want to', 'I\'d like to', 'I will', 'Could I'], answer: 'I\'d like to', hint: 'Polite intention: I\'d like to + verb' },
      { type: 'choice', question: 'Ask for permission to leave early: "___ leave a bit early today?"', choices: ['Shall I', 'I\'d like to', 'Could I', 'Would I'], answer: 'Could I', hint: 'Asking permission: Could I...?' },
      { type: 'choice', question: 'Offer to take notes: "___ take the meeting minutes for you?"', choices: ['Could I', 'I\'d like to', 'Shall I', 'Would I'], answer: 'Shall I', hint: 'Offering to help: Shall I...?' },
      { type: 'choice', question: '"___ propose a different approach?" (asking for permission politely)', choices: ['Shall I', 'Could I', 'I will', 'Am I allowed'], answer: 'Could I', hint: 'Could I = polite permission request' },
      { type: 'choice', question: 'Which is most polite for expressing what you want?', choices: ['I want to speak with the manager.', 'I\'d like to speak with the manager.', 'Give me the manager.', 'I will speak with the manager.'], answer: 'I\'d like to speak with the manager.', hint: 'I\'d like to is more polite than "I want to"' },
      { type: 'choice', question: '"___ I make a copy of this document?"', choices: ['Will', 'Shall', 'Could', 'Would I'], answer: 'Could', hint: 'Could I = polite permission, more formal than "Can I"' }
    ]
  },
  {
    stage: 2, title: 'Requests & Asking Favors', subtitle: 'Could you / Would you mind / I was wondering if',
    explanation: '"Could you" is polite request. "Would you mind + -ing" is very polite. "I was wondering if you could" is the most formal/indirect.',
    examples: [
      { en: 'Could you send me the report?', jp: '報告書を送っていただけますか？' },
      { en: 'Would you mind postponing the meeting?', jp: '会議を延期していただけますか？' },
      { en: 'I was wondering if you could review this.', jp: 'これを確認していただけないかと思いまして。' }
    ],
    drills: [
      { type: 'choice', question: 'Simple polite request: "___ you forward this email to the team?"', choices: ['Can', 'Could', 'Would you mind', 'I was wondering'], answer: 'Could', hint: 'Could you = polite request' },
      { type: 'choice', question: 'Very polite: "___ closing the window?" (asks not to mind)', choices: ['Could you', 'Would you mind', 'Can you', 'Will you'], answer: 'Would you mind', hint: 'Would you mind + -ing form' },
      { type: 'choice', question: '"Would you mind ___ the meeting by one hour?"', choices: ['delay', 'to delay', 'delaying', 'delayed'], answer: 'delaying', hint: 'Would you mind + verb-ing' },
      { type: 'choice', question: 'Most indirect/formal: "___ if you could help me with this?"', choices: ['Could you', 'Would you', 'I was wondering', 'Can you'], answer: 'I was wondering', hint: '"I was wondering if you could..." is the most indirect' },
      { type: 'choice', question: '"___ you handle the client presentation tomorrow?"', choices: ['Could', 'Would you mind', 'I was wondering if', 'Shall'], answer: 'Could', hint: 'Direct but polite request: Could you...?' },
      { type: 'choice', question: 'Choose the most professional way to ask for a deadline extension:', choices: ['Give me more time.', 'I need more time.', 'I was wondering if I could have a brief extension.', 'Can I have more time?'], answer: 'I was wondering if I could have a brief extension.', hint: '"I was wondering if..." is the most professional/indirect' }
    ]
  },
  {
    stage: 3, title: 'Agreeing & Disagreeing', subtitle: 'I agree / I see your point but / Actually',
    explanation: 'In professional settings, disagreement should be diplomatic. Use "I see your point, but..." or "Actually, I think..." to soften disagreements.',
    examples: [
      { en: 'I completely agree with your proposal.', jp: 'あなたの提案に完全に同意します。' },
      { en: 'I see your point, but I have some concerns.', jp: 'おっしゃる意味はわかりますが、懸念点があります。' },
      { en: 'Actually, I think we should reconsider.', jp: '実は、再考すべきだと思います。' }
    ],
    drills: [
      { type: 'choice', question: 'Strong agreement: "I ___ with your assessment of the market."', choices: ['totally agree', 'see your point', 'actually think', 'must disagree'], answer: 'totally agree', hint: 'Strong agreement: totally/completely agree' },
      { type: 'choice', question: 'Diplomatic disagreement starter: "___, but our data shows different results."', choices: ['You\'re wrong', 'I disagree', 'I see your point', 'That\'s incorrect'], answer: 'I see your point', hint: '"I see your point, but..." softens disagreement' },
      { type: 'choice', question: 'Polite correction: "___, the deadline is next Friday, not Thursday."', choices: ['No,', 'Wrong,', 'Actually,', 'Listen,'], answer: 'Actually,', hint: '"Actually" politely introduces a correction' },
      { type: 'choice', question: 'Partial agreement: "That\'s a valid point. ___, we need to consider the budget."', choices: ['However', 'But', 'Yet', 'However'], answer: 'However', hint: '"However" is more formal than "but" for business writing' },
      { type: 'choice', question: 'Which response is most professionally appropriate when you disagree?', choices: ['That\'s wrong.', 'I disagree.', 'I understand your perspective. However, I have a different view.', 'You\'re mistaken.'], answer: 'I understand your perspective. However, I have a different view.', hint: 'Acknowledge the other view first, then state your position' },
      { type: 'choice', question: '"I ___ that this approach could work, but let\'s also consider the risks."', choices: ['agree', 'concede', 'can see', 'believe'], answer: 'can see', hint: '"I can see that..." = acknowledging validity while maintaining your position' }
    ]
  },
  {
    stage: 4, title: 'Conditionals & Assumptions', subtitle: 'If / Assuming that / In case',
    explanation: '"If" for real conditions. "Assuming that" for business hypotheticals. "In case" for precautions. These are vital for planning discussions.',
    examples: [
      { en: 'If we increase the budget, results will improve.', jp: '予算を増やせば、結果は改善するでしょう。' },
      { en: 'Assuming that demand holds, we\'ll hit our targets.', jp: '需要が維持されると仮定すれば、目標を達成できます。' },
      { en: 'Send a backup copy in case the server goes down.', jp: 'サーバーがダウンした場合に備えてバックアップを送ってください。' }
    ],
    drills: [
      { type: 'choice', question: '"___ we launch on time, the market window is ideal."', choices: ['Assuming that', 'In case', 'As if', 'Unless'], answer: 'Assuming that', hint: '"Assuming that" = treating something as true for discussion purposes' },
      { type: 'choice', question: '"Please keep my contact details ___ you need to reach me urgently."', choices: ['if', 'in case', 'assuming', 'unless'], answer: 'in case', hint: '"In case" = as a precaution for a possible future situation' },
      { type: 'choice', question: '"___ we reduce costs, profitability will increase." (real condition)', choices: ['Assuming that', 'If', 'In case', 'Unless'], answer: 'If', hint: '"If" for real/possible conditions' },
      { type: 'choice', question: '"The deal ___ succeed ___ both parties agree to the terms."', choices: ['will / if', 'would / assuming', 'can / in case', 'might / unless'], answer: 'will / if', hint: 'Real conditional: If + present → will + base verb' },
      { type: 'choice', question: '"___ the project is approved, we should start hiring immediately."', choices: ['In case', 'Unless', 'If', 'Assuming that'], answer: 'If', hint: '"If" for straightforward conditions and consequences' },
      { type: 'choice', question: 'Business hypothetical: "___ everything goes as planned, we\'re on track to deliver Q3."', choices: ['In case', 'If', 'Assuming that', 'Unless'], answer: 'Assuming that', hint: '"Assuming that" is preferred in business for optimistic scenarios' }
    ]
  }
];
