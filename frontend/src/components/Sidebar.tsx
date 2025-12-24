import React from 'react';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  return (
    <nav style={{
      width: '250px',
      backgroundColor: '#f5f5f5',
      padding: '1rem',
      height: '100vh'
    }}>
      <h3>メニュー</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '0.5rem' }}>ダッシュボード</li>
        <li style={{ marginBottom: '0.5rem' }}>資格登録</li>
        <li style={{ marginBottom: '0.5rem' }}>資格一覧</li>
        <li style={{ marginBottom: '0.5rem' }}>設定</li>
      </ul>
    </nav>
  );
};