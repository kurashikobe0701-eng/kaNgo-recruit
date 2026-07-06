import { useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { ConfigContext } from '../ConfigContext';
import { collection, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const INITIAL_MANAGE = [
  {date:'2026/01/22',name:'',status:'面接日時決定',interviewDate:'2/23',client:'SMS',staff:'田中さん',jobType:'看護師',startMonth:'6月',area:'エリア外(引越し予定)',result:'バラシ',finalResult:'',memo:''},
  {date:'2026/01/19',name:'藤定さん',status:'見学日時決定',interviewDate:'',client:'SMS',staff:'田中さん',jobType:'看護師',startMonth:'4月',area:'中央区',result:'バラシ',finalResult:'',memo:''},
  {date:'2026/01/28',name:'田村さん',status:'面接日時決定',interviewDate:'',client:'マイナビ',staff:'原さん',jobType:'看護師',startMonth:'2月',area:'',result:'不採用',finalResult:'',memo:''},
  {date:'2026/02/05',name:'北山さん',status:'面接日時決定',interviewDate:'2/17',client:'レバ',staff:'井関さん',jobType:'看護師',startMonth:'4月',area:'中央区',result:'不採用',finalResult:'',memo:''},
  {date:'2026/01/30',name:'堤さん',status:'面接日時決定',interviewDate:'2/13',client:'SMS',staff:'田中さん',jobType:'看護師',startMonth:'6月',area:'中央区',result:'不採用',finalResult:'',memo:''},
  {date:'2026/01/28',name:'上野山さん',status:'見学希望',interviewDate:'2/23',client:'クイック',staff:'中岡さん',jobType:'看護師',startMonth:'10月',area:'西宮市',result:'バラシ',finalResult:'',memo:''},
  {date:'2026/02/25',name:'久保さん',status:'面接日時決定',interviewDate:'3/18',client:'マイナビ',staff:'原さん',jobType:'看護師',startMonth:'9月',area:'その他',result:'採用',finalResult:'内定受理',memo:''},
  {date:'2026/03/04',name:'古田さん',status:'面接日時決定',interviewDate:'3/16',client:'マイナビ',staff:'原さん',jobType:'看護師',startMonth:'4月',area:'',result:'バラシ',finalResult:'',memo:''},
  {date:'2026/03/03',name:'',status:'面接日時決定',interviewDate:'',client:'その他',staff:'青柳さん',jobType:'OT',startMonth:'',area:'',result:'バラシ',finalResult:'',memo:''},
  {date:'2026/03/18',name:'山崎友加奈',status:'面接日時決定',interviewDate:'4/10',client:'AGREE',staff:'甲元さん',jobType:'看護師',startMonth:'5月',area:'中央区',result:'不採用',finalResult:'',memo:''},
  {date:'2026/03/30',name:'野村美優',status:'面接日時決定',interviewDate:'4/30',client:'直接',staff:'',jobType:'看護師',startMonth:'7月',area:'その他',result:'不採用',finalResult:'',memo:''},
  {date:'2026/04/06',name:'上月奈緒',status:'面接日時決定',interviewDate:'4/30',client:'レバ',staff:'井関さん',jobType:'看護師',startMonth:'来年4月',area:'中央区',result:'不採用',finalResult:'',memo:''},
  {date:'2026/04/09',name:'吉木実有',status:'面接日時決定',interviewDate:'4/20',client:'マイナビ',staff:'原さん',jobType:'看護師',startMonth:'9月',area:'灘区',result:'不採用',finalResult:'',memo:''},
  {date:'2026/04/16',name:'野村優美',status:'面接日時決定',interviewDate:'4/30',client:'直接',staff:'',jobType:'看護師',startMonth:'7月',area:'その他',result:'不採用',finalResult:'',memo:''},
  {date:'2026/04/27',name:'尾坂直昭',status:'面接日時決定',interviewDate:'5/11',client:'レバ',staff:'原田さん',jobType:'看護師',startMonth:'7月',area:'東灘区',result:'バラシ',finalResult:'',memo:''},
  {date:'2026/04/30',name:'20代後半女性',status:'求職者の意思確認中',interviewDate:'',client:'SMS',staff:'秋定さん',jobType:'看護師',startMonth:'9月',area:'灘区',result:'',finalResult:'',memo:''},
  {date:'2026/05/12',name:'塗木拓夢',status:'面接日時決定',interviewDate:'5/22',client:'レバ',staff:'横山さん',jobType:'看護師',startMonth:'7月',area:'その他',result:'',finalResult:'',memo:''},
];

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

export default function ManagePage() {
  const { config } = useContext(ConfigContext);
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    name: '',
    status: '',
    interviewDate: '',
    client: '',
    staff: '',
    jobType: '看護師',
    startMonth: '',
    area: '',
    result: '',
    finalResult: '',
    memo: ''
  });

  useEffect(() => {
    const unsubscribe = loadCandidates();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (config.statuses) setStatuses(config.statuses);
    if (config.clients) setClients(config.clients);
  }, [config]);

  const initializeData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'manage'));
      if (querySnapshot.docs.length === 0) {
        for (const entry of INITIAL_MANAGE) {
          await addDoc(collection(db, 'manage'), entry);
        }
      }
    } catch (error) {
      console.error('Error initializing:', error);
    }
  };

  const loadCandidates = () => {
    const unsubscribe = onSnapshot(
      collection(db, 'manage'),
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCandidates(data);
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
    const uniqueStatuses = [...new Set(data.map(d => d.status).filter(Boolean))];
    const uniqueClients = [...new Set(data.map(d => d.client).filter(Boolean))];
    setStatuses(uniqueStatuses);
    setClients(uniqueClients);
  };

  const statusBadge = (status) => {
    if (!status) return <span className="badge badge-gray">—</span>;
    if (['面接日時決定', '見学日時決定', '説明会日時決定'].includes(status)) return <span className="badge badge-green">{status}</span>;
    if (status === '内定') return <span className="badge badge-blue">{status}</span>;
    if (['不採用', '辞退'].includes(status)) return <span className="badge badge-red">{status}</span>;
    if (['求職者の意思確認中', '面接日時調整中'].includes(status)) return <span className="badge badge-amber">{status}</span>;
    return <span className="badge badge-gray">{status}</span>;
  };

  const resultBadge = (result) => {
    if (!result) return <span className="badge badge-gray">—</span>;
    if (['採用', '内定受理'].includes(result)) return <span className="badge badge-green">{result}</span>;
    if (result === '不採用') return <span className="badge badge-red">{result}</span>;
    if (result === 'バラシ') return <span className="badge badge-amber">{result}</span>;
    return <span className="badge badge-gray">{result}</span>;
  };

  const clientBadge = (client) => {
    const color = (config.clientColors && config.clientColors[client]) || '#9ca3af';
    const light = ['SMS', 'クイック', 'マイナビ', 'その他'].includes(client);
    return <span className="client-badge" style={{ background: color, color: light ? '#1A1816' : 'white' }}>{client || '—'}</span>;
  };

  const openModal = (id = null) => {
    if (id) {
      const candidate = candidates.find(c => c.id === id);
      if (candidate) {
        setFormData({
          date: candidate.date || '',
          name: candidate.name || '',
          status: candidate.status || '',
          interviewDate: candidate.interviewDate || '',
          client: candidate.client || '',
          staff: candidate.staff || '',
          jobType: candidate.jobType || '看護師',
          startMonth: candidate.startMonth || '',
          area: candidate.area || '',
          result: candidate.result || '',
          finalResult: candidate.finalResult || '',
          memo: candidate.memo || ''
        });
        setEditingId(id);
      }
    } else {
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        name: '',
        status: '',
        interviewDate: '',
        client: '',
        staff: '',
        jobType: '看護師',
        startMonth: '',
        area: '',
        result: '',
        finalResult: '',
        memo: ''
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
        await updateDoc(doc(db, 'manage', editingId), formData);
      } else {
        await addDoc(collection(db, 'manage'), formData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const deleteCandidate = async (id) => {
    if (!window.confirm('このデータを削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'manage', id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const filtered = candidates.filter(c => {
    if (search && !Object.values(c).join(' ').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterClient && c.client !== filterClient) return false;
    return true;
  });

  const extractMonth = (dateStr) => {
    if (!dateStr) return '不明';
    // YYYY/MM/DD 形式
    let match = dateStr.match(/(\d{4})[\/\-](\d{2})/);
    if (match) return `${match[1]}-${match[2]}`;
    // M/DD または MM/DD 形式 → 2026年と仮定
    match = dateStr.match(/^(\d{1,2})\//);
    if (match) return `2026-${String(match[1]).padStart(2, '0')}`;
    return '不明';
  };

  const groupedByMonth = {};
  filtered.forEach(c => {
    const date = c.interviewDate || c.date || '';
    const key = extractMonth(date);
    if (!groupedByMonth[key]) groupedByMonth[key] = [];
    groupedByMonth[key].push(c);
  });

  const sortedMonths = Object.keys(groupedByMonth).sort().reverse();

  return (
    <div>
      <div className="card">
        <h2>サマリー</h2>
        <div className="summary">
          <div className="summary-card">
            <div className="summary-label">総求職者数</div>
            <div className="summary-value">{filtered.length}名</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">面接決定</div>
            <div className="summary-value" style={{ color: 'var(--green)' }}>{filtered.filter(c => c.status === '面接日時決定').length}名</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">採用</div>
            <div className="summary-value" style={{ color: 'var(--blue)' }}>{filtered.filter(c => c.result === '採用' || c.result === '内定受理').length}名</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, border: 'none', padding: 0 }}>求職者一覧</h2>
          <button className="btn-primary" onClick={() => openModal()}>＋ 新規追加</button>
        </div>

        <div className="filter-row">
          <span className="filter-label">検索</span>
          <input type="text" placeholder="名前・取引先など" value={search} onChange={(e) => setSearch(e.target.value)} />
          <span className="filter-label">状況</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">すべて</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="filter-label">取引先</span>
          <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
            <option value="">すべて</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn-secondary" onClick={() => { setSearch(''); setFilterStatus(''); setFilterClient(''); }}>リセット</button>
        </div>

        {sortedMonths.length === 0 ? (
          <div className="empty-state">データがありません</div>
        ) : (
          sortedMonths.map(month => {
            const rows = groupedByMonth[month];
            const [y, m] = month.split('-');
            const monthLabels = { '01': '1月', '02': '2月', '03': '3月', '04': '4月', '05': '5月', '06': '6月', '07': '7月', '08': '8月', '09': '9月', '10': '10月', '11': '11月', '12': '12月' };
            const label = y && m ? `${y}年${monthLabels[m] || m}` : '不明';
            const interviewCount = rows.filter(d => d.status === '面接日時決定').length;
            const hiredCount = rows.filter(d => d.result === '採用' || d.result === '内定受理').length;

            return (
              <div key={month} className="year-section">
                <div className="year-header" onClick={(e) => {
                  e.currentTarget.classList.toggle('open');
                  e.currentTarget.nextElementSibling.classList.toggle('open');
                }}>
                  <span>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="year-meta">
                      <span>{rows.length}名</span>
                      <span style={{ color: 'var(--green)' }}>面接決定 {interviewCount}名</span>
                      <span style={{ color: 'var(--blue)' }}>採用 {hiredCount}名</span>
                    </div>
                    <span className="arrow">▼</span>
                  </div>
                </div>
                <div className="year-body">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>依頼日</th>
                          <th>求職者名</th>
                          <th>状況</th>
                          <th>面接日</th>
                          <th>取引先</th>
                          <th>担当者</th>
                          <th>職種</th>
                          <th>入職希望月</th>
                          <th>住まい</th>
                          <th>選考結果</th>
                          <th>最終結果</th>
                          <th>メモ</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(c => (
                          <tr key={c.id}>
                            <td>{c.date || '—'}</td>
                            <td><strong>{c.name || '—'}</strong></td>
                            <td>{statusBadge(c.status)}</td>
                            <td>{c.interviewDate || '—'}</td>
                            <td>{clientBadge(c.client)}</td>
                            <td>{c.staff || '—'}</td>
                            <td>{c.jobType || '—'}</td>
                            <td>{c.startMonth || '—'}</td>
                            <td>{c.area || '—'}</td>
                            <td>{resultBadge(c.result)}</td>
                            <td>{resultBadge(c.finalResult)}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{c.memo || '—'}</td>
                            <td>
                              <button className="action-btn" onClick={() => openModal(c.id)}>編集</button>
                              <button className="action-btn" onClick={() => deleteCandidate(c.id)}>削除</button>
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
                <label>依頼日</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>求職者名</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>状況</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="">—</option>
                  {(config.statuses || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>面接日</label>
                <input type="date" value={formData.interviewDate} onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>取引先</label>
                <select value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })}>
                  <option value="">—</option>
                  {(config.clients || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>担当者</label>
                <input type="text" value={formData.staff} onChange={(e) => setFormData({ ...formData, staff: e.target.value })} />
              </div>
              <div className="form-group">
                <label>職種</label>
                <input type="text" value={formData.jobType} onChange={(e) => setFormData({ ...formData, jobType: e.target.value })} />
              </div>
              <div className="form-group">
                <label>入職希望月</label>
                <select value={formData.startMonth} onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}>
                  <option value="">—</option>
                  {(config.months || []).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>住まい</label>
                <select value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}>
                  <option value="">—</option>
                  {(config.areas || []).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>選考結果</label>
                <select value={formData.result} onChange={(e) => setFormData({ ...formData, result: e.target.value })}>
                  <option value="">—</option>
                  {(config.results || []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>最終結果</label>
                <select value={formData.finalResult} onChange={(e) => setFormData({ ...formData, finalResult: e.target.value })}>
                  <option value="">—</option>
                  {(config.results || []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>メモ</label>
                <input type="text" value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} />
              </div>
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