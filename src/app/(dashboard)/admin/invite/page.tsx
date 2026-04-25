import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Invite Admin | FlexWear",
  description: "Invite a new administrator to the store",
}

export default function InviteAdminPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#202223]">Invite Admin</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <p className="text-gray-500 mb-6">Send an invitation to a new administrator. They will receive an email to create their account and access the dashboard.</p>
        
        <form className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              placeholder="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008060] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008060] focus:border-transparent">
              <option value="admin">Full Admin</option>
              <option value="editor">Editor (Products & Content only)</option>
              <option value="viewer">Viewer (Read only)</option>
            </select>
          </div>
          <button 
            type="button"
            className="bg-[#008060] hover:bg-[#006e52] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Send Invitation
          </button>
        </form>
      </div>
    </div>
  )
}
