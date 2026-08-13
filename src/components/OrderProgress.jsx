import { getTrackingSteps, isCancelled } from '../models/trackModel.js'

/**
 * Stepper status pesanan untuk halaman lacak pesanan.
 */
function OrderProgress({ order }) {
  const steps = getTrackingSteps(order)
  const cancelled = isCancelled(order)
  const doneCount = steps.filter((step) => step.state === 'done').length
  const currentCount = steps.filter((step) => step.state === 'current').length
  // Garis penghubung terisi sampai langkah yang sedang berjalan.
  const percent = cancelled
    ? 0
    : Math.round(
        ((doneCount + (currentCount ? 0.5 : 0)) / (steps.length - 1 || 1)) * 100,
      )

  return (
    <div className={`order-progress${cancelled ? ' is-cancelled' : ''}`}>
      {cancelled && (
        <p className="order-progress-cancelled">
          Pesanan ini dibatalkan. Hubungi kami bila ini di luar dugaanmu.
        </p>
      )}

      <div className="order-progress-track">
        <div
          className="order-progress-line"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
        <ol className="order-progress-steps">
          {steps.map((step) => (
            <li key={step.status} className={`order-progress-step is-${step.state}`}>
              <span className="order-progress-dot" aria-hidden="true" />
              <span className="order-progress-label">{step.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default OrderProgress
