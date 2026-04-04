import { useState, useMemo } from "react";
import {
  Users, Plus, Search, Phone, Mail, Building2, Tag, Trash2,
  ChevronRight, X, Edit2, MessageSquare, Package
} from "lucide-react";
import { useClients } from "@/lib/hooks";
import { useFabricatedProjects, useProjects } from "@/lib/hooks";
import type { Client } from "@/lib/types";
import { formatCLP } from "@/lib/types";

const TAG_PRESETS = ["3D", "Foto", "Frecuente", "Empresa", "Particular"];

const Clients = () => {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { fabricated } = useFabricatedProjects();
  const { projects } = useProjects();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [clients, search]);

  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setCompany(""); setNotes(""); setTags([]);
    setEditingId(null); setShowForm(false);
  };

  const openEdit = (client: Client) => {
    setName(client.name); setEmail(client.email); setPhone(client.phone);
    setCompany(client.company); setNotes(client.notes); setTags([...client.tags]);
    setEditingId(client.id); setShowForm(true); setSelectedId(null);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const data = { name: name.trim(), email: email.trim(), phone: phone.trim(), company: company.trim(), notes: notes.trim(), tags };
    if (editingId) {
      updateClient(editingId, data);
    } else {
      addClient(data);
    }
    resetForm();
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const selectedClient = selectedId ? clients.find((c) => c.id === selectedId) : null;

  // Get client history
  const clientHistory = useMemo(() => {
    if (!selectedId) return [];
    return fabricated
      .filter((f) => f.clientId === selectedId)
      .sort((a, b) => b.date - a.date);
  }, [selectedId, fabricated]);

  const clientTotalSpent = useMemo(() => {
    return clientHistory.reduce((s, f) => s + f.salePrice, 0);
  }, [clientHistory]);

  // Detail view
  if (selectedClient) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6 space-y-5">
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Volver a clientes
        </button>

        <div className="rounded-xl bg-card border p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{selectedClient.name}</h2>
              {selectedClient.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3 w-3" /> {selectedClient.company}
                </p>
              )}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => openEdit(selectedClient)} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => { deleteClient(selectedClient.id); setSelectedId(null); }}
                className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-2">
            {selectedClient.email && (
              <a href={`mailto:${selectedClient.email}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                <Mail className="h-3.5 w-3.5" /> {selectedClient.email}
              </a>
            )}
            {selectedClient.phone && (
              <a href={`tel:${selectedClient.phone}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                <Phone className="h-3.5 w-3.5" /> {selectedClient.phone}
              </a>
            )}
          </div>

          {/* Tags */}
          {selectedClient.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedClient.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-[10px] font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {selectedClient.notes && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <MessageSquare className="h-3 w-3" /> Notas
              </p>
              <p className="text-sm whitespace-pre-wrap">{selectedClient.notes}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-card border p-3 space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pedidos</p>
            <p className="text-lg font-bold font-mono">{clientHistory.length}</p>
          </div>
          <div className="rounded-xl bg-card border p-3 space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total facturado</p>
            <p className="text-lg font-bold font-mono text-accent">{formatCLP(clientTotalSpent)}</p>
          </div>
        </div>

        {/* Order history */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Historial de pedidos</h3>
          {clientHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm rounded-xl border-2 border-dashed">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Sin pedidos asociados
            </div>
          ) : (
            <div className="space-y-1.5">
              {clientHistory.map((f) => {
                const project = projects.find((p) => p.id === f.projectId);
                return (
                  <div key={f.id} className="flex items-center justify-between rounded-lg bg-card border px-3 py-2.5">
                    <div>
                      <p className="text-xs font-medium">{project?.name || "Proyecto eliminado"}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(f.date).toLocaleDateString("es-CL")}</p>
                    </div>
                    <span className="text-xs font-mono font-medium text-accent">
                      {f.isFree ? "Gratis" : formatCLP(f.salePrice)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Cliente desde {new Date(selectedClient.createdAt).toLocaleDateString("es-CL")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Nuevo
        </button>
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar por nombre, email, empresa o tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-card pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-xl bg-card border p-4 space-y-3 animate-fade-in-up">
          <h3 className="text-sm font-semibold">{editingId ? "Editar cliente" : "Nuevo cliente"}</h3>

          <input
            placeholder="Nombre *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Teléfono"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <input
            placeholder="Empresa / Organización"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />

          {/* Tags */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Etiquetas</p>
            <div className="flex flex-wrap gap-1.5">
              {TAG_PRESETS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    tags.includes(tag)
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Notas (preferencias, observaciones...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground disabled:opacity-50"
            >
              {editingId ? "Guardar cambios" : "Crear cliente"}
            </button>
            <button onClick={resetForm} className="rounded-lg border px-3 py-2 text-xs">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Client list */}
      {filtered.length === 0 && !showForm ? (
        <div className="rounded-xl border-2 border-dashed py-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">
            {clients.length === 0 ? "Aún no tienes clientes" : "Sin resultados"}
          </p>
          {clients.length === 0 && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              Agrega tu primer cliente para empezar a llevar su historial.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((client) => {
            const orderCount = fabricated.filter((f) => f.clientId === client.id).length;
            return (
              <button
                key={client.id}
                onClick={() => setSelectedId(client.id)}
                className="w-full text-left rounded-xl bg-card border px-3.5 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors active:scale-[0.99]"
              >
                <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-accent">{client.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{client.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {client.company && (
                      <span className="text-[10px] text-muted-foreground truncate">{client.company}</span>
                    )}
                    {orderCount > 0 && (
                      <span className="text-[10px] text-muted-foreground">{orderCount} pedido{orderCount !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                  {client.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {client.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-accent/10 text-accent px-1.5 py-0.5 text-[8px] font-medium">
                          {tag}
                        </span>
                      ))}
                      {client.tags.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{client.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {clients.length > 0 && (
        <p className="text-[10px] text-muted-foreground text-center">{clients.length} cliente{clients.length !== 1 ? "s" : ""}</p>
      )}
    </div>
  );
};

export default Clients;
