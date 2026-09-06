import { useEffect, useState } from 'react';
import api from '../../api/axios';
import FoodImage from '../../components/FoodImage';

const CATEGORY_LABELS = {
  base: '🍕 Pizza Bases', sauce: '🍅 Sauces', cheese: '🧀 Cheeses',
  vegetable: '🥦 Vegetables', drink: '🥤 Drinks', dessert: '🍰 Desserts',
};

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [edits, setEdits] = useState({});

  const fetchInventory = async () => {
    const { data } = await api.get('/inventory');
    setItems(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdate = async (id) => {
    const newStock = edits[id];
    if (newStock === undefined || newStock === '') return;
    await api.put(`/inventory/${id}`, { stock: Number(newStock) });
    setEdits((e) => ({ ...e, [id]: '' }));
    fetchInventory();
  };

  const grouped = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <h2>Inventory Dashboard</h2>
      {Object.keys(CATEGORY_LABELS).map((cat) => (
        <div key={cat} className="card">
          <h3>{CATEGORY_LABELS[cat]}</h3>
          <table>
            <thead>
              <tr><th></th><th>Item</th><th>Stock</th><th>Threshold</th><th>Update</th></tr>
            </thead>
            <tbody>
              {(grouped[cat] || []).map((item) => (
                <tr key={item._id} style={{ color: item.stock < item.lowStockThreshold ? '#e63946' : 'inherit' }}>
                  <td><FoodImage query={item.imageQuery || item.name} fallbackEmoji={item.emoji} size={32} /></td>
                  <td>{item.name}</td>
                  <td>{item.stock}</td>
                  <td>{item.lowStockThreshold}</td>
                  <td>
                    <input
                      type="number"
                      placeholder="new stock"
                      value={edits[item._id] || ''}
                      onChange={(e) => setEdits((ed) => ({ ...ed, [item._id]: e.target.value }))}
                      style={{ width: '70px' }}
                    />
                    <button className="btn-primary" onClick={() => handleUpdate(item._id)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default InventoryManagement;