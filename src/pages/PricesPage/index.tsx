import React, { JSX, useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';
import analyticsIcon from '../../assets/icons/analytics.svg';
import { ReactComponent as ArrowRightIcon } from '../../assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeftIcon } from '../../assets/icons/arrow-left.svg';
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
  const [selectedProduct, setSelectedProduct] = useState<string>('Wszystko');
  const [selectedRegion, setSelectedRegion] = useState<string>('Wszystko');
  const [viewMode, setViewMode] = useState<'all' | 'avg'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  const API_LOCAL = process.env.REACT_APP_API_LOCAL;
  const API_PROD = process.env.REACT_APP_API_PROD;
  const [hasError, setHasError] = useState(false);

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredData.slice(offset, offset + itemsPerPage);

  const fetchData = React.useCallback(async () => {
    const endpoint = viewMode === 'avg' ? 'avg-prices' : 'prices';
    setLoading(true);
    setHasError(false);

    try {
      const response = await axios.get<PriceData[]>(`${API_LOCAL}/${endpoint}`);
      setData(response.data);
    } catch {
      try {
        const response = await axios.get<PriceData[]>(`${API_PROD}/${endpoint}`);
        setData(response.data);
      } catch {
        setHasError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [API_LOCAL, API_PROD, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filteredData]);

  useEffect(() => {
    let filtered = data;

    if (selectedProduct !== 'Wszystko') {
      filtered = filtered.filter((d) => d.product === selectedProduct);
    }

    if (selectedRegion !== 'Wszystko') {
      filtered = filtered.filter((d) => d.region === selectedRegion);
    }

    setFilteredData(filtered);
  }, [data, selectedProduct, selectedRegion]);

  const getAveragedChartData = (): { date: string; price: number }[] => {
    const dateMap = new Map<string, number[]>();

    filteredData.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, []);
      }
      dateMap.get(item.date)?.push(item.price);
    });

    const averaged = Array.from(dateMap.entries()).map(([date, prices]) => ({
      date,
      price: prices.reduce((sum, p) => sum + p, 0) / prices.length,
    }));

    return averaged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const products = Array.from(new Set(data.map((d) => d.product))).sort();
  const regions = Array.from(new Set(data.map((d) => d.region))).sort();

  return (
    <>
      {loading && <div className="loading-overlay">Załadunek...</div>}

      <div className="container" style={{ filter: loading ? 'blur(2px)' : 'none' }}>
        <h1>
          <img src={analyticsIcon} style={{ width: '40px', paddingRight: '10px' }} alt="AnalyticsIcon" />
          Analiza cen produktów
        </h1>

        {hasError && <div className="error">❌ cant loading </div>}
        <div className="filters">
          <label>
            Produkt:
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
              <option>Wszystko</option>
              {products.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>

          <label>
            Region:
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
              <option>Wszystko</option>
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>

          <label>
            Rewizja:
            <select value={viewMode} onChange={(e) => setViewMode(e.target.value as 'all' | 'avg')}>
              <option value="all">Wszystkie ceny</option>
              <option value="avg">Średnie ceny (miesiąc/region)</option>
            </select>
          </label>
        </div>

        <CSVLink data={filteredData} filename={'prices_export.csv'} className="export_btn">
          Eksportuj do CSV
        </CSVLink>

        <table className="styled-table">
          <thead>
            <tr>
              {viewMode === 'all' && <th>#</th>}
              <th>Produkt</th>
              <th>Region</th>
              <th>Data</th>
              <th>Cena (zł)</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={row.id ?? `${row.product}-${row.region}-${row.date}`}>
                {viewMode === 'all' && <td data-label="#"> {offset + index + 1} </td>}
                <td data-label="Produkt">{row.product ?? '-'}</td>
                <td data-label="Region">{row.region}</td>
                <td data-label="Data">{row.date}</td>
                <td data-label="Cena (zł)">{row.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ReactPaginate
          previousLabel={<ArrowLeftIcon className="arrow-icon" />}
          nextLabel={<ArrowRightIcon className="arrow-icon" />}
          breakLabel={'...'}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          forcePage={currentPage}
          containerClassName="pagination"
          activeClassName="active"
          previousClassName="pagination-previous"
          nextClassName="pagination-next"
        />

        <h2 className="tabela-text">Tabela cen</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getAveragedChartData()} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis dataKey="price" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="price" stroke="#8884d8" name="Średnia cena (zł)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};
