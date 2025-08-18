/**
 * DCF分析の警告・注意事項に関する詳細説明
 * 初心者向けに分かりやすく解説し、対処方法も提供
 */

export interface WarningHelpInfo {
  title: string
  explanation: string
  impact: string
  solutions: string[]
  severity: 'low' | 'medium' | 'high'
  category: 'input' | 'calculation' | 'result' | 'market'
}

export const WARNING_HELP_TEXTS: Record<string, WarningHelpInfo> = {
  // ビジネスルール関連の警告
  unrealistic_inflation: {
    title: "インフレ率が非現実的な値です",
    explanation: "設定されたインフレ率が日本の過去実績や将来予測から大きく外れています。過度に楽観的または悲観的な想定は、投資判断を誤る原因となります。",
    impact: "家賃収入、運営費、物件価格の将来予測に影響し、最終的な投資収益の計算結果が現実離れしたものになる可能性があります。",
    solutions: [
      "日銀の物価目標（2%）を参考に設定する",
      "過去20年の実績（0-2%程度）を考慮する", 
      "保守的に1-2%程度で設定する",
      "複数のシナリオ（楽観・中立・悲観）で分析する"
    ],
    severity: 'medium',
    category: 'input'
  },

  high_rent_decay: {
    title: "家賃逓減率が高すぎる可能性があります",
    explanation: "設定された家賃逓減率が一般的な水準を上回っています。過度に高い逓減率は、物件の将来価値を過小評価する原因となります。",
    impact: "将来の家賃収入が過度に低く見積もられ、投資魅力度が実際より低く算出される可能性があります。",
    solutions: [
      "物件タイプに応じた適切な率を設定（住宅：0.5-2%、商業：1-3%）",
      "立地の将来性を考慮（好立地ほど逓減率は低め）",
      "適切な維持管理による逓減抑制効果を考慮",
      "周辺の類似物件の実績を調査"
    ],
    severity: 'medium',
    category: 'input'
  },

  high_price_decay: {
    title: "物件価値逓減率が高すぎる可能性があります",
    explanation: "設定された価値逓減率が一般的な水準を上回っています。過度に高い逓減率は、売却時の回収額を過小評価する原因となります。",
    impact: "売却価格が過度に低く見積もられ、投資の出口戦略が過度に悲観的になる可能性があります。",
    solutions: [
      "築年数と立地を考慮した適切な率を設定",
      "好立地物件は逓減率を低めに設定",
      "将来の再開発予定などの要因を考慮",
      "類似物件の売却実績を参考にする"
    ],
    severity: 'medium',
    category: 'input'
  },

  high_vacancy_rate: {
    title: "空室率が高すぎる可能性があります", 
    explanation: "設定された空室率が市場平均を大きく上回っています。過度に高い空室率は収益性を過小評価する原因となります。",
    impact: "賃料収入が過度に低く見積もられ、投資魅力度が実際より低く算出される可能性があります。",
    solutions: [
      "地域の実際の空室率データを調査",
      "物件タイプに応じた適切な率を設定",
      "立地条件や設備状況を考慮",
      "管理会社の意見を参考にする"
    ],
    severity: 'medium',
    category: 'input'
  },

  high_ltv_ratio: {
    title: "借入比率（LTV）が高すぎる可能性があります",
    explanation: "借入額が物件価格に対して過度に高い比率となっています。高LTVは財務リスクを高め、金利上昇時の影響を拡大させます。",
    impact: "金利上昇リスクや空室リスクが顕在化した際の返済負担が重くなり、投資の安全性が低下します。",
    solutions: [
      "自己資金比率を20-30%以上に設定",
      "金融機関の融資条件を確認",
      "返済余力を十分に確保",
      "金利上昇時のシミュレーションを実施"
    ],
    severity: 'high',
    category: 'input'
  },

  high_interest_rate: {
    title: "借入金利が高すぎる可能性があります",
    explanation: "設定された借入金利が現在の市場水準を大きく上回っています。高金利は投資収益性を大幅に悪化させます。",
    impact: "毎月の返済負担が重くなり、キャッシュフローが悪化し、投資収益性が低下します。",
    solutions: [
      "複数の金融機関で条件を比較検討",
      "金利優遇条件の活用を検討",
      "借り換えの可能性を検討",
      "固定金利への変更を検討"
    ],
    severity: 'high',
    category: 'input'
  },

  short_loan_term_vs_holding: {
    title: "返済期間が保有期間より短く設定されています",
    explanation: "融資の返済期間が投資予定期間より短いため、売却時に残債が発生します。売却価格が残債を下回るリスクがあります。",
    impact: "売却時に残債の一括返済が必要となり、売却価格によっては追加資金が必要になる可能性があります。",
    solutions: [
      "返済期間の延長を金融機関に相談",
      "保有期間の延長を検討",
      "繰上返済による残債削減を計画",
      "売却以外の出口戦略を検討"
    ],
    severity: 'medium',
    category: 'input'
  },

  equity_discount_lower_than_asset: {
    title: "エクイティ割引率がアセット割引率より低く設定されています",
    explanation: "通常、借入によるレバレッジはリスクを高めるため、エクイティ割引率はアセット割引率より高く設定すべきです。",
    impact: "投資のリスクが過小評価され、実際よりも魅力的な投資に見える可能性があります。",
    solutions: [
      "エクイティ割引率をアセット割引率+2-5%程度に設定",
      "借入によるリスク増加を適切に反映",
      "個人のリスク許容度に応じて調整",
      "複数のシナリオで分析"
    ],
    severity: 'medium',
    category: 'input'
  },

  // 計算結果関連の警告
  negative_noi: {
    title: "営業純利益（NOI）がマイナスの年があります",
    explanation: "運営費や税金が賃料収入を上回る年があります。これは投資として持続可能でない状況を示しています。",
    impact: "その年は物件が赤字となり、追加の資金投入が必要になります。長期的な投資戦略の見直しが必要です。",
    solutions: [
      "家賃設定を市場相場と比較検討",
      "運営費の削減可能性を検討", 
      "空室率の改善策を検討",
      "物件の付加価値向上を検討"
    ],
    severity: 'high',
    category: 'calculation'
  },

  negative_sale_price: {
    title: "売却時の物件価格がゼロ以下になっています",
    explanation: "価格逓減率が過度に高いか、保有期間が長すぎるため、売却時の物件価格が現実的でない値になっています。",
    impact: "投資の出口戦略が成立せず、売却による回収が困難になる可能性があります。",
    solutions: [
      "価格逓減率を現実的な値に調整",
      "保有期間を短縮する",
      "インフレ率と逓減率のバランスを見直す",
      "物件の立地や将来性を再評価"
    ],
    severity: 'high',
    category: 'calculation'
  },

  volatile_equity_cashflow: {
    title: "エクイティキャッシュフローが不安定です",
    explanation: "借入返済の負担により、年次のキャッシュフローが大きく変動しています。これは資金繰りの問題を引き起こす可能性があります。",
    impact: "投資期間中の資金繰りが不安定になり、追加の資金投入が必要になるリスクがあります。",
    solutions: [
      "返済期間の延長を検討",
      "借入金額の削減",
      "金利条件の改善",
      "元利均等返済への変更を検討"
    ],
    severity: 'medium',
    category: 'calculation'
  },

  exit_dependent_investment: {
    title: "期末売却に依存した投資パターンです",
    explanation: "IRRは高いですが、収益の大部分が期末の売却収入に依存しています。売却価格の変動リスクが大きい投資パターンです。",
    impact: "売却時の市場環境や物件状況により、想定収益が大きく変動するリスクがあります。",
    solutions: [
      "売却前提を保守的に見直す",
      "保有期間を延長して運営収益を重視",
      "キャッシュフローの安定性を確認",
      "複数の出口戦略を検討"
    ],
    severity: 'medium',
    category: 'result'
  },

  unrealistic_irr_asset: {
    title: "アセットIRRが異常な値です",
    explanation: "計算されたアセットIRRが一般的な不動産投資の範囲（-95%～500%）を外れています。入力条件に問題がある可能性があります。",
    impact: "投資判断の基準となるIRRが信頼できない値となっており、適切な判断ができません。",
    solutions: [
      "入力値を再確認（特に売却価格の前提）",
      "インフレ率と逓減率のバランスを確認",
      "保有期間の妥当性を確認",
      "複数のシナリオで再計算"
    ],
    severity: 'high',
    category: 'result'
  },

  unrealistic_irr_equity: {
    title: "エクイティIRRが異常な値です",
    explanation: "計算されたエクイティIRRが一般的な不動産投資の範囲を外れています。借入条件や投資前提に問題がある可能性があります。",
    impact: "自己資本に対するリターンの評価が適切にできず、投資判断に支障をきたします。",
    solutions: [
      "借入条件（金利、期間、金額）を再確認",
      "レバレッジ効果が適切に働いているか確認",
      "キャッシュフローの妥当性を確認",
      "アセットIRRとの整合性を確認"
    ],
    severity: 'high',
    category: 'result'
  },

  market_inconsistent_cap: {
    title: "暗黙のキャップレートが市場相場から大きく乖離しています",
    explanation: "計算された暗黙のキャップレートが、対象市場の一般的な範囲（1-20%）から外れています。売却前提が非現実的な可能性があります。",
    impact: "売却価格の前提が市場実態と合わず、実際の売却時に想定と大きく異なる結果となる可能性があります。",
    solutions: [
      "市場のキャップレート相場を調査",
      "価格逓減率とインフレ率のバランスを調整",
      "類似物件の売却事例を参考にする",
      "不動産会社の意見を参考にする"
    ],
    severity: 'medium',
    category: 'market'
  },

  // IRR計算関連のエラー
  irr_no_solution: {
    title: "IRR計算の解が存在しません",
    explanation: "キャッシュフローの特性により、IRRの計算ができませんでした。全てのキャッシュフローが同じ符号（全てプラスまたは全てマイナス）の場合に発生します。",
    impact: "IRRによる投資判断ができないため、NPVなど他の指標を重視する必要があります。",
    solutions: [
      "初期投資額（マイナス）があることを確認",
      "将来キャッシュフロー（プラス）があることを確認",
      "キャッシュフローの符号変化があることを確認",
      "NPVによる判断を重視する"
    ],
    severity: 'high',
    category: 'calculation'
  },

  irr_convergence_failed: {
    title: "IRR計算が収束しませんでした",
    explanation: "数値計算の過程で解が収束せず、正確なIRRを算出できませんでした。複雑なキャッシュフローパターンで発生することがあります。",
    impact: "正確なIRRが不明のため、この指標による投資判断は慎重に行う必要があります。",
    solutions: [
      "キャッシュフローの妥当性を再確認",
      "NPVによる判断を重視する",
      "投資期間や条件を調整して再計算",
      "専門家への相談を検討"
    ],
    severity: 'medium',
    category: 'calculation'
  }
}

// 警告カテゴリ別の説明
export const WARNING_CATEGORIES = {
  input: {
    title: "入力値の警告",
    description: "入力された値が一般的な範囲を外れているか、整合性に問題がある可能性があります。",
    color: "yellow"
  },
  calculation: {
    title: "計算処理の警告", 
    description: "計算過程で問題が発生したか、計算結果に疑問がある状況です。",
    color: "orange"
  },
  result: {
    title: "結果の警告",
    description: "計算結果が非現実的な値となっており、前提条件の見直しが必要な可能性があります。",
    color: "red"
  },
  market: {
    title: "市場整合性の警告",
    description: "市場相場や一般的な投資基準と比較して、前提条件に疑問がある状況です。",
    color: "blue"
  }
}

// 一般的な注意事項とガイドライン
export const GENERAL_GUIDELINES = {
  title: "DCF分析を行う際の一般的な注意事項",
  items: [
    {
      title: "保守的な前提設定",
      description: "楽観的すぎる前提は投資判断を誤る原因となります。むしろ保守的な前提で分析し、それでも投資価値がある物件を選びましょう。",
      importance: "high"
    },
    {
      title: "複数シナリオでの分析",
      description: "楽観・中立・悲観の3つのシナリオで分析し、悲観シナリオでも許容できる結果かを確認しましょう。",
      importance: "high"
    },
    {
      title: "市場相場との比較",
      description: "計算結果は必ず市場相場と比較し、現実的な値かどうかを確認してください。",
      importance: "medium"
    },
    {
      title: "キャッシュフローの重視",
      description: "IRRやNPVも重要ですが、実際の資金繰りに影響するキャッシュフローの安定性も重視しましょう。",
      importance: "high"
    },
    {
      title: "専門家への相談",
      description: "重要な投資判断の前には、不動産業者、会計士、税理士などの専門家に相談することをお勧めします。",
      importance: "medium"
    },
    {
      title: "定期的な見直し",
      description: "投資実行後も定期的に実績と予測を比較し、必要に応じて戦略を見直しましょう。",
      importance: "medium"
    }
  ]
}

// よくある問題パターンと解決方法
export const COMMON_ISSUES = [
  {
    pattern: "IRRは高いがNPVが低い",
    explanation: "期末の売却収入に大きく依存している「期末頼み」の投資パターンです。",
    risks: ["売却価格の変動リスクが大きい", "途中のキャッシュフローが薄い", "売却時期の制約"],
    solutions: [
      "売却前提を保守的に見直す",
      "保有期間を延長して運営収益を重視",
      "キャッシュフローの安定性を確認",
      "複数の出口戦略を検討"
    ]
  },
  {
    pattern: "エクイティキャッシュフローが不安定",
    explanation: "借入返済の負担により、年次のキャッシュフローが不安定になっているパターンです。",
    risks: ["資金繰りの悪化", "追加投資の必要性", "売却の制約"],
    solutions: [
      "返済期間の延長を検討",
      "借入金額の削減",
      "金利条件の改善",
      "運営効率の向上"
    ]
  },
  {
    pattern: "暗黙キャップレートが市場から乖離",
    explanation: "売却時の前提が市場実態と合わないパターンです。",
    risks: ["売却時の価格ギャップ", "投資判断の誤り", "出口戦略の破綻"],
    solutions: [
      "市場キャップレートの調査",
      "価格前提の見直し",
      "類似物件事例の調査",
      "専門家意見の聴取"
    ]
  }
]

/**
 * エラー・警告メッセージから対応するヘルプ情報を取得する
 */
export function getWarningHelpInfo(error: { type?: string; message?: string }): WarningHelpInfo | null {
  const typeKey = error.type?.toLowerCase() || ''
  const messageKey = error.message?.toLowerCase() || ''
  
  // 直接マッチング
  if (WARNING_HELP_TEXTS[typeKey]) {
    return WARNING_HELP_TEXTS[typeKey]
  }
  
  // メッセージ内容による推定マッチング
  for (const [key, helpInfo] of Object.entries(WARNING_HELP_TEXTS)) {
    if (messageKey.includes(key.replace(/_/g, ' ')) || 
        messageKey.includes(helpInfo.title.toLowerCase().replace(/[（）]/g, ''))) {
      return helpInfo
    }
  }
  
  // エラーメッセージの詳細なパターンマッチング
  
  // インフレ率関連
  if (messageKey.includes('インフレ率') && messageKey.includes('非現実的')) {
    return WARNING_HELP_TEXTS.unrealistic_inflation
  }
  
  // 家賃・価格逓減率関連
  if (messageKey.includes('家賃') && (messageKey.includes('逓減') || messageKey.includes('下落'))) {
    return WARNING_HELP_TEXTS.high_rent_decay
  }
  if (messageKey.includes('価格') && (messageKey.includes('逓減') || messageKey.includes('下落'))) {
    return WARNING_HELP_TEXTS.high_price_decay
  }
  
  // 空室率関連
  if (messageKey.includes('空室率')) {
    return WARNING_HELP_TEXTS.high_vacancy_rate
  }
  
  // 借入関連
  if (messageKey.includes('返済期間') && messageKey.includes('保有期間')) {
    return WARNING_HELP_TEXTS.short_loan_term_vs_holding
  }
  if (messageKey.includes('借入金利') && messageKey.includes('高すぎる')) {
    return WARNING_HELP_TEXTS.high_interest_rate
  }
  if (messageKey.includes('借入比率') || (messageKey.includes('ltv') && messageKey.includes('高すぎる'))) {
    return WARNING_HELP_TEXTS.high_ltv_ratio
  }
  if (messageKey.includes('借入額') && messageKey.includes('物件価格')) {
    return WARNING_HELP_TEXTS.high_ltv_ratio // 借入額 > 物件価格のケース
  }
  
  // 割引率関連
  if (messageKey.includes('エクイティ') && messageKey.includes('割引率')) {
    return WARNING_HELP_TEXTS.equity_discount_lower_than_asset
  }
  
  // 計算結果関連
  if (messageKey.includes('noi') && messageKey.includes('マイナス')) {
    return WARNING_HELP_TEXTS.negative_noi
  }
  if (messageKey.includes('売却時の物件価格') && messageKey.includes('ゼロ以下')) {
    return WARNING_HELP_TEXTS.negative_sale_price
  }
  if (messageKey.includes('エクイティキャッシュフロー') && messageKey.includes('不安定')) {
    return WARNING_HELP_TEXTS.volatile_equity_cashflow
  }
  if (messageKey.includes('期末頼み') || messageKey.includes('売却価格の前提を保守的')) {
    return WARNING_HELP_TEXTS.exit_dependent_investment
  }
  if (messageKey.includes('irr') && messageKey.includes('異常')) {
    if (messageKey.includes('エクイティ')) {
      return WARNING_HELP_TEXTS.unrealistic_irr_equity
    } else {
      return WARNING_HELP_TEXTS.unrealistic_irr_asset
    }
  }
  if (messageKey.includes('irr') && messageKey.includes('100%')) {
    if (messageKey.includes('エクイティ')) {
      return WARNING_HELP_TEXTS.unrealistic_irr_equity
    } else {
      return WARNING_HELP_TEXTS.unrealistic_irr_asset
    }
  }
  
  // キャップレート関連
  if ((messageKey.includes('cap') || messageKey.includes('キャップ')) && 
      (messageKey.includes('範囲') || messageKey.includes('乖離'))) {
    return WARNING_HELP_TEXTS.market_inconsistent_cap
  }
  
  // IRR計算エラー関連
  if (messageKey.includes('解が存在しない') || messageKey.includes('no solution')) {
    return WARNING_HELP_TEXTS.irr_no_solution
  }
  if (messageKey.includes('収束') && (messageKey.includes('failed') || messageKey.includes('しませんでした'))) {
    return WARNING_HELP_TEXTS.irr_convergence_failed
  }
  if (messageKey.includes('同じ符号') || messageKey.includes('プラスとマイナス')) {
    return WARNING_HELP_TEXTS.irr_no_solution
  }
  
  return null
}