import { useEffect, useState } from 'react'
import { fetchDashboard } from '../../services/adminApi.js'
import { formatRupiah } from '../../utils/currency.js'

const statCards = [
  { key: 'totalOrders', label: 'Total Orders', color: '#c8683d' },
  { key: 'pendingOrders', label: 'Menunggu Konfirmasi', color: '#d4a843' },
  { key: 'processingOrders', label: 'Diproses', color: '#5b8a72' },
  { key: 'completedOrders', label: 'Selesai', color: '#2f7f51' },
  { key: 'cancelledOrders', label: 'Dibatalkan', color: '#b13f3f' },
  { key: 'totalCustomers', label: 'Total Customer', color: '#6f5848' },
  { key: 'totalProducts', label: 'Total Produk', color: '#8a5a44' },
]

const revenueCards = [
  { key: 'todayRevenue', label: 'Pendapatan Hari Ini' },
  { key: 'totalRevenue', label: 'Total Pendapatan' },
]

function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard()
      .then((data) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Dashboard</h1>
        <div className="admin-stats-grid">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div className="admin-stat-card skeleton-card" key={n}>
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <h1>Dashboard</h1>
        <p className="submit-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>

      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <div className="admin-stat-card" key={card.key}>
            <p className="admin-stat-label">{card.label}</p>
            <p className="admin-stat-value" style={{ color: card.color }}>
              {stats[card.key]}
            </p>
          </div>
        ))}
      </div>

      <div className="admin-revenue-grid">
        {revenueCards.map((card) => (
          <div className="admin-revenue-card" key={card.key}>
            <p className="admin-stat-label">{card.label}</p>
            <p className="admin-revenue-value">
              {formatRupiah(stats[card.key])}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage
