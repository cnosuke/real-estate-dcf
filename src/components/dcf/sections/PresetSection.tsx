import { useAtom, useAtomValue } from 'jotai'
import { 
  currentPresetAtom, 
  applyPresetAtom, 
  PRESET_CONFIGS,
  type PresetType,
  isCurrentPresetValidAtom 
} from '@/atoms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function PresetSection() {
  const [currentPreset, setCurrentPreset] = useAtom(currentPresetAtom)
  const [, applyPreset] = useAtom(applyPresetAtom)
  const isPresetValid = useAtomValue(isCurrentPresetValidAtom)

  const handlePresetApply = (presetType: PresetType) => {
    applyPreset(presetType)
  }

  const handleResetPreset = () => {
    setCurrentPreset(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">プリセット設定</CardTitle>
        <p className="text-sm text-muted-foreground">
          不動産種別に応じた標準的な投資条件を一括設定できます
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPreset && !isPresetValid && (
          <Alert>
            <AlertDescription>
              プリセット「{PRESET_CONFIGS[currentPreset].name}」から設定が変更されています。
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => handlePresetApply(currentPreset)}
              >
                プリセットに戻す
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(PRESET_CONFIGS) as PresetType[]).map((presetType) => {
            const config = PRESET_CONFIGS[presetType]
            const isActive = currentPreset === presetType && isPresetValid
            
            return (
              <Card 
                key={presetType}
                className={`cursor-pointer transition-colors ${
                  isActive ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => handlePresetApply(presetType)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{config.name}</h4>
                      {isActive && <Badge variant="default">適用中</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                    <div className="text-xs space-y-1">
                      <div>物件価格: {(config.p0 / 10000).toLocaleString()}万円</div>
                      <div>想定利回り: {((config.rentMonthly0 * 12 / config.p0) * 100).toFixed(1)}%</div>
                      <div>LTV: {((config.loanAmount / config.p0) * 100).toFixed(0)}%</div>
                      <div>期間: {config.years}年</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {currentPreset && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              現在のプリセット: <span className="font-medium">{PRESET_CONFIGS[currentPreset].name}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetPreset}
            >
              プリセットを解除
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}