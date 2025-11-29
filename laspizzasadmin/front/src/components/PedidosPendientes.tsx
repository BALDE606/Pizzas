import React, { useEffect, useState } from 'react';
import './PedidosPendientes.css';

type PizzaItem = { nombre?: string; description?: string; precio?: number; cantidad?: number };
type Pedido = {
    id: number;
    fecha?: string;
    nombre: string;
    direccion?: string;
    telefono?: string;
    importe?: number;
    pizzas?: PizzaItem[] | any;
    estatus?: number;
};

const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:3000';

const estadosMap: Record<number, string> = {
    0: 'pendiente',
    1: 'entregado',
    3: 'cancelado'
};

const PedidosPendientes: React.FC = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [changing, setChanging] = useState<Record<number, boolean>>({});

    async function fetchPendientes() {
    setLoading(true);
    setError(null);
    try {
        const res = await fetch(`${API_BASE}/pedidos/pending`);
        if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
        const data = await res.json();
        setPedidos(data || []);
    } catch (e: any) {
        setError(e.message || 'Error al obtener pedidos');
    } finally {
        setLoading(false);
    }
    }

    useEffect(() => {
    fetchPendientes();
    }, []);

    async function cambiarEstado(id: number, nuevoEstado: number) {
    setChanging(prev => ({ ...prev, [id]: true }));
    try {
        const res = await fetch(`${API_BASE}/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
        });
        if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
        }

      // Si el pedido ya no es pendiente, lo removemos de la lista local
        if (nuevoEstado !== 0) {
        setPedidos(prev => prev.filter(p => p.id !== id));
        } else {
        // si cambiamos a pendiente (0), refrescamos la lista
        fetchPendientes();
        }
    } catch (e: any) {
        alert('No se pudo cambiar el estado: ' + (e?.message || 'error'));
    } finally {
        setChanging(prev => ({ ...prev, [id]: false }));
    }
    }

    if (loading) return <div className="pedidos-pendientes"><p>Cargando pedidos pendientes...</p></div>;
    if (error) return <div className="pedidos-pendientes error">Error: {error}</div>;

    return (
    <div className="pedidos-pendientes">
    <h3>Pedidos pendientes</h3>
        {pedidos.length === 0 ? (
        <p>No hay pedidos pendientes.</p>
        ) : (
        <ul className="lista-pedidos">
            {pedidos.map(p => (
            <li key={p.id} className="pedido-item">
                <div className="pedido-main">
                <div>
                    <strong>{p.nombre}</strong>
                    <div className="meta">Id: {p.id} • {p.fecha ? new Date(p.fecha).toLocaleString() : ''}</div>
                    <div className="meta">Importe: ${p.importe?.toFixed?.(2) ?? p.importe}</div>
                </div>
                <div className="acciones">
                    <label>
                    Estado:
                    <select defaultValue={String(p.estatus ?? 0)} onChange={e => {
                        const nuevo = Number(e.target.value);
                        if (isNaN(nuevo)) return;
                        if (!confirm(`Cambiar estado a "${estadosMap[nuevo]}"?`)) return;
                        cambiarEstado(p.id, nuevo);
                    }} disabled={!!changing[p.id]}>
                        {Object.entries(estadosMap).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    </label>
                </div>
                </div>

                {(() => {
                const raw = p.pizzas as any;
                const pizzasArray = typeof raw === 'string' ? (() => {
                    try { return JSON.parse(raw); } catch { return []; }
                })() : (Array.isArray(raw) ? raw : []);

                return pizzasArray.length > 0 ? (
                    <div className="pedido-pizzas">
                    {pizzasArray.map((pz: any, idx: number) => (
                        <div key={idx} className="pizza-line">{pz.nombre ?? pz.description ?? 'Pizza'} x {pz.cantidad ?? pz.cantidad}</div>
                    ))}
                    </div>
                ) : null;
                })()}
            </li>
            ))}
        </ul>
        )}
        <div className="acciones-globales">
        <button onClick={fetchPendientes}>Refrescar</button>
        </div>
    </div>
    );
}

export default PedidosPendientes;
