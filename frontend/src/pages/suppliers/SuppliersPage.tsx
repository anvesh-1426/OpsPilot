import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Star, Phone, Mail, MapPin, Truck } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, Card, Button, Modal, EmptyState, LoadingSpinner } from '../../components/ui';

const defaultForm = { name: '', email: '', phone: '', address: '', city: '', country: 'USA' };

export const SuppliersPage: React.FC = () => {
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const qc = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => { const { data } = await api.get('/purchase/suppliers'); return data.data; },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/purchase/suppliers', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setModal(null); setForm(defaultForm); },
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => api.put(`/purchase/suppliers/${selected.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setModal(null); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    modal === 'create' ? createMutation.mutate(form) : updateMutation.mutate(form);
  };

  const openEdit = (s: any) => {
    setSelected(s);
    setForm({ name: s.name, email: s.email || '', phone: s.phone || '', address: s.address || '', city: s.city || '', country: s.country || 'USA' });
    setModal('edit');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage vendor relationships and supply channels"
        actions={<Button icon={<Plus size={16} />} onClick={() => { setForm(defaultForm); setModal('create'); }}>Add Supplier</Button>}
      />

      {isLoading ? <div className="py-20"><LoadingSpinner /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {suppliers?.map((s: any, idx: number) => {
            const rating = 4 + (idx % 2 === 0 ? 0.8 : 0.4);
            return (
              <div key={s.id} className="card-premium p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{s.name}</h3>
                    <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs font-semibold">
                      <Star size={14} className="fill-current" />
                      <span>{rating.toFixed(1)} / 5.0 Rating</span>
                    </div>
                  </div>
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                    <Edit size={15} />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-5">
                  {s.email && <p className="flex items-center gap-2 text-xs"><Mail size={13} className="text-slate-400" />{s.email}</p>}
                  {s.phone && <p className="flex items-center gap-2 text-xs"><Phone size={13} className="text-slate-400" />{s.phone}</p>}
                  {s.city && <p className="flex items-center gap-2 text-xs"><MapPin size={13} className="text-slate-400" />{s.city}, {s.country}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-lg font-bold text-slate-800">{s._count?.products || 0}</p>
                    <p className="text-[11px] text-slate-400">Catalog Products</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-lg font-bold text-slate-800">{s._count?.purchaseOrders || 0}</p>
                    <p className="text-[11px] text-slate-400">Total POs</p>
                  </div>
                </div>
              </div>
            );
          })}

          {!suppliers?.length && (
            <div className="col-span-3">
              <Card>
                <EmptyState icon={<Truck size={28} />} title="No suppliers" description="Add your first supplier vendor." action={<Button icon={<Plus size={16} />} onClick={() => setModal('create')}>Add Supplier</Button>} />
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Supplier' : 'Edit Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Vendor / Company Name *</label>
            <input required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Global Tech Supply Corp" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">City</label>
              <input className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Country</label>
              <input className="form-input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="form-label">Address</label>
            <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModal(null)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {modal === 'create' ? 'Add Supplier' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
