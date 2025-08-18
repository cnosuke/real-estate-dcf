import { Archive, CheckCircle, Copy, Save, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useDCFDatasets } from '@/hooks/useDCFDatasets'
import type {
  ImportOptions,
  ImportPreview,
  ImportResult,
} from '@/lib/dcf/dataset-storage'
import type { DCFDataset } from '@/types/dcf'
import { CalculationTrigger } from './calculation/CalculationTrigger'
import { formatNumber } from './shared/InputField'

export function DCFInputFormHeader() {
  const {
    datasets,
    saveCurrentDataset,
    loadDataset,
    removeDataset,
    removeAllDatasets,
    checkNameExists,
    copyDatasetToClipboard,
    copyAllDatasetsToClipboard,
    importDatasetsFromJson,
    importDatasetsFromFile,
    previewImportData,
    previewImportDataFromFile,
  } = useDCFDatasets()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [listDialogOpen, setListDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importResultDialogOpen, setImportResultDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveError, setSaveError] = useState('')
  const [datasetToDelete, setDatasetToDelete] = useState<DCFDataset | null>(
    null,
  )

  // Import related state
  const [importMethod, setImportMethod] = useState<'file' | 'text'>('file')
  const [importText, setImportText] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importOptions, setImportOptions] = useState<ImportOptions>({})
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importProgress, setImportProgress] = useState(false)
  const [importError, setImportError] = useState('')
  const [previewData, setPreviewData] = useState<ImportPreview | null>(null)

  const handleSave = () => {
    if (!saveName.trim()) {
      setSaveError('データセット名を入力してください')
      return
    }

    if (checkNameExists(saveName.trim())) {
      if (
        !confirm(
          `「${saveName}」という名前のデータセットが既に存在します。上書きしますか？`,
        )
      ) {
        return
      }
    }

    try {
      saveCurrentDataset(saveName.trim())
      setSaveDialogOpen(false)
      setSaveName('')
      setSaveError('')
    } catch (_error) {
      setSaveError('保存中にエラーが発生しました')
    }
  }

  const handleLoad = (dataset: DCFDataset) => {
    if (
      confirm('現在の入力内容が失われます。このデータセットを読み込みますか？')
    ) {
      loadDataset(dataset)
      setListDialogOpen(false)
    }
  }

  const handleDeleteClick = (dataset: DCFDataset) => {
    setDatasetToDelete(dataset)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (datasetToDelete) {
      removeDataset(datasetToDelete.id)
      setDatasetToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleDeleteAllConfirm = () => {
    removeAllDatasets()
    setDeleteAllDialogOpen(false)
  }

  const handleCopyDataset = async (dataset: DCFDataset) => {
    const success = await copyDatasetToClipboard(dataset.id)
    if (success) {
      alert(`データセット「${dataset.name}」をクリップボードにコピーしました`)
    } else {
      alert('クリップボードへのコピーに失敗しました')
    }
  }

  const handleCopyAllDatasets = async () => {
    const success = await copyAllDatasetsToClipboard()
    if (success) {
      alert(
        `全データセット（${datasets.length}件）をクリップボードにコピーしました`,
      )
    } else {
      alert('クリップボードへのコピーに失敗しました')
    }
  }

  const handleImportDialogOpen = () => {
    setImportDialogOpen(true)
    setImportError('')
    setImportText('')
    setImportFile(null)
    setImportOptions({})
    setPreviewData(null)
  }

  const handleImportDialogClose = () => {
    setImportDialogOpen(false)
    setImportError('')
    setImportText('')
    setImportFile(null)
    setImportOptions({})
    setPreviewData(null)
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setImportFile(file)
        setImportError('')

        // Generate preview
        try {
          const preview = await previewImportDataFromFile(file)
          setPreviewData(preview)
          if (preview.errors.length > 0) {
            setImportError(preview.errors[0])
          }
        } catch (_error) {
          setImportError('ファイルの読み込みに失敗しました')
          setPreviewData(null)
        }
      } else {
        setImportError('JSONファイルを選択してください')
        setImportFile(null)
        setPreviewData(null)
      }
    }
  }

  const handleTextChange = (text: string) => {
    setImportText(text)

    if (text.trim()) {
      try {
        const preview = previewImportData(text)
        setPreviewData(preview)
        if (preview.errors.length > 0) {
          setImportError(preview.errors[0])
        } else {
          setImportError('')
        }
      } catch (_error) {
        setImportError('JSONデータの解析に失敗しました')
        setPreviewData(null)
      }
    } else {
      setPreviewData(null)
      setImportError('')
    }
  }

  const handleImport = async () => {
    setImportProgress(true)
    setImportError('')

    try {
      let result: ImportResult

      // Check for "ask" option and handle duplicates interactively
      const options = { ...importOptions }

      if (importMethod === 'file') {
        if (!importFile) {
          setImportError('ファイルを選択してください')
          setImportProgress(false)
          return
        }
        result = await importDatasetsFromFile(importFile)
      } else {
        if (!importText.trim()) {
          setImportError('JSONデータを入力してください')
          setImportProgress(false)
          return
        }
        result = importDatasetsFromJson(importText, options)
      }

      setImportResult(result)
      setImportDialogOpen(false)
      setImportResultDialogOpen(true)
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'インポートに失敗しました',
      )
    } finally {
      setImportProgress(false)
    }
  }

  const canImport = () => {
    if (importMethod === 'file') {
      return !!importFile
    } else {
      return !!importText.trim()
    }
  }

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>DCF分析パラメータ</CardTitle>
          <CardDescription>
            不動産投資の分析に必要な項目を入力してください
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {/* 計算実行ボタン */}
          <CalculationTrigger variant="default" size="default" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Save className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>データセットを保存</DialogTitle>
                      <DialogDescription>
                        現在の入力内容を名前を付けて保存します
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="saveName">データセット名</Label>
                        <Input
                          id="saveName"
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          placeholder="例: 新宿マンション案件"
                        />
                      </div>
                      {saveError && (
                        <Alert>
                          <AlertDescription>{saveError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setSaveDialogOpen(false)}
                      >
                        キャンセル
                      </Button>
                      <Button onClick={handleSave}>保存</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>現在の設定を保存</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl w-[90vw] sm:max-w-6xl">
                    <DialogHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <DialogTitle>保存済みデータセット</DialogTitle>
                          <DialogDescription>
                            保存されているデータセットの一覧です
                          </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleImportDialogOpen}
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            インポート
                          </Button>
                          {datasets.length > 0 && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyAllDatasets}
                                className="flex items-center gap-2"
                              >
                                <Copy className="h-4 w-4" />
                                全体コピー
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteAllDialogOpen(true)}
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                全削除
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </DialogHeader>
                    <div className="max-h-96 overflow-auto">
                      {datasets.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          保存されたデータセットはありません
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[120px]">
                                名前
                              </TableHead>
                              <TableHead className="min-w-[100px]">
                                物件価格
                              </TableHead>
                              <TableHead className="min-w-[100px]">
                                借入額
                              </TableHead>
                              <TableHead className="min-w-[80px]">
                                保有年数
                              </TableHead>
                              <TableHead className="min-w-[140px]">
                                作成日時
                              </TableHead>
                              <TableHead className="min-w-[120px]">
                                操作
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {datasets.map((dataset) => (
                              <TableRow key={dataset.id}>
                                <TableCell className="font-medium">
                                  {dataset.name}
                                </TableCell>
                                <TableCell>
                                  {formatNumber(dataset.input.p0)}円
                                </TableCell>
                                <TableCell>
                                  {formatNumber(dataset.input.loanAmount)}円
                                </TableCell>
                                <TableCell>{dataset.input.years}年</TableCell>
                                <TableCell>
                                  {new Date(dataset.createdAt).toLocaleString(
                                    'ja-JP',
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleCopyDataset(dataset)
                                            }
                                            className="flex items-center gap-1"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>JSONをコピー</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleLoad(dataset)}
                                    >
                                      読み込み
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteClick(dataset)}
                                    >
                                      削除
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>保存済みデータセット一覧</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>データセットを削除</DialogTitle>
            <DialogDescription>
              「{datasetToDelete?.name}
              」を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 全削除確認ダイアログ */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>全データセットを削除</DialogTitle>
            <DialogDescription>
              保存されているすべてのデータセット（{datasets.length}
              件）を削除しますか？ この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteAllDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllConfirm}>
              すべて削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* インポートダイアログ */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>データセットをインポート</DialogTitle>
            <DialogDescription>
              JSONファイルまたはテキストからデータセットを読み込みます
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Tabs
              value={importMethod}
              onValueChange={(value) =>
                setImportMethod(value as 'file' | 'text')
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">ファイル選択</TabsTrigger>
                <TabsTrigger value="text">テキスト入力</TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-4">
                <div>
                  <Label htmlFor="import-file">JSONファイル</Label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {importFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      選択されたファイル: {importFile.name}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label htmlFor="import-text">JSONデータ</Label>
                  <Textarea
                    id="import-text"
                    value={importText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder='{"id": "...", "name": "...", "createdAt": "...", "input": {...}}'
                    className="min-h-[120px] font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>重複時の処理</Label>
              <select
                value={
                  importOptions.overwriteExisting
                    ? 'overwrite'
                    : importOptions.autoRename
                      ? 'rename'
                      : 'ask'
                }
                onChange={(e) => {
                  const value = e.target.value
                  setImportOptions({
                    overwriteExisting: value === 'overwrite',
                    autoRename: value === 'rename',
                  })
                }}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="ask">確認する</option>
                <option value="overwrite">上書き</option>
                <option value="rename">自動リネーム</option>
              </select>
            </div>

            {previewData && (
              <div className="space-y-2">
                <Label>プレビュー</Label>
                <div className="text-sm bg-muted p-3 rounded space-y-2">
                  <div>
                    <strong>検出:</strong> {previewData.count}件のデータセット
                    {previewData.structure !== 'invalid' && (
                      <span className="ml-2 text-muted-foreground">
                        (
                        {previewData.structure === 'single'
                          ? '単一データセット'
                          : previewData.structure === 'multiple'
                            ? '複数データセット(エクスポート形式)'
                            : previewData.structure === 'array'
                              ? '配列形式'
                              : '不明'}
                        )
                      </span>
                    )}
                  </div>

                  {previewData.duplicateNames.length > 0 && (
                    <div className="text-orange-600">
                      <strong>重複する名前:</strong>{' '}
                      {previewData.duplicateNames.join(', ')}
                    </div>
                  )}

                  {previewData.errors.length > 0 && (
                    <div className="text-red-600">
                      <strong>エラー:</strong> {previewData.errors[0]}
                      {previewData.errors.length > 1 &&
                        ` (他${previewData.errors.length - 1}件)`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {importError && (
              <Alert>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleImportDialogClose}>
              キャンセル
            </Button>
            <Button
              onClick={handleImport}
              disabled={!canImport() || importProgress}
            >
              {importProgress ? 'インポート中...' : 'インポート'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* インポート結果ダイアログ */}
      <Dialog
        open={importResultDialogOpen}
        onOpenChange={setImportResultDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>インポート結果</DialogTitle>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              {importResult.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {importResult.imported > 0
                      ? `${importResult.imported}件のデータセットをインポートしました`
                      : 'インポートできるデータセットはありませんでした'}
                    {importResult.skipped > 0 &&
                      ` (${importResult.skipped}件をスキップ)`}
                    {importResult.duplicates.length > 0 &&
                      ` (${importResult.duplicates.length}件で名前重複)`}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertDescription>インポートに失敗しました</AlertDescription>
                </Alert>
              )}

              {importResult.errors.length > 0 && (
                <div>
                  <Label>エラー詳細:</Label>
                  <div className="text-sm bg-muted p-2 rounded max-h-32 overflow-auto">
                    {importResult.errors.map((error, index) => (
                      <div
                        key={`error-${error.slice(0, 20)}-${index}`}
                        className="text-red-600"
                      >
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importResult.duplicates.length > 0 && (
                <div>
                  <Label>重複した名前:</Label>
                  <div className="text-sm bg-muted p-2 rounded max-h-32 overflow-auto">
                    {importResult.duplicates.map((name) => (
                      <div key={`duplicate-${name}`}>{name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setImportResultDialogOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardHeader>
  )
}
