console.log("Sistem App.js mulai dimuat...");

// ==========================================
// 1. INISIALISASI SUPABASE & PROTEKSI LOGIN
// ==========================================
const supabaseUrl = 'https://wxugkuzdpbhojydqulmn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dWdrdXpkcGJob2p5ZHF1bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NzMxNDQsImV4cCI6MjA5NTE0OTE0NH0.FMTP85NEtV9v73XaclyTwMIeYt2VnI-F0n1pDlEiH8g';

// Cek apakah Supabase sudah dimuat dari CDN
let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
} else {
    console.warn("Supabase CDN belum dimuat di HTML!");
}

// Fungsi Proteksi: Tendang ke halaman login jika belum login
async function checkAuth() {
    if (!supabase) return;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.warn("Gagal mengecek session auth, jalankan mode offline.");
    }
}
// Jalankan pengecekan keamanan saat file dimuat (Khusus untuk dashboard.html)
if (window.location.pathname.includes('dashboard.html')) {
    checkAuth();
}

// ==========================================
// 2. SEMUA LOGIKA UI & DASHBOARD (Jalan saat halaman siap)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Siap. Menjalankan modul...");

    // --- A. FUNGSI LOGOUT ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const result = await Swal.fire({
                title: 'Yakin ingin keluar?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#18181b',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Keluar'
            });

            if (result.isConfirmed) {
                if(supabase) await supabase.auth.signOut();
                window.location.href = 'index.html';
            }
        });
    }

    // --- B. SPA NAVIGATION LOGIC (PERBAIKAN KELAS HIDDEN) ---
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('pageTitle');

    const titles = {
        'home': 'Dashboard',
        'contacts': 'CRM Customer',
        'templates': 'Template Pesan',
        'blast': 'Kirim WA Blast',
        'history': 'Riwayat Blast',
        'settings': 'Pengaturan Sistem'
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            if (!target) return;
            
            // 1. Hilangkan status aktif dari semua menu
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 2. Beri status aktif pada menu yang diklik (Desktop & Mobile)
            document.querySelectorAll(`.nav-item[data-target="${target}"]`).forEach(n => n.classList.add('active'));

            // 3. Sembunyikan semua section dengan menambahkan kembali kelas 'hidden'
            viewSections.forEach(section => {
                section.classList.remove('active');
                section.classList.add('hidden'); 
            });
            
            // 4. Tampilkan section yang sesuai dengan menghapus kelas 'hidden'
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                targetSection.classList.add('active');
            }

            // 5. Ubah Judul Header
            if (pageTitle && titles[target]) {
                pageTitle.innerText = titles[target];
            }
        });
    });

    // --- C. DARK MODE TOGGLE ---
    const html = document.documentElement;
    const darkToggle = document.getElementById('darkModeToggle');
    
    if (darkToggle) {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            html.classList.add('dark');
            darkToggle.innerHTML = '<i class="ph ph-sun"></i>';
        }

        darkToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            if (html.classList.contains('dark')) {
                localStorage.theme = 'dark';
                darkToggle.innerHTML = '<i class="ph ph-sun"></i>';
            } else {
                localStorage.theme = 'light';
                darkToggle.innerHTML = '<i class="ph ph-moon"></i>';
            }
        });
    }

    // --- D. CHART.JS INITIALIZATION ---
    const ctx = document.getElementById('activityChart');
    if (ctx && typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                datasets: [{
                    label: 'Pesan Terkirim',
                    data: [120, 190, 300, 250, 420, 150, 500],
                    borderColor: '#18181b', 
                    backgroundColor: 'rgba(24, 24, 27, 0.05)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#18181b',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { display: true, color: 'rgba(0,0,0,0.05)' }, border: { dash: [4, 4] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // --- E. PENGATURAN TOKEN & TEST KONEKSI FONNTE ---
    const tokenInput = document.getElementById('fonnteTokenInput');
    const btnSaveFonnte = document.getElementById('btnSaveFonnte');

    // Tampilkan token tersimpan saat web dibuka
    if (tokenInput && localStorage.getItem('saved_fonnte_token')) {
        tokenInput.value = localStorage.getItem('saved_fonnte_token');
    }

    if (btnSaveFonnte) {
        btnSaveFonnte.addEventListener('click', async () => {
            const token = tokenInput.value.trim();
            if (!token) {
                Swal.fire('Oops!', 'Token API tidak boleh kosong', 'warning');
                return;
            }

            btnSaveFonnte.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Menghubungkan...';
            btnSaveFonnte.disabled = true;

            try {
                const response = await fetch("https://api.fonnte.com/device", {
                    method: 'POST',
                    headers: { 'Authorization': token }
                });
                const result = await response.json();

                if (result.status) {
                    localStorage.setItem('saved_fonnte_token', token);
                    Swal.fire({
                        icon: 'success',
                        title: 'Terkoneksi!',
                        text: `Device terhubung: ${result.name} (${result.device})`,
                        confirmButtonColor: '#18181b'
                    });
                } else {
                    Swal.fire('Gagal', result.reason || 'Token tidak valid / Device Offline', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Gagal menghubungi server Fonnte', 'error');
            } finally {
                btnSaveFonnte.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Simpan & Test Koneksi';
                btnSaveFonnte.disabled = false;
            }
        });
    }

    // --- F. KIRIM WA BLAST ---
    const btnSendBlast = document.getElementById('btnSendBlast');
    
    if (btnSendBlast) {
        btnSendBlast.addEventListener('click', async () => {
            const targetNumbers = document.getElementById('targetNumbers').value.trim();
            const blastMessage = document.getElementById('blastMessage').value.trim();
            const savedToken = localStorage.getItem('saved_fonnte_token');

            if (!savedToken) {
                Swal.fire('Akses Ditolak', 'Silakan masukkan Token Fonnte di menu Pengaturan terlebih dahulu.', 'warning');
                return;
            }
            if (!targetNumbers || !blastMessage) {
                Swal.fire('Perhatian', 'Nomor Target dan Isi Pesan wajib diisi!', 'warning');
                return;
            }

            btnSendBlast.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Mengirim...';
            btnSendBlast.disabled = true;

            const rawData = { target: targetNumbers, message: blastMessage, delay: '2' };
            const formData = new URLSearchParams();
            for (const key in rawData) formData.append(key, rawData[key]);

            try {
                const response = await fetch("https://api.fonnte.com/send", {
                    method: 'POST',
                    headers: { 'Authorization': savedToken },
                    body: formData
                });
                const result = await response.json();

                if (result.status) {
                    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Pesan masuk antrean Fonnte.', confirmButtonColor: '#18181b' });
                    document.getElementById('blastMessage').value = '';
                } else {
                    Swal.fire('Gagal Mengirim', result.reason, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Gagal memproses permintaan', 'error');
            } finally {
                btnSendBlast.innerHTML = '<i class="ph ph-paper-plane-right"></i> Kirim Sekarang';
                btnSendBlast.disabled = false;
            }
        });
    }

}); // Penutup DOMContentLoaded
