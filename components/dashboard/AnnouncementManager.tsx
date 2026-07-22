"use client";

import React, { useState } from "react";
import { Plus, Trash2, Megaphone, Info, AlertTriangle, Tag, RefreshCw } from "lucide-react";
import { useToast } from "@/components/Providers";
import { 
  createAnnouncementAction, 
  deleteAnnouncementAction, 
  toggleAnnouncementStatusAction 
} from "@/actions/announcement.actions";

type AnnouncementType = "INFO" | "WARNING" | "PROMO";

export default function AnnouncementManager({ initialData = [] }: { initialData?: any[] }) {
  const [announcements, setAnnouncements] = useState(initialData);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<AnnouncementType>("INFO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    const result = await createAnnouncementAction({
      title,
      content,
      type,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast(result.message || "Pengumuman berhasil dibuat", "success");
      setTitle("");
      setContent("");
      setType("INFO");
      window.location.reload();
    } else {
      toast(result.error || "Gagal membuat pengumuman", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    
    const result = await deleteAnnouncementAction(id);
    if (result.success) {
      toast(result.message || "Berhasil dihapus", "success");
      setAnnouncements(announcements.filter(a => a.id !== id));
    } else {
      toast(result.error || "Gagal menghapus pengumuman", "error");
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const result = await toggleAnnouncementStatusAction(id, !currentStatus);
    if (result.success) {
      toast(result.message || "Status diubah", "success");
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));
    } else {
      toast(result.error || "Gagal mengubah status", "error");
    }
  };

  const getTypeStyle = (type: AnnouncementType) => {
    switch (type) {
      case "INFO": return { bg: "bg-blue-50 text-blue-700", icon: <Info size={14} className="text-blue-500" /> };
      case "WARNING": return { bg: "bg-amber-50 text-amber-700", icon: <AlertTriangle size={14} className="text-amber-500" /> };
      case "PROMO": return { bg: "bg-emerald-50 text-emerald-700", icon: <Tag size={14} className="text-emerald-500" /> };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 flex items-center gap-2 border-b border-gray-100">
        <Megaphone className="text-violet-600" size={20} />
        <div>
          <h3 className="text-base font-bold text-gray-800">Manajemen Pengumuman</h3>
          <p className="text-xs text-gray-500">Buat dan atur pengumuman yang tampil di dashboard pelanggan.</p>
        </div>
      </div>

      <div className="p-5">
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Judul Pengumuman</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Misal: Perbaikan Lapangan Futsal"
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipe</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AnnouncementType)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2 outline-none"
              >
                <option value="INFO">Informasi Umum</option>
                <option value="WARNING">Peringatan / Maintenance</option>
                <option value="PROMO">Promo / Voucher</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Isi Pengumuman</label>
            <textarea
              required
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis detail pesan yang ingin disampaikan ke pelanggan..."
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2 outline-none resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg text-sm px-5 py-2 transition disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
              Terbitkan Pengumuman
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pengumuman Terdaftar</h4>
          
          {announcements.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Megaphone size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Belum ada pengumuman.</p>
            </div>
          ) : (
            announcements.map((item) => {
              const style = getTypeStyle(item.type);
              return (
                <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${item.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/50 opacity-70'}`}>
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.bg}`}>
                      {style.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-bold text-sm text-gray-800">{item.title}</h5>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${style.bg}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{item.content}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Dibuat: {new Date(item.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleToggle(item.id, item.isActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${item.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                    >
                      {item.isActive ? "Sembunyikan" : "Tampilkan"}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
