import React, { useState } from 'react';
import { useDentora } from '../../context/DentoraContext';
import { UserPlus, X } from 'lucide-react';

export const NewPatientModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { currentLocation, providers, addPatient, selectPatient, setActiveTab } = useDentora();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('F');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter both First and Last Name.');
      return;
    }
    if (!dob) {
      setErrorMsg('Please select a Date of Birth.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter a valid Phone Number.');
      return;
    }
    setErrorMsg('');

    try {
      const created = await addPatient({
        firstName,
        lastName,
        dob,
        gender,
        phone,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        address,
        preferredLocationId: currentLocation?.id || '',
        preferredProviderId: providers?.[0]?.id || '',
        alerts: [],
        familyMembers: [],
      });

      selectPatient(created.id);
      setActiveTab('patients');
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save patient. Please check your connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Register New Patient</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Clara"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Bennett"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date of Birth *</label>
              <input 
                type="date" 
                max={new Date().toISOString().split("T")[0]}
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium" 
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Gender *</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['M', 'F', 'Other'].map(g => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g as any)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${gender === g ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cell Phone *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Home Address (Optional)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-white"
            >
              Save Patient Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
