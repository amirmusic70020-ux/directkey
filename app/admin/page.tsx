'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = () => {
    alert(`Project Added: ${title} - ${price}`);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Panel</h1>

      <input
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        Add Project
      </button>
    </div>
  );
}
