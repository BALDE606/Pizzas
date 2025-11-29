import React, { useState, useEffect } from 'react';
import './CorteCaja.css';

const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:3000';

type PedidoLinea = {
  id: number;
  fecha?: string;
  nombre?: string;
  importe?: number;
};

const CorteCaja: React.FC = () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState<string>(todayStr);
  const [desde, setDesde] = useState<string>('');
  const [hasta, setHasta] = useState<string>('');
  const [useRange, setUseRange] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ total: number; total_pedidos: number } | null>(null);
  const [pedidos, setPedidos] = useState<PedidoLinea[]>([]);

  async function fetchCorte() {
    setLoading(true);
    setError(null);
    setSummary(null);
    setPedidos([]);
    try {
      let url = '';
      if (useRange) {
        if (!desde || !hasta) throw new Error('Ingrese desde y hasta');
        url = `${API_BASE}/corte?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`;
      } else {
        if (!fecha) throw new Error('Ingrese una fecha');
        url = `${API_BASE}/corte?fecha=${encodeURIComponent(fecha)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setSummary(data.summary ?? null);
      setPedidos(data.pedidos ?? []);
    } catch (e: any) {
      setError(e.message || 'Error al obtener corte');
    } finally {
      setLoading(false);
    }
  }

  // Al montarse, hacer el corte del día actual automáticamente
  useEffect(() => {
    // asegurar que fecha tenga la fecha de hoy
    if (!fecha) setFecha(todayStr);
    // llamar a la búsqueda automática (no usar rango)
    if (!useRange) {
      fetchCorte();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="corte-caja">
      <h3>Corte de caja</h3>
      <div className="corte-controls">
        <label className="toggle-range">
          <input type="checkbox" checked={useRange} onChange={e => setUseRange(e.target.checked)} /> Usar rango
        </label>

        {!useRange ? (
          <label>
            Fecha:
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </label>
        ) : (
          <div className="range-inputs">
            <label>
              Desde:
              <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
            </label>
            <label>
              Hasta:
              <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
            </label>
          </div>
        )}

        <div className="acciones">
          <button onClick={fetchCorte} disabled={loading}>{loading ? 'Cargando...' : 'Buscar'}</button>
        </div>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {summary && (
        <div className="resumen">
          <div><strong>Total pedidos:</strong> {summary.total_pedidos}</div>
          <div><strong>Importe total:</strong> ${summary.total?.toFixed?.(2) ?? summary.total}</div>
        </div>
      )}

      {pedidos && pedidos.length > 0 && (
        <ul className="lista-corte">
          {pedidos.map(p => (
            <li key={p.id} className="corte-item">
              <div className="left">
                <div className="nombre">{p.nombre}</div>
                <div className="meta">Id: {p.id} • {p.fecha ? new Date(p.fecha).toLocaleString() : ''}</div>
              </div>
              <div className="importe">${(Number(p.importe) || 0).toFixed(2)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CorteCaja;
