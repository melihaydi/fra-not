import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase,
  Activity
} from 'lucide-react';
import type { Transaction, AssetHolding } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface PortfolioViewProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  transactions,
  setTransactions,
}) => {
  const [showTransModal, setShowTransModal] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(100);
  const [category, setCategory] = useState<'crypto' | 'stock' | 'cash' | 'metal' | 'other'>('stock');

  // Simulated live prices cache to make the app feel alive and interactive
  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    BTC: 68500,
    ETH: 3550,
    AAPL: 180.5,
    TSLA: 175.2,
    GOLD: 2350,
    TRY: 0.03,
    EUR: 1.08,
  });

  // Price simulator effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(sym => {
          const changePercent = (Math.random() - 0.5) * 0.006; // +/- 0.3% fluctuation
          next[sym] = parseFloat((next[sym] * (1 + changePercent)).toFixed(2));
        });
        return next;
      });
    }, 4000); // fluctuates every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Compute holdings list from transaction log
  const holdings = useMemo(() => {
    const map: Record<string, {
      symbol: string;
      name: string;
      quantity: number;
      totalCost: number;
      category: 'crypto' | 'stock' | 'cash' | 'metal' | 'other';
    }> = {};

    const chronologicalTransactions = [...transactions].reverse();
    chronologicalTransactions.forEach(t => {
      if (!map[t.assetSymbol]) {
        // Fallback category detection
        let cat: 'crypto' | 'stock' | 'cash' | 'metal' | 'other' = 'stock';
        if (['BTC', 'ETH', 'SOL', 'DOGE'].includes(t.assetSymbol.toUpperCase())) cat = 'crypto';
        else if (['GOLD', 'SLV', 'GUMUS'].includes(t.assetSymbol.toUpperCase())) cat = 'metal';
        else if (['USD', 'EUR', 'TRY'].includes(t.assetSymbol.toUpperCase())) cat = 'cash';

        map[t.assetSymbol] = {
          symbol: t.assetSymbol.toUpperCase(),
          name: t.assetName,
          quantity: 0,
          totalCost: 0,
          category: cat
        };
      }

      const h = map[t.assetSymbol];
      if (t.type === 'buy') {
        h.quantity += t.quantity;
        h.totalCost += t.quantity * t.price;
      } else {
        // Sell
        const avgPrice = h.quantity > 0 ? h.totalCost / h.quantity : 0;
        h.quantity = Math.max(0, h.quantity - t.quantity);
        h.totalCost = h.quantity * avgPrice;
      }
    });

    // Convert map to array and assign current simulated prices
    return Object.values(map)
      .filter(h => h.quantity > 0)
      .map(h => {
        const currentPrice = livePrices[h.symbol] || h.totalCost / h.quantity; // default to average buy price if no simulated price
        return {
          symbol: h.symbol,
          name: h.name,
          quantity: h.quantity,
          avgBuyPrice: parseFloat((h.totalCost / h.quantity).toFixed(2)),
          currentPrice: parseFloat(currentPrice.toFixed(2)),
          category: h.category
        } as AssetHolding;
      });
  }, [transactions, livePrices]);

  // Compute portfolio aggregates
  const stats = useMemo(() => {
    let totalInvested = 0;
    let currentVal = 0;

    holdings.forEach(h => {
      totalInvested += h.quantity * h.avgBuyPrice;
      currentVal += h.quantity * h.currentPrice;
    });

    const netProfit = currentVal - totalInvested;
    const profitPct = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

    return {
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      currentValue: parseFloat(currentVal.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      profitPct: parseFloat(profitPct.toFixed(2)),
    };
  }, [holdings]);

  // Pie chart data for asset distribution
  const pieData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    holdings.forEach(h => {
      const val = h.quantity * h.currentPrice;
      categoryTotals[h.category] = (categoryTotals[h.category] || 0) + val;
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name: name.toUpperCase(),
      value: parseFloat(value.toFixed(2)),
    }));
  }, [holdings]);

  // Colors for Pie cells
  const COLORS = {
    STOCK: 'var(--accent-purple-light)',
    CRYPTO: 'var(--accent-orange)',
    CASH: 'var(--accent-blue)',
    METAL: 'var(--accent-green)',
    OTHER: 'var(--text-muted)'
  };

  // Mock data for area chart (Net Worth History over 7 days)
  const areaData = useMemo(() => {
    const baseValue = stats.currentValue > 0 ? stats.currentValue : 5000;
    return [
      { name: 'Pzt', NetWorth: parseFloat((baseValue * 0.94).toFixed(0)) },
      { name: 'Sal', NetWorth: parseFloat((baseValue * 0.96).toFixed(0)) },
      { name: 'Çar', NetWorth: parseFloat((baseValue * 0.95).toFixed(0)) },
      { name: 'Per', NetWorth: parseFloat((baseValue * 0.98).toFixed(0)) },
      { name: 'Cum', NetWorth: parseFloat((baseValue * 0.97).toFixed(0)) },
      { name: 'Cmt', NetWorth: parseFloat((baseValue * 0.99).toFixed(0)) },
      { name: 'Paz', NetWorth: parseFloat(baseValue.toFixed(0)) },
    ];
  }, [stats.currentValue]);

  // Add Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !name.trim()) return;

    const newTrans: Transaction = {
      id: Date.now().toString(),
      assetSymbol: symbol.toUpperCase(),
      assetName: name,
      type,
      quantity: qty,
      price,
      date: new Date().toISOString().split('T')[0],
    };

    // Update simulated prices cache if it's a new symbol
    if (livePrices[symbol.toUpperCase()] === undefined) {
      setLivePrices(prev => ({
        ...prev,
        [symbol.toUpperCase()]: price
      }));
    }

    setTransactions(prev => [newTrans, ...prev]);
    setSymbol('');
    setName('');
    setQty(1);
    setPrice(100);
    setShowTransModal(false);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="portfolio-view fade-in">
      {/* Portfolio Header Actions */}
      <div className="portfolio-actions-header glass-panel">
        <div className="portfolio-header-info">
          <h2>Yatırım Portföyü</h2>
          <p>Hisse senedi, kripto para ve değerli metallerini takip et.</p>
        </div>
        
        <button className="btn-primary" onClick={() => setShowTransModal(true)}>
          <Plus size={16} />
          İşlem Ekle (Al/Sat)
        </button>
      </div>

      {/* Aggregate Cards */}
      <div className="portfolio-stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-card-header">
            <span>Toplam Portföy Değeri</span>
            <Briefcase size={16} className="text-purple" />
          </div>
          <h3>${stats.currentValue.toLocaleString('en-US')}</h3>
          <p className="stat-card-sub">Güncel piyasa değerlerine göre</p>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-card-header">
            <span>Toplam Yatırım</span>
            <DollarSign size={16} className="text-blue" />
          </div>
          <h3>${stats.totalInvested.toLocaleString('en-US')}</h3>
          <p className="stat-card-sub">Ortalama alış maliyetinize göre</p>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-card-header">
            <span>Kar / Zarar Durumu</span>
            <Activity size={16} className={stats.netProfit >= 0 ? "text-green" : "text-red"} />
          </div>
          <h3 className={stats.netProfit >= 0 ? "text-green" : "text-red"}>
            {stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toLocaleString('en-US')}
          </h3>
          <p className={`stat-card-sub-pct ${stats.netProfit >= 0 ? "text-green" : "text-red"}`}>
            {stats.netProfit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{stats.netProfit >= 0 ? '+' : ''}{stats.profitPct}%</span>
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="portfolio-charts-container">
        {/* Net Worth Chart */}
        <div className="chart-panel area-chart-panel glass-panel">
          <div className="chart-header">
            <h4>Portföy Gelişim Grafiği (Son 7 Gün)</h4>
          </div>
          <div className="chart-wrapper">
            {stats.currentValue === 0 ? (
              <div className="empty-chart-state">İşlem eklediğinizde grafik aktifleşecektir.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-sidebar)', 
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }} 
                  />
                  <Area type="monotone" dataKey="NetWorth" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Allocation Chart */}
        <div className="chart-panel pie-chart-panel glass-panel">
          <div className="chart-header">
            <h4>Varlık Dağılımı</h4>
          </div>
          <div className="chart-wrapper pie-wrapper">
            {holdings.length === 0 ? (
              <div className="empty-chart-state">Varlık bulunamadı.</div>
            ) : (
              <div className="pie-container">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => {
                        const colKey = entry.name as keyof typeof COLORS;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[colKey] || 'var(--text-muted)'} 
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => value ? `$${Number(value).toLocaleString()}` : ''}
                      contentStyle={{ 
                        backgroundColor: 'var(--bg-sidebar)', 
                        borderColor: 'var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="pie-legend">
                  {pieData.map((entry, index) => {
                    const colKey = entry.name as keyof typeof COLORS;
                    return (
                      <div key={index} className="legend-item">
                        <div className="legend-dot" style={{ backgroundColor: COLORS[colKey] || 'var(--text-muted)' }} />
                        <span className="legend-name">{entry.name}</span>
                        <span className="legend-value">${entry.value.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Holdings & Transactions Tables */}
      <div className="portfolio-tables-grid">
        {/* Holdings Table */}
        <div className="table-card glass-panel">
          <h4>Mevcut Varlıklarım (Holdings)</h4>
          <div className="table-wrapper scrollable">
            {holdings.length === 0 ? (
              <div className="empty-table-state">Mevcut varlığınız bulunmuyor.</div>
            ) : (
              <table className="portfolio-table">
                <thead>
                  <tr>
                    <th>Sembol</th>
                    <th>Varlık Adı</th>
                    <th>Miktar</th>
                    <th>Ort. Alış</th>
                    <th>Güncel Fiyat</th>
                    <th>Piyasa Değeri</th>
                    <th>Kar/Zarar</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map(h => {
                    const cost = h.quantity * h.avgBuyPrice;
                    const value = h.quantity * h.currentPrice;
                    const pl = value - cost;
                    const plPct = cost > 0 ? (pl / cost) * 100 : 0;
                    return (
                      <tr key={h.symbol}>
                        <td className="font-bold">{h.symbol}</td>
                        <td>{h.name}</td>
                        <td>{h.quantity}</td>
                        <td>${h.avgBuyPrice}</td>
                        <td>${h.currentPrice}</td>
                        <td>${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className={pl >= 0 ? "text-green" : "text-red"}>
                          {pl >= 0 ? '+' : ''}{plPct.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="table-card glass-panel">
          <h4>İşlem Geçmişi (Logs)</h4>
          <div className="table-wrapper scrollable">
            {transactions.length === 0 ? (
              <div className="empty-table-state">Kayıtlı işlem geçmişi bulunmuyor.</div>
            ) : (
              <table className="portfolio-table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>İşlem</th>
                    <th>Sembol</th>
                    <th>Miktar</th>
                    <th>Fiyat</th>
                    <th>Sil</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td className="text-muted">{t.date}</td>
                      <td>
                        <span className={`transaction-type-badge ${t.type}`}>
                          {t.type === 'buy' ? 'AL' : 'SAT'}
                        </span>
                      </td>
                      <td className="font-bold">{t.assetSymbol}</td>
                      <td>{t.quantity}</td>
                      <td>${t.price}</td>
                      <td>
                        <button 
                          className="delete-trans-btn" 
                          onClick={() => handleDeleteTransaction(t.id)}
                          title="İşlemi Sil"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showTransModal && (
        <div className="modal-backdrop">
          <div className="modal-content fade-in">
            <h3>Yeni Yatırım İşlemi Ekle</h3>
            
            <form onSubmit={handleAddTransaction} className="add-task-form">
              <div className="time-picker-row">
                <div className="form-group">
                  <label>Varlık Tipi</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="stock">Hisse Senedi (Stock)</option>
                    <option value="crypto">Kripto Para (Crypto)</option>
                    <option value="metal">Değerli Metal (Gold/Silver)</option>
                    <option value="cash">Nakit (Cash/Fiat)</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>İşlem Türü</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as 'buy' | 'sell')}
                  >
                    <option value="buy">Alış (BUY)</option>
                    <option value="sell">Satış (SELL)</option>
                  </select>
                </div>
              </div>

              <div className="time-picker-row">
                <div className="form-group">
                  <label>Sembol (Örn: BTC, AAPL)</label>
                  <input 
                    type="text" 
                    placeholder="BTC" 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Varlık İsmi (Örn: Bitcoin)</label>
                  <input 
                    type="text" 
                    placeholder="Bitcoin" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="time-picker-row">
                <div className="form-group">
                  <label>Miktar (Adet)</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0.000001"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Birim Alış/Satış Fiyatı ($)</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0.001"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer-btns">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowTransModal(false)}
                >
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .portfolio-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
          width: 100%;
        }

        .portfolio-actions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
        }

        .portfolio-header-info h2 {
          font-size: 20px;
          margin-bottom: 4px;
        }

        /* Stats Grid */
        .portfolio-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stat-card {
          padding: 16px 20px;
          text-align: left;
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .stat-card h3 {
          font-size: 24px;
          font-weight: 700;
        }

        .stat-card-sub {
          font-size: 11px;
          color: var(--text-muted);
        }

        .stat-card-sub-pct {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
        }

        /* Color classes */
        .text-green { color: var(--accent-green) !important; }
        .text-red { color: var(--accent-red) !important; }
        .text-purple { color: var(--accent-light) !important; }
        .text-blue { color: var(--accent-blue) !important; }
        .font-bold { font-weight: 700; }

        /* Charts Layout */
        .portfolio-charts-container {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 16px;
        }

        .chart-panel {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: var(--bg-card);
        }

        .chart-header h4 {
          font-size: 14px;
          text-align: left;
          color: var(--text-primary);
        }

        .chart-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 220px;
        }

        .empty-chart-state {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* Pie styling */
        .pie-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .pie-legend {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 11px;
          width: 100%;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
          flex-shrink: 0;
        }

        .legend-name {
          color: var(--text-secondary);
          flex: 1;
          text-align: left;
        }

        .legend-value {
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Tables Grid */
        .portfolio-tables-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 16px;
          min-height: 0;
        }

        .table-card {
          padding: 18px;
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 300px;
        }

        .table-card h4 {
          font-size: 14px;
          text-align: left;
        }

        .table-wrapper {
          flex: 1;
          overflow-y: auto;
        }

        .empty-table-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          font-size: 12px;
          border: 1px dashed var(--border);
          border-radius: 8px;
        }

        /* Tables */
        .portfolio-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 12px;
        }

        .portfolio-table th {
          color: var(--text-muted);
          font-weight: 600;
          padding: 8px 10px;
          border-bottom: 1px solid var(--border);
        }

        .portfolio-table td {
          padding: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          color: var(--text-secondary);
        }

        .portfolio-table tr:hover td {
          background-color: rgba(255, 255, 255, 0.01);
          color: var(--text-primary);
        }

        .transaction-type-badge {
          font-size: 9px;
          font-weight: 850;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .transaction-type-badge.buy {
          background-color: var(--accent-green-bg);
          color: var(--accent-green);
        }

        .transaction-type-badge.sell {
          background-color: var(--accent-red-bg);
          color: var(--accent-red);
        }

        .delete-trans-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .delete-trans-btn:hover {
          color: var(--accent-red);
          background: var(--accent-red-bg);
        }
      `}</style>
    </div>
  );
};
