import { useState } from 'react'

function MenuKhususPage() {
    const [menuKhususItems, setMenuKhususItems] = useState(null) // Placeholder for menu khusus items, can be fetched from an API or defined statically

    return (
        <section>
            <header className="section-head">
                <p className="brand-eyebrow">Hanaka Cake</p>
                <h2>Menu Khusus</h2>
                <p className="muted-text">
                    Menu khusus ini hanya tersedia pada periode tertentu. Silakan hubungi kami untuk informasi lebih lanjut.
                </p>
            </header>

        </section>
    )
}

export default MenuKhususPage
