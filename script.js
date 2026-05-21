// script.js

function beliProduk(nama, harga) {
  alert(
    "Produk: " + nama +
    "\nHarga: Rp " + harga.toLocaleString('id-ID')
  );
}

function masuk() {
  window.location.href = "login.html";
}

function daftar() {
  window.location.href = "register.html";
}

function beranda() {
  window.location.href = "index.html";
}

function marketplace() {
  window.location.href = "marketplace.html";
}

function edukasi() {
  window.location.href = "edukasi.html";
}

function profil() {
  window.location.href = "profile.html";
}

function logout() {
  // hanya hapus sesi, jangan hapus data profil/produk per akun
  localStorage.removeItem('bersenja_role');
  localStorage.removeItem('bersenja_email');
  localStorage.removeItem('bersenja_nama');
  window.location.href = 'index.html';
}

// ===== Auth demo & akses cepat (tanpa backend) =====
// login.html menyimpan role/email/nama ke localStorage.
// Halaman lain cukup baca dari localStorage.

function getRole() {
  return localStorage.getItem('bersenja_role') || 'pembeli';
}

function getNama() {
  return localStorage.getItem('bersenja_nama') || 'Pengguna';
}

function getEmail() {
  return localStorage.getItem('bersenja_email') || '-';
}

function aboutUs() {
  window.location.href = "aboutus.html";
}

// ===== Checkout flow (Marketplace -> Checkout Form) =====
function beliProdukCheckout(nama, harga) {
  // simpan ringkasan produk untuk ditampilkan di checkout-form.html
  localStorage.setItem(
    'checkoutProdukData',
    JSON.stringify({ nama: nama, harga: harga })
  );
  window.location.href = 'checkout-form.html';
}

function bersihkanKeranjangJikaBatal() {
  // Bersihkan ringkasan checkout dan keranjang
  localStorage.removeItem('checkoutProdukData');
  localStorage.removeItem('checkoutCartData');
  localStorage.removeItem('bersenja_cart');
}

function buatOrderPending() {
  const nama = document.getElementById('nama')?.value || '';
  const hp = document.getElementById('hp')?.value || '';
  const alamat = document.getElementById('alamat')?.value || '';

  if (!nama || !hp || !alamat) {
    alert('Lengkapi data pengiriman terlebih dahulu.');
    return null;
  }

  // metode
  const selectedMetode = document.querySelector('input[name="metode"]:checked')?.value || 'transfer';

  // ambil ringkasan produk dari checkout-form (multi item) atau fallback lama
  let produk = '-';
  let subtotal = null;

  const cartRaw = localStorage.getItem('checkoutCartData');
  if (cartRaw) {
    try {
      const parsed = JSON.parse(cartRaw);
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      produk = items.length ? items.map(i => `${i.nama} x${i.qty}`).join(', ') : '-';
      subtotal = typeof parsed.total === 'number' ? parsed.total : null;
    } catch (e) {}
  }

  if (subtotal === null) {
    const data = localStorage.getItem('checkoutProdukData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        produk = parsed.nama || '-';
        subtotal = parsed.harga ?? null;
      } catch (e) {}
    } else {
      const p = localStorage.getItem('checkout');
      if (p) produk = p;
    }
  }

  const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(16).slice(2, 6).toUpperCase();
  const now = new Date().toISOString();

  const order = {
    orderId,
    tanggal: now,
    pembeli: { nama, hp, alamat },
    metode: selectedMetode,
    produk,
    subtotal: typeof subtotal === 'number' ? subtotal : null
  };

  localStorage.setItem('bersenja_order_id', orderId);
  localStorage.setItem('bersenja_order_status', 'pending');
  localStorage.setItem('bersenja_order_data', JSON.stringify(order));

  return order;
}

function konfirmasiCheckout() {
  const nama = document.getElementById('nama')?.value || '';

  const order = buatOrderPending();
  if (!order) return;

  // Simpan ringkasan order, tapi bersihkan data checkout/cart agar flow bersih.
  bersihkanKeranjangJikaBatal();

  alert('Pembayaran terkirim. Pesanan Anda menunggu konfirmasi penjual.');

  window.location.href = 'order-pending.html';
}

// --- Fungsi Manajemen Keranjang ---

// 1. Ambil data keranjang dari LocalStorage
function getKeranjang() {
  const data = localStorage.getItem('bersenja_cart');
  return data ? JSON.parse(data) : [];
}

// 2. Fungsi Menghapus Produk
function hapusProduk(index) {
  const keranjang = getKeranjang();
  
  if (keranjang[index]) {
    // Konfirmasi penghapusan (opsional, kalau mau langsung hapus bisa hilangkan confirm)
    if(confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      keranjang.splice(index, 1); // Hapus 1 item pada urutan index tersebut
      localStorage.setItem('bersenja_cart', JSON.stringify(keranjang));
      
      alert("Produk berhasil dihapus.");
      location.reload(); // Muat ulang halaman agar daftar keranjang terupdate
    }
  }
}

// 3. Fungsi Mengurangi Jumlah Produk
function kurangiProduk(index) {
  let keranjang = getKeranjang();
  
  if (keranjang[index]) {
    // Asumsi objek produk memiliki properti 'qty' atau 'jumlah'
    if (typeof keranjang[index].qty === 'undefined') keranjang[index].qty = 1;
    
    keranjang[index].qty -= 1; // Kurangi jumlah
    
    // Jika jumlah sudah 0, hapus produk tersebut dari daftar
    if (keranjang[index].qty <= 0) {
      keranjang.splice(index, 1);
      alert("Produk telah dihapus karena jumlah nol.");
    } else {
      // alert("Jumlah produk dikurangi.");
    }
    
    localStorage.setItem('bersenja_cart', JSON.stringify(keranjang));
    location.reload(); // Muat ulang halaman
  }
}

// 4. Fungsi Menambah Jumlah (Opsional, bila butuh tombol Tambah)
function tambahProduk(index) {
  let keranjang = getKeranjang();
  if (keranjang[index]) {
    if (typeof keranjang[index].qty === 'undefined') keranjang[index].qty = 0;
    keranjang[index].qty += 1;
    localStorage.setItem('bersenja_cart', JSON.stringify(keranjang));
    location.reload();
  }
}







