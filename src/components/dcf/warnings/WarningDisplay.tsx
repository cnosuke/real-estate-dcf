import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { 
  WARNING_HELP_TEXTS, 
  WARNING_CATEGORIES, 
  GENERAL_GUIDELINES, 
  COMMON_ISSUES,
  getWarningHelpInfo 
} from '@/lib/warning-help-texts'
import type { DCFError } from '@/lib/error-utils'

interface WarningDisplayProps {
  warnings: DCFError[]
  errors: DCFError[]
  showDetails?: boolean
}

export function WarningDisplay({ warnings = [], errors = [], showDetails = true }: WarningDisplayProps) {
  const [activeTab, setActiveTab] = useState('warnings')
  const [expandedWarnings, setExpandedWarnings] = useState<Set<string>>(new Set())

  const toggleWarningExpanded = (warningId: string) => {
    const newExpanded = new Set(expandedWarnings)
    if (newExpanded.has(warningId)) {
      newExpanded.delete(warningId)
    } else {
      newExpanded.add(warningId)
    }
    setExpandedWarnings(newExpanded)
  }

  if (errors.length === 0 && warnings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            チェック結果：問題なし
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            入力値と計算結果に特に問題は検出されませんでした。
            ただし、投資判断は複数の観点から慎重に行ってください。
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {errors.length > 0 ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              チェック結果
            </div>
            <div className="flex items-center gap-2">
              {errors.length > 0 && (
                <Badge variant="destructive">{errors.length}件のエラー</Badge>
              )}
              {warnings.length > 0 && (
                <Badge variant="outline">{warnings.length}件の警告</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="warnings">
                警告 ({warnings.length})
              </TabsTrigger>
              <TabsTrigger value="errors">
                エラー ({errors.length})
              </TabsTrigger>
              <TabsTrigger value="guidelines">
                ガイドライン
              </TabsTrigger>
            </TabsList>

            <TabsContent value="warnings" className="space-y-4">
              {warnings.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  警告はありません
                </div>
              ) : (
                <div className="space-y-3">
                  {warnings.map((warning, index) => (
                    <WarningCard 
                      key={index}
                      warning={warning}
                      isExpanded={expandedWarnings.has(`warning-${index}`)}
                      onToggle={() => toggleWarningExpanded(`warning-${index}`)}
                      showDetails={showDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="errors" className="space-y-4">
              {errors.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  エラーはありません
                </div>
              ) : (
                <div className="space-y-3">
                  {errors.map((error, index) => (
                    <ErrorCard 
                      key={index}
                      error={error}
                      showDetails={showDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="guidelines">
              <GuidelinesPanel />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// 個別の警告カード
function WarningCard({ 
  warning, 
  isExpanded, 
  onToggle, 
  showDetails 
}: { 
  warning: DCFError
  isExpanded: boolean
  onToggle: () => void
  showDetails: boolean
}) {
  // warning.type から対応するヘルプテキストを取得
  const helpInfo = getWarningHelpInfo(warning)
  
  return (
    <Alert variant="default" className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <div className="flex-1">
        <AlertTitle className="flex items-center justify-between">
          <span>{helpInfo?.title || warning.message}</span>
          {showDetails && helpInfo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-auto p-1"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </AlertTitle>
        
        <AlertDescription className="mt-2">
          <div className="space-y-2">
            <div className="text-sm">
              {helpInfo?.explanation || warning.getUserMessage()}
            </div>
            
            {isExpanded && helpInfo && (
              <Collapsible open={isExpanded}>
                <CollapsibleContent className="space-y-3">
                  <div>
                    <div className="font-medium text-sm mb-1">影響</div>
                    <div className="text-sm text-muted-foreground">
                      {helpInfo.impact}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-sm mb-1">対処方法</div>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {helpInfo.solutions.map((solution, index) => (
                        <li key={index}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  )
}

// エラーカード
function ErrorCard({ error, showDetails }: { error: DCFError; showDetails: boolean }) {
  const helpInfo = getWarningHelpInfo(error)
  
  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>{helpInfo?.title || error.message}</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <div className="text-sm">
            {helpInfo?.explanation || error.getUserMessage()}
          </div>
          
          {showDetails && helpInfo && (
            <div className="space-y-2">
              <div>
                <div className="font-medium text-sm mb-1">対処方法</div>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {helpInfo.solutions.map((solution, index) => (
                    <li key={index}>{solution}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

// ガイドラインパネル
function GuidelinesPanel() {
  return (
    <div className="space-y-6">
      {/* 一般的なガイドライン */}
      <div>
        <h3 className="font-medium mb-3">{GENERAL_GUIDELINES.title}</h3>
        <div className="space-y-3">
          {GENERAL_GUIDELINES.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="font-medium text-sm">{item.title}</div>
                <Badge variant={item.importance === 'high' ? 'destructive' : 'outline'} className="text-xs">
                  {item.importance === 'high' ? '重要' : '推奨'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* よくある問題パターン */}
      <div>
        <h3 className="font-medium mb-3">よくある問題パターンと対処法</h3>
        <div className="space-y-4">
          {COMMON_ISSUES.map((issue, index) => (
            <Collapsible key={index}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-left h-auto p-3">
                  <span className="font-medium">{issue.pattern}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 p-3 border rounded-lg bg-muted/50">
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-sm mb-1">説明</div>
                    <div className="text-sm text-muted-foreground">{issue.explanation}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-sm mb-1">リスク</div>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {issue.risks.map((risk, riskIndex) => (
                        <li key={riskIndex}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="font-medium text-sm mb-1">対処方法</div>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {issue.solutions.map((solution, solutionIndex) => (
                        <li key={solutionIndex}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  )
}