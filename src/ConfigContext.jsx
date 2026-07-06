import { createContext, useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const ConfigContext = createContext();

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

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'config', 'master'),
      (docSnap) => {
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        } else {
          setDoc(doc(db, 'config', 'master'), DEFAULT_CONFIG);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading config:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateConfig = async (newConfig) => {
    try {
      await setDoc(doc(db, 'config', 'master'), newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  return (
    <ConfigContext.Provider value={{ config, loading, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}
