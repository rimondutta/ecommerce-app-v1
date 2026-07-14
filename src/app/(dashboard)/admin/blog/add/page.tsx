import React from "react"
import { Metadata } from "next"
import { Megaphone, Image as ImageIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Upload Blog | Toy Hourse Admin",
}

export default function BlogUploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-md flex items-center justify-center border border-gray-200">
          <Megaphone size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Upload Blog Post</h1>
          <p className="text-sm text-gray-500 mt-1">Publish new content to the storefront</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form className="space-y-6">
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">Post Title</label>
            <input type="text" className="w-full !bg-white !text-black border border-gray-300 rounded-md py-2 px-3 text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400" placeholder="Enter an engaging title..." />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">Cover Image</label>
            <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer bg-gray-50">
              <ImageIcon size={32} className="mb-3 text-gray-400" />
              <p className="font-medium text-sm text-gray-700">Click or drag image to upload</p>
              <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630px</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">Content</label>
            <textarea 
              className="w-full !bg-white !text-black border border-gray-300 rounded-md py-2 px-3 min-h-[300px] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y placeholder:text-gray-400" 
              placeholder="Write your blog post content here. Markdown is supported..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block">Category</label>
              <select className="w-full !bg-white !text-black border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer">
                <option value="news">News & Announcements</option>
                <option value="guide">Style Guide</option>
                <option value="interview">Interviews</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block">Tags (comma separated)</label>
              <input type="text" className="w-full !bg-white !text-black border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400" placeholder="sneakers, fashion, summer" />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button type="button" className="flex-1 bg-white text-gray-700 border border-gray-300 text-sm font-medium py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
              Save Draft
            </button>
            <button type="button" className="flex-[2] bg-gray-900 text-white border border-transparent text-sm font-medium py-2 rounded-md hover:bg-gray-800 transition-colors shadow-sm">
              Publish Post
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
