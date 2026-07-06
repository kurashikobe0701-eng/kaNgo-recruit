import { useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { ConfigContext } from '../ConfigContext';
import { collection, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const INITIAL_HIRED = [
  {name:'前田',joinDate:'2021年7月',client:'SMS',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'本多',joinDate:'2022年4月',client:'SMS',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'鈴木',joinDate:'2022年6月',client:'SMS',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'篠田',joinDate:'2023年5月',client:'SMS',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'永久',joinDate:'2024年3月',client:'直接',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'米田',joinDate:'2024年10月',client:'メディカルコンシェルジュ',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'谷本',joinDate:'2025年2月',client:'クイック',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'筒水',joinDate:'2025年3月',client:'レバ',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'瀬藤',joinDate:'2025年5月',client:'レバ',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'鴨頭',joinDate:'2025年7月',client:'SMS',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'橋本',joinDate:'2026年1月',client:'クイック',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'湊',joinDate:'2026年2月',client:'MOT',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'林',joinDate:'2026年4月',client:'マイナビ',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'宇佐美',joinDate:'2026年4月',client:'AGREE',fb:'',memo:'',resigned:false,resignDate:''},
  {name:'久保',joinDate:'2026年9月',client:'マイナビ',fb:'',memo:'',resigned:false,resignDate:''},
];
const CLIENT_COLORS = {
  'SMS': '#22c55e',
  'レバ': '#ef4444',
  'クイック': '#f59e0b',
  'マイナビ': '#60a5fa',
  'MOT': '#3b82f6',
  'AGREE': '#1e3a8a',
  'メディカルコンシェルジュ': '#d97706',
  '直接': '#8b5cf6',
  'その他': '#9ca3af'
};

export default function HiredPage() {
  const { config } = useContext(ConfigContext);
  const [hired, setHired] = useState([]);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [clients, setClients] = useState([]);
  const [years, setYears] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    joinDate: '',
    client: '',
    fb: '',
    memo: '',
    resigned: false,
    resignDate: ''
  });

  useEffect(() => {
    const unsubscribe = loadHired();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (config.clients) setClients(config.clients);
  }, [config]);

  const extractYear = (dateStr) => {
    const match = (dateStr || '').match(/(\d{4})/);
    return match ? match[1] : '—';
  };

  const initializeData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'hired'));
      if (querySnapshot.docs.length === 0) {
        for (const entry of INITIAL_HIRED) {
          await addDoc(collection(db, 'hired'), entry);
        }
      }
    } catch (error) {
      console.error('Error initializing:', error);
    }
  };

  const loadHired = () => {
    const unsubscribe = onSnapshot(
      collection(db, 'hired'),
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHired(data);
        updateFilters(data);

        if (data.length === 0) {
          initializeData();
        }
      },
      (error) => {
        console.error('Error loading:', error);
      }
    );

    return unsubscribe;
  };

  const updateFilters = (data) => {
    const uniqueClients = [...new Set(data.map(d => d.client).filter(Boolean))];
    const uniqueYears = [...new Set(data.map(d => extractYear(d.joinDate)).filter(y => y !== '—'))].sort();
    setClients(uniqueClients);
    setYears(uniqueYears);
  };

  const clientBadge = (client) => {
    const color = (config.clientColors && config.clientColors[client]) || '#9ca3af';
    const light = ['SMS', 'クイック', 'マイナビ', 'その他'].includes(client);
    return <span className="client-badge" style={{ background: color, color: light ? '#1A1816' : 'white' }}>{client || '—'}</span>;
  };

  const openModal = (id = null) => {
    if (id) {
      const person = hired.find(h => h.id === id);
      if (person) {
        setFormData({
          name: person.name || '',
          joinDate: person.joinDate || '',
          client: person.client || '',
          fb: person.fb || '',
          memo: person.memo || '',
          resigned: person.resigned || false,
          resignDate: person.resignDate || ''
        });
        setEditingId(id);
      }
    } else {
      setFormData({
        name: '',
        joinDate: '',
        client: '',
        fb: '',
        memo: '',
        resigned: false,
        resignDate: ''
      });
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const saveEntry = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'hired', editingId), formData);
      } else {
        await addDoc(collection(db, 'hired'), formData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const deleteHired = async (id) => {
    if (!window.confirm('このデータを削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'hired', id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const toggleEmployment = async (id) => {
    const person = hired.find(h => h.id === id);
    if (!person.resigned) {
      openModal(id);
    } else {
      await updateDoc(doc(db, 'hired', id), { resigned: false, resignDate: '' });
    }
  };

  const filtered = hired.filter(h => {
    if (search && ![h.name, h.client, h.joinDate, h.memo].join(' ').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterClient && h.client !== filterClient) return false;
    if (filterYear && extractYear(h.joinDate) !== filterYear) return false;
    return true;
  });

  const counts = {};
  hired.forEach(h => { if (h.client) counts[h.client] = (counts[h.client] || 0) + 1; });
  const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const groupedByYear = {};
  filtered.forEach(h => {
    const y = extractYear(h.joinDate);
    if (!groupedByYear[y]) groupedByYear[y] = [];
    groupedByYear[y].push(h);
  });
  const sortedYears = Object.keys(groupedByYear).sort().reverse();

  const thisYear = new Date().getFullYear().toString();
  const thisYearCount = hired.filter(h => extractYear(h.joinDate) === thisYear).length;
  const total = hired.length;
  const active = hired.filter(h => !h.resigned).length;
  const resigned = hired.filter(h => h.resigned).length;
  const topClient = sortedCounts[0];

  return (
    <div>
      <div className="card">
        <h2>サマリー</h2>
        <div className="summary">
          <div className="summary-card">
            <div className="summary-label">累計採用数</div>
            <div className="summary-value">{total}名</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">{thisYear}年採用</div>
            <div className="summary-value" style={{ color: 'var(--green)' }}>{thisYearCount}名</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">在職中</div>
            <div className="summary-value" style={{ color: 'var(--green)' }}>{active}名</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">退職済み</div>
            <div className="summary-value" style={{ color: 'var(--red)' }}>{resigned}名</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">最多取引先</div>
            <div className="summary-value" style={{ fontSize: '16px', marginTop: '4px' }}>{topClient ? topClient[0] : '—'}</div>
            <div className="summary-sub">{topClient ? topClient[1] + '名' : ''}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>取引先別 採用数ランキング</h2>
        {sortedCounts.map(([name, count], i) => (
          <div key={name} className="rank-row">
            <div className="rank-num">{i + 1}</div>
            <div className="rank-name">{name}</div>
            <div className="rank-bar-bg">
              <div className="rank-bar-fill" style={{ width: `${Math.round(count / sortedCounts[0][1] * 100)}%`, background: (config.clientColors && config.clientColors[name]) || '#9ca3af' }}></div>
            </div>
            <div className="rank-count">{count}名</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, border: 'none', padding: 0 }}>採用実績一覧</h2>
          <button className="btn-primary" onClick={() => openModal()}>＋ 新規追加</button>
        </div>

        <div className="filter-row">
          <span className="filter-label">検索</span>
          <input type="text" placeholder="名前・取引先など" value={search} onChange={(e) => setSearch(e.target.value)} />
          <span className="filter-label">取引先</span>
          <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
            <option value="">すべて</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="filter-label">年</span>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">すべて</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn-secondary" onClick={() => { setSearch(''); setFilterClient(''); setFilterYear(''); }}>リセット</button>
        </div>

        {sortedYears.length === 0 ? (
          <div className="empty-state">データがありません</div>
        ) : (
          sortedYears.map(year => {
            const rows = groupedByYear[year];
            const hiredCount = rows.length;
            const resignedCount = rows.filter(h => h.resigned).length;
            const activeCount = hiredCount - resignedCount;

            return (
              <div key={year} className="year-section">
                <div className="year-header" onClick={(e) => {
                  e.currentTarget.classList.toggle('open');
                  e.currentTarget.nextElementSibling.classList.toggle('open');
                }}>
                  <span>{year}年</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="year-meta">
                      <span>採用 {hiredCount}名</span>
                      <span style={{ color: 'var(--green)' }}>在職中 {activeCount}名</span>
                      <span style={{ color: 'var(--red)' }}>退職 {resignedCount}名</span>
                    </div>
                    <span className="arrow">▼</span>
                  </div>
                </div>
                <div className="year-body">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>求職者名</th>
                          <th>入職時期</th>
                          <th>取引先</th>
                          <th>FB（1ヶ月後）</th>
                          <th>在職状況</th>
                          <th>メモ</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(h => (
                          <tr key={h.id}>
                            <td><strong>{h.name || '—'}</strong></td>
                            <td>{h.joinDate || '—'}</td>
                            <td>{clientBadge(h.client)}</td>
                            <td>{h.fb || '—'}</td>
                            <td>
                              <button onClick={() => toggleEmployment(h.id)} style={{ border: 'none', borderRadius: '12px', padding: '3px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', background: h.resigned ? '#FEE2E2' : '#E8F5F1', color: h.resigned ? '#B91C1C' : '#1D7A5F' }}>
                                {h.resigned ? (h.resignDate ? h.resignDate + '退職' : '退職済み') : '在職中'}
                              </button>
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{h.memo || '—'}</td>
                            <td>
                              <button className="action-btn" onClick={() => openModal(h.id)}>編集</button>
                              <button className="action-btn" onClick={() => deleteHired(h.id)}>削除</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => {
          if (e.target.className === 'modal-overlay') closeModal();
        }}>
          <div className="modal" style={{ width: '90%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editingId ? '編集' : '新規追加'}</h3>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>求職者名</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>入職時期（例：2026年4月）</label>
                <input type="text" value={formData.joinDate} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} placeholder="2026年4月" />
              </div>
              <div className="form-group">
                <label>取引先</label>
                <select value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })}>
                  <option value="">—</option>
                  {(config.clients || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>FB（1ヶ月後）</label>
                <select value={formData.fb} onChange={(e) => setFormData({ ...formData, fb: e.target.value })}>
                  <option value="">—</option>
                  <option value="済み">済み</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>メモ</label>
                <input type="text" value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} />
              </div>
              {editingId && !formData.resigned && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>退職年月</label>
                  <input type="month" value={formData.resignDate ? formData.resignDate.replace('年', '-').replace('月', '') : ''} onChange={(e) => {
                    if (e.target.value) {
                      const [y, m] = e.target.value.split('-');
                      setFormData({ ...formData, resigned: true, resignDate: `${y}年${parseInt(m)}月` });
                    }
                  }} />
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={closeModal}>キャンセル</button>
              <button className="btn-primary" onClick={saveEntry}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}