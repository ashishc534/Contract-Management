import React, { useState, useEffect } from 'react';
import { Upload, FileText, Search, Download, Trash2, CheckCircle, AlertCircle, Edit2, X, RefreshCw, BarChart3, Users, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { User, Contract, Analytics, ContractType } from '../types';
import { contractAPI } from '../services/api';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import EditContractModal from '../components/EditContractModal';

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
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');
  const [editingContract, setEditingContract] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<{[key: string]: string}>({});
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean; contractId: string | null}>({isOpen: false, contractId: null});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContractData, setEditingContractData] = useState<Contract | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateSearchSuggestions = (query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const suggestions = new Set<string>();
    
    contracts.forEach(contract => {
      // Add filename suggestions
      if (contract.originalFilename.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(contract.originalFilename);
      }
      
      // Add contract type suggestions
      if (contract.variables.contractType?.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(contract.variables.contractType);
      }
      
      // Add party name suggestions
      contract.variables.partyNames?.forEach(party => {
        if (party.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(party);
        }
      });
    });

    setSearchSuggestions(Array.from(suggestions).slice(0, 5));
    setShowSuggestions(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    generateSearchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleCardClick = (status: string) => {
    setFilterStatus(status);
    // Scroll to contracts section
    const contractsSection = document.getElementById('contracts-section');
    if (contractsSection) {
      contractsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      setToast({message: 'Please select at least one file', type: 'error'});
      return;
    }

    try {
      setUploading(true);
      await contractAPI.uploadContracts(selectedFiles, user.id);
      setSelectedFiles(null);
      fetchContracts();
      fetchAnalytics();
      setToast({message: 'Upload successful!', type: 'success'});
    } catch (error) {
      console.error('Error uploading:', error);
      setToast({message: 'Upload failed', type: 'error'});
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (contractId: string) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;

    try {
      setActionLoading(prev => ({...prev, [`delete-${contractId}`]: 'deleting'}));
      await contractAPI.deleteContract(contractId);
      fetchContracts();
      fetchAnalytics();
      alert('Contract deleted successfully');
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Delete failed');
    } finally {
      setActionLoading(prev => {
        const newState = {...prev};
        delete newState[`delete-${contractId}`];
        return newState;
      });
    }
  };

  const handleDeleteClick = (contractId: string) => {
    setConfirmDialog({isOpen: true, contractId});
  };

  const handleDeleteConfirm = async () => {
    const contractId = confirmDialog.contractId;
    if (!contractId) return;

    try {
      setActionLoading(prev => ({...prev, [`delete-${contractId}`]: 'deleting'}));
      await contractAPI.deleteContract(contractId);
      fetchContracts();
      fetchAnalytics();
      setToast({message: 'Contract deleted successfully', type: 'success'});
    } catch (error) {
      console.error('Error deleting contract:', error);
      setToast({message: 'Delete failed', type: 'error'});
    } finally {
      setActionLoading(prev => {
        const newState = {...prev};
        delete newState[`delete-${contractId}`];
        return newState;
      });
      setConfirmDialog({isOpen: false, contractId: null});
    }
  };

  const handleShowContractDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setShowContractModal(true);
  };

  const handleReprocess = async (contractId: string) => {
    try {
      setActionLoading(prev => ({...prev, [`reprocess-${contractId}`]: 'reprocessing'}));
      await contractAPI.reprocessContract(contractId);
      fetchContracts();
      setToast({message: 'Contract reprocessed successfully', type: 'success'});
    } catch (error) {
      console.error('Error reprocessing contract:', error);
      setToast({message: 'Reprocess failed', type: 'error'});
    } finally {
      setActionLoading(prev => {
        const newState = {...prev};
        delete newState[`reprocess-${contractId}`];
        return newState;
      });
    }
  };

  const handleEdit = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      setEditingContractData(contract);
      setShowEditModal(true);
    }
  };

  const handleEditSave = async (contractId: string, updatedContract: Contract) => {
    try {
      await contractAPI.updateContract(contractId, updatedContract);
      fetchContracts();
      fetchAnalytics();
      setShowEditModal(false);
      setEditingContractData(null);
      setToast({message: 'Contract updated successfully', type: 'success'});
    } catch (error) {
      console.error('Error updating contract:', error);
      setToast({message: 'Update failed', type: 'error'});
    }
  };

  const handleDownload = async (contractId: string, filename: string) => {
    try {
      setActionLoading(prev => ({...prev, [`download-${contractId}`]: 'downloading'}));
      await contractAPI.downloadContract(contractId, filename);
      setToast({message: 'Download completed', type: 'success'});
    } catch (error) {
      console.error('Error downloading:', error);
      setToast({message: 'Download failed', type: 'error'});
    } finally {
      setActionLoading(prev => {
        const newState = {...prev};
        delete newState[`download-${contractId}`];
        return newState;
      });
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
      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            currentView === 'dashboard'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setCurrentView('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            currentView === 'analytics'
              ? 'bg-slate-700 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {currentView === 'analytics' ? (
        <div className="space-y-8">
          {/* Analytics View */}
          <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Contract Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Contract Types Distribution</h3>
                <div className="space-y-3">
                  {contractTypes.map((type) => (
                    <div key={type.contract_type} className="flex justify-between items-center">
                      <span className="text-blue-700">{type.contract_type}</span>
                      <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        {type.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Processing Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Auto Extracted</span>
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      {analytics.auto_extracted}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-700">Manual Required</span>
                    <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded text-sm font-medium">
                      {analytics.manual_required}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Manually Edited</span>
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      {analytics.manually_edited}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => handleCardClick('')}
          className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        >
          <p className="text-slate-600 text-sm">Total Contracts</p>
          <p className="text-3xl font-bold text-slate-800">{analytics.total_contracts}</p>
        </div>
        
        <div 
          onClick={() => handleCardClick('auto_extracted')}
          className="bg-white/80 backdrop-blur border border-green-200 rounded-lg p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        >
          <p className="text-green-700 text-sm flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Auto Extracted
          </p>
          <p className="text-3xl font-bold text-green-600">{analytics.auto_extracted}</p>
        </div>
        
        <div 
          onClick={() => handleCardClick('manual_required')}
          className="bg-white/80 backdrop-blur border border-amber-200 rounded-lg p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        >
          <p className="text-amber-700 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Manual Required
          </p>
          <p className="text-3xl font-bold text-amber-600">{analytics.manual_required}</p>
        </div>
        
        <div 
          onClick={() => handleCardClick('manually_edited')}
          className="bg-white/80 backdrop-blur border border-blue-200 rounded-lg p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        >
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
            className="bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg px-6 py-3 disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Contracts
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg p-6 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by filename, contract type, or party names..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => generateSearchSuggestions(searchTerm)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 mt-1">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span className="text-slate-700">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
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
      <div id="contracts-section" className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg shadow-xl">
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
                        <div className="flex items-center gap-2">
                          {contract.variables.partyNames && contract.variables.partyNames.length > 0 ? (
                            <>
                              <span className="text-sm">{contract.variables.partyNames[0]}</span>
                              {contract.variables.partyNames.length > 1 && (
                                <button
                                  onClick={() => handleShowContractDetails(contract)}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-2 py-1 rounded-full"
                                >
                                  +{contract.variables.partyNames.length - 1}
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400 italic text-sm">No parties extracted</span>
                          )}
                        </div>
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
                            onClick={() => handleEdit(contract.id)}
                            className="p-2 border border-blue-300 rounded hover:bg-blue-50 text-blue-600"
                            title="Edit contract details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReprocess(contract.id)}
                            disabled={!!actionLoading[`reprocess-${contract.id}`]}
                            className="p-2 border border-green-300 rounded hover:bg-green-50 text-green-600 disabled:opacity-50"
                            title="Reprocess with AI extraction"
                          >
                            {actionLoading[`reprocess-${contract.id}`] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDownload(contract.id, contract.originalFilename)}
                            disabled={!!actionLoading[`download-${contract.id}`]}
                            className="p-2 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
                            title="Download original file"
                          >
                            {actionLoading[`download-${contract.id}`] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(contract.id)}
                            disabled={!!actionLoading[`delete-${contract.id}`]}
                            className="p-2 border border-red-300 rounded hover:bg-red-50 text-red-600 disabled:opacity-50"
                            title="Delete contract permanently"
                          >
                            {actionLoading[`delete-${contract.id}`] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
      )}

      {/* Contract Details Modal */}
      {showContractModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Contract Details</h3>
              <button
                onClick={() => setShowContractModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  File Information
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p><span className="font-medium">Filename:</span> {selectedContract.originalFilename}</p>
                  <p><span className="font-medium">Type:</span> {selectedContract.variables.contractType || 'Not specified'}</p>
                  <p><span className="font-medium">Status:</span> {getStatusBadge(selectedContract.extractionStatus)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  All Parties ({selectedContract.variables.partyNames?.length || 0})
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  {selectedContract.variables.partyNames && selectedContract.variables.partyNames.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedContract.variables.partyNames.map((party, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          {party}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No parties extracted</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Financial Details
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p><span className="font-medium">Amount:</span> {selectedContract.variables.amount || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Important Dates
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p><span className="font-medium">Date:</span> {selectedContract.variables.date || 'Not specified'}</p>
                  <p><span className="font-medium">Expiration Date:</span> {selectedContract.variables.expirationDate || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Contract"
        message="Are you sure you want to delete this contract? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({isOpen: false, contractId: null})}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Edit Contract Modal */}
      <EditContractModal
        isOpen={showEditModal}
        contract={editingContractData}
        onClose={() => {
          setShowEditModal(false);
          setEditingContractData(null);
        }}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default Dashboard;
