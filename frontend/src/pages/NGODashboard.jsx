import React, { useState } from 'react';

const NGODashboard = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignLocations, setNewCampaignLocations] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');

  const handleSaveChanges = () => {
    const updatedCampaigns = campaigns.map(c => c.id === editData.id ? editData : c);
    setCampaigns(updatedCampaigns);
    setSelectedCampaign(editData);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus) => {
    const updated = { ...selectedCampaign, status: newStatus };
    const updatedCampaigns = campaigns.map(c => c.id === updated.id ? updated : c);
    setCampaigns(updatedCampaigns);
    setSelectedCampaign(updated);
    setEditData(updated);
  };

  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'Community Food Drive', status: 'Active', meals: 450, locations: 3, description: 'A city-wide initiative to collect and distribute non-perishable food items to local shelters and food pantries.', startDate: '2023-10-01', endDate: '2023-11-15', targetMeals: 1000 },
    { id: 2, name: 'School Lunch Program', status: 'Active', meals: 280, locations: 5, description: 'Providing nutritious meals to students in underprivileged schools to ensure they have the energy to learn and grow.', startDate: '2023-09-01', endDate: '2024-06-30', targetMeals: 5000 },
    { id: 3, name: 'Shelter Support', status: 'Completed', meals: 320, locations: 2, description: 'Delivering hot meals to homeless shelters across the downtown area during the winter months.', startDate: '2023-12-01', endDate: '2024-02-28', targetMeals: 300 },
  ]);

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!newCampaignName || !newCampaignLocations || !newCampaignDescription) return;

    const newCampaign = {
      id: campaigns.length + 1,
      name: newCampaignName,
      status: 'Active',
      meals: 0,
      locations: parseInt(newCampaignLocations) || 1,
      description: newCampaignDescription,
      startDate: new Date().toISOString().split('T')[0],
      endDate: 'Ongoing',
      targetMeals: 1000 // default target
    };

    setCampaigns([newCampaign, ...campaigns]);
    
    setNewCampaignName('');
    setNewCampaignLocations('');
    setNewCampaignDescription('');
  };

  return (
    <div className="w-screen px-4 py-8 sm:py-12 md:py-16 bg-[#fffdfb] dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-4">NGO Dashboard</h1>
        <p className="text-gray-700 dark:text-gray-400 mb-8">Manage campaigns and help those in need</p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-12">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-6 rounded-lg text-center border border-transparent dark:border-orange-800/50">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">8</div>
            <p className="text-gray-700 dark:text-gray-300">Active Campaigns</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-lg text-center border border-transparent dark:border-green-800/50">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">1250+</div>
            <p className="text-gray-700 dark:text-gray-300">Meals Distributed</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-lg text-center border border-transparent dark:border-blue-800/50">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">15</div>
            <p className="text-gray-700 dark:text-gray-300">Partner Donors</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 p-6 rounded-lg text-center border border-transparent dark:border-purple-800/50">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">24</div>
            <p className="text-gray-700 dark:text-gray-300">Locations Served</p>
          </div>
        </div>

        {/* Campaigns */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12 border border-transparent dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Your Campaigns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-3">{campaign.name}</h3>
                <div className="space-y-2 mb-4 text-gray-700 dark:text-gray-300">
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm whitespace-nowrap ${campaign.status === 'Active' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : campaign.status === 'Completed' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}`}>{campaign.status}</span></p>
                  <p><strong>Meals:</strong> {campaign.meals}</p>
                  <p><strong>Locations:</strong> {campaign.locations}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setIsEditing(false);
                    setEditData(campaign);
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white font-bold py-2 rounded-lg transition"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create New Campaign */}
        <div className="bg-orange-50 dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800/50 rounded-lg p-8 transition-colors duration-300">
          <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-4">Start a New Campaign</h3>
          <form className="space-y-4" onSubmit={handleCreateCampaign}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Campaign Name" 
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
              />
              <input 
                type="text" 
                placeholder="Target Locations" 
                value={newCampaignLocations}
                onChange={(e) => setNewCampaignLocations(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
              />
            </div>
            <textarea 
              placeholder="Campaign Description" 
              rows="4" 
              value={newCampaignDescription}
              onChange={(e) => setNewCampaignDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white font-bold py-3 px-8 rounded-lg transition">Create Campaign</button>
          </form>
        </div>
      </div>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedCampaign(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex justify-between items-center mb-6 pr-8">
              <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {isEditing ? 'Edit Campaign' : selectedCampaign.name}
              </h3>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-semibold transition"
                >
                  Edit Campaign
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Name</label>
                  <input type="text" value={editData.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Locations Served</label>
                    <input type="number" value={editData.locations || 0} onChange={(e) => setEditData({...editData, locations: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Meals</label>
                    <input type="number" value={editData.targetMeals || 0} onChange={(e) => setEditData({...editData, targetMeals: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={editData.description || ''} onChange={(e) => setEditData({...editData, description: e.target.value})} rows="3" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"></textarea>
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={handleSaveChanges} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition">Save Changes</button>
                  <button onClick={() => { setIsEditing(false); setEditData(selectedCampaign); }} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm whitespace-nowrap ${selectedCampaign.status === 'Active' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : selectedCampaign.status === 'Completed' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}`}>{selectedCampaign.status}</span></p>
                    
                    {selectedCampaign.status === 'Active' && (
                      <div className="flex gap-2 sm:ml-auto">
                        <button onClick={() => handleStatusChange('Completed')} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-400 text-sm font-medium rounded transition border border-blue-200 dark:border-blue-800">Mark Completed</button>
                        <button onClick={() => handleStatusChange('Stopped')} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-400 text-sm font-medium rounded transition border border-red-200 dark:border-red-800">Stop Campaign</button>
                      </div>
                    )}
                    {selectedCampaign.status !== 'Active' && (
                      <div className="flex gap-2 sm:ml-auto">
                        <button onClick={() => handleStatusChange('Active')} className="px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-700 dark:text-green-400 text-sm font-medium rounded transition border border-green-200 dark:border-green-800">Reactivate</button>
                      </div>
                    )}
                  </div>
                  <p><strong>Meals Distributed:</strong> {selectedCampaign.meals}</p>
                  <p><strong>Locations Served:</strong> {selectedCampaign.locations}</p>
                  {selectedCampaign.description && <p><strong>Description:</strong> {selectedCampaign.description}</p>}
                  {selectedCampaign.targetMeals && <p><strong>Target Meals:</strong> {selectedCampaign.targetMeals}</p>}
                  {selectedCampaign.startDate && <p><strong>Duration:</strong> {selectedCampaign.startDate} to {selectedCampaign.endDate}</p>}
                </div>
                <button 
                  onClick={() => setSelectedCampaign(null)}
                  className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white font-bold py-2 rounded-lg transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NGODashboard;
