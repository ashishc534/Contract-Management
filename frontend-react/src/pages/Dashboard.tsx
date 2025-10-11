import React, { useState, useEffect } from 'react';
import { Upload, FileText, Search, Download, Trash2, CheckCircle, AlertCircle, Edit2, X } from 'lucide-react';
import { User, Contract, Analytics, ContractType } from '../types';
import { contractAPI } from '../services/api';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    total_contracts: 0,
    auto_extracted: 0,
    manual_required: 0,
    manually_edited: 0,
    total_size: 0
  });
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await contractAPI.getContracts({
        userId: user.id,
        search: searchTerm || undefined,
        extractionStatus: filterStatus || undefined,
        contractType: filterType || undefined,
      });
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [analyticsData, typesData] = await Promise.all([
        contractAPI.getAnalytics(user.id),
        contractAPI.getContractTypes(user.id)
      ]);
      setAnalytics(analyticsData);
      setContractTypes(typesData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }

    try {
      setUploading(true);
      await contractAPI.uploadContracts(selectedFiles, user.id);
      setSelectedFiles(null);
      fetchContracts();
      fetchAnalytics();
      alert('Upload successful!');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (contractId: string) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;

    try {
      await contractAPI.deleteContract(contractId);
      fetchContracts();
      fetchAnalytics();
      alert('Contract deleted successfully');
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Delete failed');
    }
  };

  const handleDownload = async (contractId: string, filename: string) => {
    try {
      await contractAPI.downloadContract(contractId, filename);
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Download failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'auto_extracted': (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Auto
        </span>
      ),
      'manual_required': (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Manual
        </span>
      ),
      'manually_edited': (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Edit2 className="w-3 h-3 mr-1" />
          Edited
        </span>
      )
    };
    return badges[status as keyof typeof badges] || <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{status}</span>;
  };

  useEffect(() => {
    fetchContracts();
    fetchAnalytics();
  }, [user, searchTerm, filterStatus, filterType]);

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg p-6 shadow-lg">
          <p className="text-slate-600 text-sm">Total Contracts</p>
          <p className="text-3xl font-bold text-slate-800">{analytics.total_contracts}</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur border border-green-200 rounded-lg p-6 shadow-lg">
          <p className="text-green-700 text-sm flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Auto Extracted
          </p>
          <p className="text-3xl font-bold text-green-600">{analytics.auto_extracted}</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur border border-amber-200 rounded-lg p-6 shadow-lg">
          <p className="text-amber-700 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Manual Required
          </p>
          <p className="text-3xl font-bold text-amber-600">{analytics.manual_required}</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur border border-blue-200 rounded-lg p-6 shadow-lg">
          <p className="text-blue-700 text-sm flex items-center gap-1">
            <Edit2 className="w-4 h-4" />
            Manually Edited
          </p>
          <p className="text-3xl font-bold text-blue-600">{analytics.manually_edited}</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg p-6 shadow-xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-800">Upload Contracts</h2>
        </div>
        <p className="text-slate-600 mb-4">Upload DOCX files (max 100MB per file)</p>
        
        <div className="space-y-4">
          <div>
            <label className="cursor-pointer">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-slate-500 transition-all bg-slate-50 hover:bg-slate-100">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-sm text-slate-600 mb-1">
                    {selectedFiles && selectedFiles.length > 0
                      ? `${selectedFiles.length} file(s) selected`
                      : "Click to select DOCX files or drag and drop"}
                  </p>
                  <p className="text-xs text-slate-400">Supports bulk upload</p>
                </div>
              </div>
              <input
                type="file"
                multiple
                accept=".docx"
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFiles || selectedFiles.length === 0}
            className="bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg px-6 py-3 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Contracts"}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg p-6 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by filename, contract type, or party names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">All Status</option>
              <option value="auto_extracted">Auto Extracted</option>
              <option value="manual_required">Manual Required</option>
              <option value="manually_edited">Manually Edited</option>
            </select>
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">All Types</option>
              {contractTypes.map((type) => (
                <option key={type.contract_type} value={type.contract_type}>
                  {type.contract_type} ({type.count})
                </option>
              ))}
            </select>
          </div>
          
          {(filterStatus || searchTerm || filterType) && (
            <button
              onClick={() => {
                setFilterStatus('');
                setSearchTerm('');
                setFilterType('');
              }}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg shadow-xl">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Your Contracts</h2>
          <p className="text-slate-600">Manage and view all uploaded contracts</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading contracts...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600">No contracts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Filename</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Parties</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          {contract.originalFilename}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {contract.variables.contractType || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {contract.variables.partyNames?.join(', ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {contract.variables.amount || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(contract.extractionStatus)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDownload(contract.id, contract.originalFilename)}
                            className="p-2 border border-slate-300 rounded hover:bg-slate-100"
                            title="Download original file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contract.id)}
                            className="p-2 border border-red-300 rounded hover:bg-red-50 text-red-600"
                            title="Delete contract permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
