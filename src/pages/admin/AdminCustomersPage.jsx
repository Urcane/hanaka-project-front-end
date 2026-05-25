import { useEffect, useState } from 'react'
import { fetchAdminCustomers } from '../../services/adminApi.js'

function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminCustomers()
      .then((data) => setCustomers(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="admin-page">
      <h1>Customer List</h1>

      {error && <p className="submit-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Telepon</th>
              <th>Terdaftar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="admin-table-empty">Memuat...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={4} className="admin-table-empty">Belum ada customer.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.fullName}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td className="admin-cell-date">
                    {new Date(c.createdAt).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminCustomersPage
