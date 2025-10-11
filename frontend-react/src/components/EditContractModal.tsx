import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Contract } from '../types';

interface EditContractModalProps {
  isOpen: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSave: (contractId: string, updatedContract: Contract) => void;
}

const EditContractModal: React.FC<EditContractModalProps> = ({
  isOpen,
  contract,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    contractType: '',
    partyNames: [''],
    amount: '',
    date: '',
    expirationDate: ''
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        contractType: contract.variables.contractType || '',
        partyNames: contract.variables.partyNames || [''],
        amount: contract.variables.amount || '',
        date: contract.variables.date || '',
        expirationDate: contract.variables.expirationDate || ''
      });
    }
  }, [contract]);

  const handlePartyChange = (index: number, value: string) => {
    const newParties = [...formData.partyNames];
    newParties[index] = value;
    setFormData({ ...formData, partyNames: newParties });
  };

  const addParty = () => {
    setFormData({ ...formData, partyNames: [...formData.partyNames, ''] });
  };

  const removeParty = (index: number) => {
    const newParties = formData.partyNames.filter((_, i) => i !== index);
    setFormData({ ...formData, partyNames: newParties });
  };

  const handleSave = () => {
    if (!contract) return;
    
    const updatedContract = {
      ...contract,
      variables: {
        ...contract.variables,
        contractType: formData.contractType,
        partyNames: formData.partyNames.filter(name => name.trim() !== ''),
        amount: formData.amount,
        date: formData.date,
        expirationDate: formData.expirationDate
      }
    };
    
    onSave(contract.id, updatedContract);
  };

  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Edit Contract</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contract Type
            </label>
            <input
              type="text"
              value={formData.contractType}
              onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Party Names
            </label>
            {formData.partyNames.map((party, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={party}
                  onChange={(e) => handlePartyChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder={`Party ${index + 1}`}
                />
                {formData.partyNames.length > 1 && (
                  <button
                    onClick={() => removeParty(index)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addParty}
              className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Add Party
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount
            </label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expiration Date
              </label>
              <input
                type="text"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditContractModal;
