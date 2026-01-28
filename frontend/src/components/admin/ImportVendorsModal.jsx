import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
    XCircleIcon,
    ArrowUpTrayIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

export default function ImportVendorsModal({ isOpen, onClose, onImportComplete }) {
    const { token } = useContext(AuthContext);
    const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: processing 
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [importing, setImporting] = useState(false);

    // Preview data
    const [uploadId, setUploadId] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleClose = () => {
        setStep(1);
        setFile(null);
        setPreview(null);
        setUploadId(null);
        setError(null);
        onClose();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        // Validate file type
        const validTypes = ['.csv', '.xlsx'];
        const isValid = validTypes.some(type => selectedFile.name.toLowerCase().endsWith(type));

        if (!isValid) {
            setError('Only CSV and XLSX files are supported');
            return;
        }

        // Validate file size (10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size exceeds 10MB limit');
            return;
        }

        setFile(selectedFile);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const result = await api.vendorImport.upload(token, file);

            if (!result.valid) {
                setError(result.error);
                setUploading(false);
                return;
            }

            setPreview(result);
            setUploadId(result.upload_id);
            setStep(2);
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleConfirm = async () => {
        if (!uploadId) return;

        setImporting(true);
        setError(null);

        try {
            const result = await api.vendorImport.confirm(token, uploadId);
            setStep(3);

            // Notify parent after short delay
            setTimeout(() => {
                onImportComplete(result);
                handleClose();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Import failed');
            setImporting(false);
        }
    };

    const downloadErrorReport = () => {
        if (!preview || !preview.error_details || preview.error_details.length === 0) return;

        // Create CSV content
        let csvContent = "Row Number,Errors\n";
        preview.error_details.forEach(err => {
            const errors = err.errors.join('; ');
            csvContent += `${err.row},"${errors}"\n`;
        });

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `import_errors_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-green-50 to-blue-50">
                    <h3 className="text-lg font-semibold text-gray-900">Import Vendors</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragging
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4">
                                    <label className="cursor-pointer">
                                        <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                                            Select File
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".csv,.xlsx"
                                            onChange={handleFileSelect}
                                        />
                                    </label>
                                    <p className="mt-2 text-sm text-gray-500">or drag and drop</p>
                                </div>
                                <p className="mt-2 text-xs text-gray-400">CSV or XLSX files only (max 10MB)</p>
                            </div>

                            {file && (
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <DocumentArrowDownIcon className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <XCircleIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {uploading ? 'Validating...' : 'Validate and Preview'}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Preview */}
                    {step === 2 && preview && (
                        <div className="space-y-4">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-500">Total Rows</p>
                                    <p className="text-2xl font-bold text-gray-900">{preview.total_rows}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                    <p className="text-sm text-green-700">Valid Rows</p>
                                    <p className="text-2xl font-bold text-green-600">{preview.valid_rows}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg text-center">
                                    <p className="text-sm text-red-700">Invalid Rows</p>
                                    <p className="text-2xl font-bold text-red-600">{preview.invalid_rows}</p>
                                </div>
                            </div>

                            {/* Error Details */}
                            {preview.invalid_rows > 0 && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-red-50 px-4 py-2 border-b border-red-200 flex justify-between items-center">
                                        <h4 className="text-sm font-semibold text-red-900">Validation Errors</h4>
                                        <button
                                            onClick={downloadErrorReport}
                                            className="text-xs text-red-700 hover:text-red-900 flex items-center gap-1"
                                        >
                                            <DocumentArrowDownIcon className="h-4 w-4" />
                                            Download Report
                                        </button>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Errors</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {preview.error_details.slice(0, 10).map((err, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 text-sm text-gray-900">{err.row}</td>
                                                        <td className="px-4 py-2 text-sm text-red-600">
                                                            {err.errors.join(', ')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {preview.error_details.length > 10 && (
                                            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center">
                                                ... and {preview.error_details.length - 10} more errors
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                                >
                                    Cancel
                                </button>
                                {preview.valid_rows > 0 && (
                                    <button
                                        onClick={handleConfirm}
                                        disabled={importing}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                                    >
                                        {importing ? 'Importing...' : `Import ${preview.valid_rows} Valid Rows`}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="text-center py-8">
                            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">Import Successful!</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Vendors have been imported successfully. Refreshing list...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
