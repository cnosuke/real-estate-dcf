import { Archive, Save } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useDCFDatasets } from '@/hooks/useDCFDatasets'
import type { DCFDataset } from '@/types/dcf'
import { formatNumber } from './shared/InputField'

export function DCFInputFormHeader() {
  const {
    datasets,
    saveCurrentDataset,
    loadDataset,
    removeDataset,
    checkNameExists,
  } = useDCFDatasets()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [listDialogOpen, setListDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveError, setSaveError] = useState('')
  const [datasetToDelete, setDatasetToDelete] = useState<DCFDataset | null>(
    null,
  )

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
                      <DialogTitle>保存済みデータセット</DialogTitle>
                      <DialogDescription>
                        保存されているデータセットの一覧です
                      </DialogDescription>
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
    </CardHeader>
  )
}
