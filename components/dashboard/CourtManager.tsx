"use client";

import React, { useState } from "react";
import { createCourtAction, updateCourtAction, deleteCourtAction } from "@/actions/court.actions";
import { useToast } from "@/components/Providers";
import { CourtSchema } from "@/lib/validations";

interface Court {
  id: string;
  name: string;
  type: "FUTSAL" | "BADMINTON";
  pricePerHour: number;
  openTime: number;
  closeTime: number;
  status: "AVAILABLE" | "MAINTENANCE";
  imageUrl?: string | null;
}

export default function CourtManager({ initialCourts }: { initialCourts: Court[] }) {
  const { toast } = useToast();

  const [courts, setCourts] = useState<Court[]>(initialCourts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"FUTSAL" | "BADMINTON">("FUTSAL");
  const [pricePerHour, setPricePerHour] = useState(0);
  const [openTime, setOpenTime] = useState(8);
  const [closeTime, setCloseTime] = useState(22);
  const [status, setStatus] = useState<"AVAILABLE" | "MAINTENANCE">("AVAILABLE");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const openAddModal = () => {
    setEditingCourt(null);
    setName("");
    setType("FUTSAL");
    setPricePerHour(0);
    setOpenTime(8);
    setCloseTime(22);
    setStatus("AVAILABLE");
    setImageUrl(null);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (court: Court) => {
    setEditingCourt(court);
    setName(court.name);
    setType(court.type);
    setPricePerHour(court.pricePerHour);
    setOpenTime(court.openTime);
    setCloseTime(court.closeTime);
    setStatus(court.status);
    setImageUrl(court.imageUrl || null);
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus lapangan: ${name}?`)) {
      return;
    }
    try {
      const res = await deleteCourtAction(id);
      if (res.success) {
        toast(res.message, "success");
        setCourts((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast(res.error || "Gagal menghapus lapangan.", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan sistem.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const payload = {
      name,
      type,
      pricePerHour: Number(pricePerHour),
      openTime: Number(openTime),
      closeTime: Number(closeTime),
      status,
      imageUrl: imageUrl || undefined,
    };

    // Client-side Zod validation
    const validation = CourtSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      if (editingCourt) {
        // Update Action
        const res = await updateCourtAction(editingCourt.id, payload);
        if (res.success) {
          toast(res.message, "success");
          setCourts((prev) =>
            prev.map((c) => (c.id === editingCourt.id ? { ...c, ...payload } : c))
          );
          setModalOpen(false);
        } else {
          toast(res.error || "Gagal memperbarui lapangan.", "error");
        }
      } else {
        // Create Action
        const res = await createCourtAction(payload);
        if (res.success) {
          toast(res.message, "success");
          // Just reload full page to fetch new generated ID and state
          window.location.reload();
        } else {
          toast(res.error || "Gagal menambah lapangan.", "error");
        }
      }
    } catch (err) {
      toast("Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 rounded-xl transition duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Tambah Lapangan Baru
        </button>
      </div>

      {/* Grid List of Courts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map((court) => (
          <div
            key={court.id}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 backdrop-blur space-y-4 flex flex-col justify-between overflow-hidden relative"
          >
            {court.imageUrl && (
              <div
                className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center"
                style={{ backgroundImage: `url(${court.imageUrl})` }}
              />
            )}
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-slate-100">{court.name}</h4>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                  court.status === "AVAILABLE"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {court.status === "AVAILABLE" ? "Aktif" : "Perbaikan"}
                </span>
              </div>

              <div className="space-y-2 mt-4 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Tipe</span>
                  <span className="font-semibold text-slate-300 uppercase">{court.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tarif</span>
                  <span className="font-bold text-emerald-400">Rp {court.pricePerHour.toLocaleString()}/Jam</span>
                </div>
                <div className="flex justify-between">
                  <span>Operasional</span>
                  <span className="font-semibold text-slate-300">{court.openTime}:00 - {court.closeTime}:00</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-800/80 relative z-10">
              <button
                onClick={() => openEditModal(court)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-lg transition border border-slate-700/50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(court.id, court.name)}
                className="flex-1 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition border border-transparent hover:border-rose-500/25"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Insert / Edit Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-100">
                {editingCourt ? "Edit Data Lapangan" : "Tambah Lapangan Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Nama Lapangan
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm transition outline-none"
                  placeholder="Lapangan A / Badminton 3"
                />
                {errors.name && <span className="text-xs text-rose-500 mt-1">{errors.name}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Tipe Olahraga
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 focus:border-violet-500 rounded-xl px-4 py-2.5 text-sm transition outline-none"
                  >
                    <option value="FUTSAL">Futsal</option>
                    <option value="BADMINTON">Badminton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Tarif Sewa (per Jam)
                  </label>
                  <input
                    type="number"
                    required
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm transition outline-none"
                  />
                  {errors.pricePerHour && <span className="text-xs text-rose-500 mt-1">{errors.pricePerHour}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Jam Buka (Operasional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    required
                    value={openTime}
                    onChange={(e) => setOpenTime(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Jam Tutup
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    required
                    value={closeTime}
                    onChange={(e) => setCloseTime(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm transition outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Status Lapangan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 focus:border-violet-500 rounded-xl px-4 py-2.5 text-sm transition outline-none"
                >
                  <option value="AVAILABLE">Aktif (Bisa Disewa)</option>
                  <option value="MAINTENANCE">Dalam Perawatan (Tutup)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Foto Lapangan (Opsional)
                </label>
                <div className="flex flex-col gap-2">
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="h-32 object-cover rounded-xl border border-slate-700" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          alert("Ukuran gambar maksimal 2MB");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImageUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-violet-500/10 file:text-violet-400 hover:file:bg-violet-500/20 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700/80 rounded-xl transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Simpan Data"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
