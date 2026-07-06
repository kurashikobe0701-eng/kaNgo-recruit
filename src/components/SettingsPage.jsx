import { useContext, useState, useEffect } from 'react';
import { ConfigContext } from '../ConfigContext';

const DEFAULT_CONFIG = {
  statuses: ['面接日時決定', '説明会日時決定', '面接日時調整中', '求職者の意思確認中'],
  clients: ['レバ', 'SMS', 'クイック', 'マイナビ', 'MOT', 'AGREE', 'メディカルコンシェルジュ', '直接', 'その他'],
  results: ['採用', '不採用', 'バラシ', '辞退', '保留', '内定受理'],
  months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '来年4月'],
  areas: ['東灘区', '灘区', '中央区', '兵庫区', '北区', '長田区', '須磨区', '垂水区', '西区', '西宮市', '尼崎市', 'エリア外(引越し予定)', 'その他'],
  clientColors: {
    'SMS': '#22c55e',
    'レバ': '#ef4444',
    'クイック': '#f59e0b',
    'マイナビ': '#60a5fa',
    'MOT': '#3b82f6',
    'AGREE': '#1e3a8a',
    'メディカルコンシェルジュ': '#d97706',
    '直接': '#8b5cf6',
    'その他': '#9ca3af'
  }
};

export default function SettingsPage() {
  const { config, updateConfig } = useContext(ConfigContext);
  const [editConfig, setEditConfig] = useState(config || DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEditConfig(config || DEFAULT_CONFIG);
  }, [config]);

  const handleArrayChange = (key, index, value) => {
    const newArray = [...editConfig[key]];
    const oldValue = newArray[index];
    newArray[index] = value;

    let newConfig = { ...editConfig, [key]: newArray };

    // clients が変更された場合、clientColors のキーも更新
    if (key === 'clients' && oldValue !== value && editConfig.clientColors) {
      const newColors = { ...editConfig.clientColors };
      if (oldValue in newColors) {
        const color = newColors[oldValue];
        delete newColors[oldValue];
        newColors[value] = color;
      }
      newConfig.clientColors = newColors;
    }

    setEditConfig(newConfig);
    setSaved(false);
  };

  const handleAddItem = (key) => {
    const newArray = [...editConfig[key], ''];
    let newConfig = { ...editConfig, [key]: newArray };

    // clients に新しい項目が追加される場合、clientColors にもデフォルト色を追加
    if (key === 'clients' && editConfig.clientColors) {
      newConfig.clientColors = { ...editConfig.clientColors, '': '#9ca3af' };
    }

    setEditConfig(newConfig);
    setSaved(false);
  };

  const handleRemoveItem = (key, index) => {
    const removedItem = editConfig[key][index];
    const newArray = editConfig[key].filter((_, i) => i !== index);

    let newConfig = { ...editConfig, [key]: newArray };

    // clients から削除される項目に対応する色も削除
    if (key === 'clients' && editConfig.clientColors && removedItem in editConfig.clientColors) {
      const newColors = { ...editConfig.clientColors };
      delete newColors[removedItem];
      newConfig.clientColors = newColors;
    }

    setEditConfig(newConfig);
    setSaved(false);
  };

  const handleMoveUp = (key, index) => {
    if (index === 0) return;
    const newArray = [...editConfig[key]];
    [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
    setEditConfig({ ...editConfig, [key]: newArray });
    setSaved(false);
  };

  const handleMoveDown = (key, index) => {
    if (index === editConfig[key].length - 1) return;
    const newArray = [...editConfig[key]];
    [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
    setEditConfig({ ...editConfig, [key]: newArray });
    setSaved(false);
  };

  const handleSave = async () => {
    await updateConfig(editConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="card">
        <h2>マスターデータ管理</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '1rem' }}>
          採用管理・採用実績で使用される選択肢を編集します
        </p>

        {saved && (
          <div style={{ background: '#E8F5F1', color: '#1D7A5F', padding: '12px', borderRadius: '8px', marginBottom: '1rem' }}>
            ✓ 保存しました
          </div>
        )}

        {/* 状況（ステータス） */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>状況（採用管理）</h3>
          {editConfig.statuses?.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange('statuses', index, e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="action-btn" onClick={() => handleMoveUp('statuses', index)} disabled={index === 0} style={{ opacity: index === 0 ? 0.5 : 1 }}>
                ↑
              </button>
              <button className="action-btn" onClick={() => handleMoveDown('statuses', index)} disabled={index === editConfig.statuses.length - 1} style={{ opacity: index === editConfig.statuses.length - 1 ? 0.5 : 1 }}>
                ↓
              </button>
              <button className="action-btn" onClick={() => handleRemoveItem('statuses', index)} style={{ color: 'var(--red)' }}>
                削除
              </button>
            </div>
          ))}
          <button className="btn-secondary" onClick={() => handleAddItem('statuses')} style={{ marginTop: '8px' }}>
            ＋ 追加
          </button>
        </div>

        {/* 取引先 */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>取引先</h3>
          {editConfig.clients?.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange('clients', index, e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="action-btn" onClick={() => handleMoveUp('clients', index)} disabled={index === 0} style={{ opacity: index === 0 ? 0.5 : 1 }}>
                ↑
              </button>
              <button className="action-btn" onClick={() => handleMoveDown('clients', index)} disabled={index === editConfig.clients.length - 1} style={{ opacity: index === editConfig.clients.length - 1 ? 0.5 : 1 }}>
                ↓
              </button>
              <button className="action-btn" onClick={() => handleRemoveItem('clients', index)} style={{ color: 'var(--red)' }}>
                削除
              </button>
            </div>
          ))}
          <button className="btn-secondary" onClick={() => handleAddItem('clients')} style={{ marginTop: '8px' }}>
            ＋ 追加
          </button>
        </div>

        {/* 選考結果 */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>選考結果</h3>
          {editConfig.results?.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange('results', index, e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="action-btn" onClick={() => handleMoveUp('results', index)} disabled={index === 0} style={{ opacity: index === 0 ? 0.5 : 1 }}>
                ↑
              </button>
              <button className="action-btn" onClick={() => handleMoveDown('results', index)} disabled={index === editConfig.results.length - 1} style={{ opacity: index === editConfig.results.length - 1 ? 0.5 : 1 }}>
                ↓
              </button>
              <button className="action-btn" onClick={() => handleRemoveItem('results', index)} style={{ color: 'var(--red)' }}>
                削除
              </button>
            </div>
          ))}
          <button className="btn-secondary" onClick={() => handleAddItem('results')} style={{ marginTop: '8px' }}>
            ＋ 追加
          </button>
        </div>

        {/* 入職希望月 */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>入職希望月</h3>
          {editConfig.months?.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange('months', index, e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="action-btn" onClick={() => handleMoveUp('months', index)} disabled={index === 0} style={{ opacity: index === 0 ? 0.5 : 1 }}>
                ↑
              </button>
              <button className="action-btn" onClick={() => handleMoveDown('months', index)} disabled={index === editConfig.months.length - 1} style={{ opacity: index === editConfig.months.length - 1 ? 0.5 : 1 }}>
                ↓
              </button>
              <button className="action-btn" onClick={() => handleRemoveItem('months', index)} style={{ color: 'var(--red)' }}>
                削除
              </button>
            </div>
          ))}
          <button className="btn-secondary" onClick={() => handleAddItem('months')} style={{ marginTop: '8px' }}>
            ＋ 追加
          </button>
        </div>

        {/* 住まい */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>住まい</h3>
          {editConfig.areas?.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange('areas', index, e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="action-btn" onClick={() => handleMoveUp('areas', index)} disabled={index === 0} style={{ opacity: index === 0 ? 0.5 : 1 }}>
                ↑
              </button>
              <button className="action-btn" onClick={() => handleMoveDown('areas', index)} disabled={index === editConfig.areas.length - 1} style={{ opacity: index === editConfig.areas.length - 1 ? 0.5 : 1 }}>
                ↓
              </button>
              <button className="action-btn" onClick={() => handleRemoveItem('areas', index)} style={{ color: 'var(--red)' }}>
                削除
              </button>
            </div>
          ))}
          <button className="btn-secondary" onClick={() => handleAddItem('areas')} style={{ marginTop: '8px' }}>
            ＋ 追加
          </button>
        </div>

        {/* 取引先の色設定 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>取引先の色設定</h3>
          {editConfig.clientColors && editConfig.clients && editConfig.clients.map((name) => {
            const color = editConfig.clientColors[name] || '#9ca3af';
            return (
              <div key={name} style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                <span style={{ minWidth: '100px', fontSize: '13px' }}>{name || '（未設定）'}</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setEditConfig({ ...editConfig, clientColors: { ...editConfig.clientColors, [name]: e.target.value } })}
                  style={{ width: '50px', height: '40px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{color}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button className="btn-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
