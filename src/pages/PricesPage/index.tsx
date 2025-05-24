import React, { JSX, useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';
import './styles/styles.css';

type PriceData = {
  product: string;
  region: string;
  date: string;
  price: number;
  id?: number;
};

export const PricesPage = (): JSX.Element => {
  const [data, setData] = useState<PriceData[]>([]);
  const [filteredData, setFilteredData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('Усі');
  const [selectedRegion, setSelectedRegion] = useState<string>('Усі');
  const [viewMode, setViewMode] = useState<'all' | 'avg'>('all');
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const endpoint = viewMode === 'avg' ? 'avg-prices' : 'prices';
    setLoading(true);
    axios
      .get<PriceData[]>(`${API_URL}/${endpoint}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Помилка при отриманні даних:', err);
        setLoading(false);
      });
  }, [viewMode]);

  useEffect(() => {
    let filtered = data;

    if (selectedProduct !== 'Усі') {
      filtered = filtered.filter((d) => d.product === selectedProduct);
    }

    if (selectedRegion !== 'Усі') {
      filtered = filtered.filter((d) => d.region === selectedRegion);
    }

    setFilteredData(filtered);
  }, [data, selectedProduct, selectedRegion]);

  const products = Array.from(new Set(data.map((d) => d.product))).sort();
  const regions = Array.from(new Set(data.map((d) => d.region))).sort();

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className="container">
      <h1>📊 Аналітика цін на продукти</h1>

      <div className="filters">
        <label>
          Продукт:
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option>Усі</option>
            {products.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>

        <label>
          Регіон:
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
            <option>Усі</option>
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>

        <label>
          Перегляд:
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value as 'all' | 'avg')}>
            <option value="all">Усі ціни</option>
            <option value="avg">Середні ціни (місяць/регіон)</option>
          </select>
        </label>
      </div>

      <CSVLink data={filteredData} filename={'prices_export.csv'} className="export_btn">
        Експортувати в CSV
      </CSVLink>

      <table className="styled-table">
        <thead>
          <tr>
            {viewMode === 'all' && <th>#</th>}
            <th>Продукт</th>
            <th>Регіон</th>
            <th>Дата</th>
            <th>Ціна (₴)</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={row.id ?? `${row.product}-${row.region}-${row.date}`}>
              {viewMode === 'all' && <td>{index + 1}</td>}
              <td>{row.product ?? '-'}</td>
              <td>{row.region}</td>
              <td>{row.date}</td>
              <td>{row.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-2">Графік цін</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis dataKey="price" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" name="Ціна (₴)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
