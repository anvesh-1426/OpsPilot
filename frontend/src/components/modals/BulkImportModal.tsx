import React, { useState } from 'react';
import { Modal, Button, LoadingSpinner } from '../ui';
import { Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import api from '../../lib/api';

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  entityName: 'products' | 'customers';
  onSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ open, onClose, entityName, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      parseAndPreview(text);
    };
    reader.readAsText(selected);
  };

  const parseAndPreview = async (text: string) => {
    setLoading(true);
    try {
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

      const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const rowObj: any = {};
        headers.forEach((h, i) => { rowObj[h] = values[i] || ''; });
        return rowObj;
      });

      const { data } = await api.post('/bulk/import/preview', { entity: entityName, rows });
      setPreviewData(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeImport = async () => {
    if (!previewData) return;
    setImporting(true);
    try {
      await api.post('/bulk/import/execute', { entity: entityName, rows: previewData.preview });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Bulk Import ${entityName}`} size="lg">
      <div className="space-y-5">
        {/* Upload Drop Zone */}
        <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-slate-50">
          <Upload className="mx-auto text-slate-400 mb-2" size={32} />
          <p className="text-sm font-semibold text-slate-700">Upload CSV File</p>
          <p className="text-xs text-slate-400 mt-1 mb-3">Select a .csv file containing {entityName} headers</p>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl cursor-pointer transition-colors inline-block">
            Choose CSV
          </label>
          {file && <p className="text-xs text-blue-600 font-mono mt-3">Selected: {file.name}</p>}
        </div>

        {/* Loading / Preview */}
        {loading && <LoadingSpinner />}

        {previewData && (
          <div className="space-y-4">
            <div className="flex gap-4 p-3 bg-slate-100 rounded-xl text-xs font-medium text-slate-700">
              <span>Total Rows: <strong>{previewData.totalRows}</strong></span>
              <span className="text-emerald-700">Valid: <strong>{previewData.validCount}</strong></span>
              <span className="text-rose-700">Errors: <strong>{previewData.errorCount}</strong></span>
            </div>

            {/* Preview table */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Preview (First 5 rows)</p>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="data-table text-xs">
                  <thead><tr>{Object.keys(previewData.preview[0] || {}).map((k) => <th key={k}>{k}</th>)}</tr></thead>
                  <tbody>
                    {previewData.preview.map((row: any, i: number) => (
                      <tr key={i}>{Object.values(row).map((v: any, j: number) => <td key={j}>{v}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={executeImport} loading={importing} icon={<CheckCircle size={15} />}>Execute Import</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
