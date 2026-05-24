console.log("Sistem App.js Premium Anti-Ban diaktifkan...");

// ==========================================
// 1. INISIALISASI SUPABASE (DIAMANKAN DARI TABRAKAN VARIABEL GLOBAL)
// ==========================================
const supabaseUrl = 'https://wxugkuzdpbhojydqulmn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dWdrdXpkcGJob2p5ZHF1bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NzMxNDQsImV4cCI6MjA5NTE0OTE0NH0.FMTP85NEtV9v73XaclyTwMIeYt2VnI-F0n1pDlEiH8g';

let supabaseClient = null;

try {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log("Supabase Client berhasil diinisialisasi.");
    } else {
        console.warn("Library Supabase dari CDN tidak terdeteksi.");
    }
} catch (error) {
    console.error("Gagal menginisialisasi Supabase:", error);
}

// Fungsi Proteksi: Tendang ke halaman login jika tidak memiliki sesi
async function checkAuth() {
    if (!supabaseClient) return;
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.warn("Gagal mengecek session auth, menjalankan mode offline.");
    }
}

// Jalankan pengaman auth secara global
if (window.location.pathname.includes('dashboard.html')) {
    checkAuth();
}

// ==========================================
// 2. SEMUA LOGIKA UTAMA UI & PROSES DATA
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
                if (supabaseClient) await supabaseClient.auth.signOut();
                window.location.href = 'index.html';
            }
        });
    }

    // --- B. SPA NAVIGATION LOGIC ---
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('pageTitle');

    const titles = {
        'home': 'Dashboard',
        'contacts': 'CRM Customer',
        'templates': 'Template Pesan',
        'blast': 'Anti-Ban WA Blast Panel',
        'history': 'Riwayat Blast',
        'settings': 'Pengaturan Sistem'
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            if (!target) return;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll(`.nav-item[data-target="${target}"]`).forEach(n => n.classList.add('active'));

            viewSections.forEach(section => {
                section.classList.remove('active');
                section.classList.add('hidden'); 
            });
            
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                targetSection.classList.add('active');
            }

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

    // --- D. INITIALIZE GRAFIK CHART.JS ---
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

    // --- E. KONTAK CRM CUSTOMER (DUMMY DATA) ---
    const contacts = [
        { name: 'Budi Santoso', phone: '081234567890', tag: 'VIP Customer' },
        { name: 'Siti Aminah', phone: '081987654321', tag: 'Promo' },
        { name: 'Reza Rahadian', phone: '085611223344', tag: 'Cold Lead' }
    ];

    const renderContacts = () => {
        const tbody = document.getElementById('contactTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        contacts.forEach(c => {
            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random&rounded=true&bold=true`;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                        <img src="${avatar}" class="w-8 h-8 rounded-full shadow-sm">
                        <span class="font-medium text-zinc-900 dark:text-white">${c.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">${c.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300">${c.tag}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <button class="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1"><i class="ph ph-pencil-simple"></i></button>
                    <button class="text-zinc-400 hover:text-red-500 transition-colors p-1 ml-2"><i class="ph ph-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };
    renderContacts();

    // --- F. SISTEM CRUD TEMPLATE PESAN & INTEGRASI WA BLAST ---
    const templatesGrid = document.getElementById('templatesGrid');
    const templateEmptyState = document.getElementById('templateEmptyState');
    const blastTemplateSelect = document.getElementById('blastTemplateSelect');
    
    const templateModal = document.getElementById('templateModal');
    const templateForm = document.getElementById('templateForm');
    const btnOpenTemplateModal = document.getElementById('btnOpenTemplateModal');
    const btnCloseTemplateModal = document.getElementById('btnCloseTemplateModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    
    const templateIdInput = document.getElementById('templateId');
    const tplTitleInput = document.getElementById('tplTitle');
    const tplCategoryInput = document.getElementById('tplCategory');
    const tplContentInput = document.getElementById('tplContent');

    const defaultTemplates = [
        { id: "tpl-1", title: "Promo Akhir Bulan", category: "Promo", content: "Halo kak 👋 Ada promo terbaru hari ini.\n\nDapatkan diskon gila-gilaan akhir bulan up to 50% khusus produk terlaris kami!\n\nKlik link berikut untuk order: s.id/order-promo" },
        { id: "tpl-2", title: "Reminder Tagihan", category: "Tagihan", content: "Hai kak 😊 Mau info promo spesial hari ini?\n\nKami ingin mengingatkan bahwa tagihan Anda bulan ini akan jatuh tempo dalam 3 hari lagi.\n\nSilakan abaikan pesan ini jika Anda sudah melakukan pembayaran." }
    ];

    let templates = JSON.parse(localStorage.getItem('saved_templates')) || defaultTemplates;
    if (!localStorage.getItem('saved_templates')) {
        localStorage.setItem('saved_templates', JSON.stringify(defaultTemplates));
    }

    function renderTemplates() {
        if (!templatesGrid || !templateEmptyState) return;
        
        if (templates.length === 0) {
            templatesGrid.classList.add('hidden');
            templateEmptyState.classList.remove('hidden');
            return;
        }

        templateEmptyState.classList.add('hidden');
        templatesGrid.classList.remove('hidden');
        templatesGrid.innerHTML = '';

        templates.forEach(tpl => {
            const card = document.createElement('div');
            card.className = "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative flex flex-col justify-between hover:shadow-md transition-shadow";
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <h4 class="font-semibold text-zinc-900 dark:text-white truncate" title="${tpl.title}">${tpl.title}</h4>
                        <span class="shrink-0 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 rounded-md border border-zinc-200 dark:border-zinc-700 uppercase tracking-wider">${tpl.category}</span>
                    </div>
                    <p class="text-xs text-zinc-500 line-clamp-4 mt-2 whitespace-pre-line">${tpl.content}</p>
                </div>
                <div class="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-4">
                    <button class="btn-copy text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-medium flex items-center gap-1 transition-colors" data-content="${encodeURIComponent(tpl.content)}">
                        <i class="ph ph-copy"></i> Copy
                    </button>
                    <div class="flex items-center gap-2">
                        <button class="btn-edit text-zinc-400 hover:text-indigo-500 p-1 transition-colors text-lg" data-id="${tpl.id}">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="btn-delete text-zinc-400 hover:text-red-500 p-1 transition-colors text-lg" data-id="${tpl.id}">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            templatesGrid.appendChild(card);
        });

        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const textToCopy = decodeURIComponent(e.currentTarget.getAttribute('data-content'));
                navigator.clipboard.writeText(textToCopy);
                Swal.fire({ icon: 'success', title: 'Berhasil di-copy!', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                openModal(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const result = await Swal.fire({
                    title: 'Hapus template?',
                    text: "Tindakan ini tidak bisa dikembalikan.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#18181b',
                    confirmButtonText: 'Ya, Hapus'
                });

                if (result.isConfirmed) {
                    templates = templates.filter(t => t.id !== id);
                    localStorage.setItem('saved_templates', JSON.stringify(templates));
                    renderTemplates();
                    populateBlastDropdown();
                    Swal.fire('Terhapus!', 'Template berhasil dihapus.', 'success');
                }
            });
        });
    }

    function populateBlastDropdown() {
        if (!blastTemplateSelect) return;
        const currentValue = blastTemplateSelect.value;
        blastTemplateSelect.innerHTML = '<option value="">Pilih Template...</option>';
        
        templates.forEach(tpl => {
            const option = document.createElement('option');
            option.value = tpl.id;
            option.textContent = `${tpl.title} (${tpl.category})`;
            blastTemplateSelect.appendChild(option);
        });
        blastTemplateSelect.value = currentValue;
    }

    if (blastTemplateSelect) {
        blastTemplateSelect.addEventListener('change', () => {
            const selectedId = blastTemplateSelect.value;
            if (selectedId) {
                const selectedTpl = templates.find(t => t.id === selectedId);
                if (selectedTpl) {
                    // Update input variasi template pertama dengan isi template yang dipilih
                    const firstInput = document.querySelector('.tpl-rotation-input');
                    if (firstInput) {
                        firstInput.value = selectedTpl.content;
                        // Pemicu scan konten anti-spam
                        firstInput.dispatchEvent(new Event('input'));
                    }
                }
            }
        });
    }

    function openModal(id = null) {
        if (!templateModal) return;
        templateModal.classList.remove('hidden');

        if (id) {
            const tpl = templates.find(t => t.id === id);
            if (tpl) {
                document.getElementById('modalTemplateTitle').innerText = "Edit Template Pesan";
                templateIdInput.value = tpl.id;
                tplTitleInput.value = tpl.title;
                tplCategoryInput.value = tpl.category;
                tplContentInput.value = tpl.content;
            }
        } else {
            document.getElementById('modalTemplateTitle').innerText = "Tambah Template Baru";
            templateForm.reset();
            templateIdInput.value = '';
        }
    }

    function closeModal() {
        if (templateModal) templateModal.classList.add('hidden');
    }

    if (btnOpenTemplateModal) btnOpenTemplateModal.addEventListener('click', () => openModal());
    if (btnCloseTemplateModal) btnCloseTemplateModal.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    if (templateForm) {
        templateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = templateIdInput.value;
            const title = tplTitleInput.value.trim();
            const category = tplCategoryInput.value.trim();
            const content = tplContentInput.value.trim();

            if (id) {
                templates = templates.map(t => t.id === id ? { id, title, category, content } : t);
            } else {
                const newId = 'tpl-' + Date.now();
                templates.push({ id: newId, title, category, content });
            }

            localStorage.setItem('saved_templates', JSON.stringify(templates));
            renderTemplates();
            populateBlastDropdown();
            closeModal();

            Swal.fire({
                icon: 'success',
                title: id ? 'Template Diperbarui!' : 'Template Ditambahkan!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        });
    }

    renderTemplates();
    populateBlastDropdown();

    // --- G. PENGATURAN TOKEN & TEST KONEKSI FONNTE ---
    const tokenInput = document.getElementById('fonnteTokenInput');
    const btnSaveFonnte = document.getElementById('btnSaveFonnte');

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

    // ==========================================
    // MODULE: ADVANCED ANTI-BAN ENGINE LOGIC
    // ==========================================
    
    const variationContainer = document.getElementById('variationInputsContainer');
    const btnAddNewVariation = document.getElementById('btnAddNewVariation');
    const spamWarningBox = document.getElementById('spamWarningBox');
    const targetNumbersInput = document.getElementById('targetNumbers');
    const targetCounter = document.getElementById('targetCounter');

    // Anti-Spam Keywords
    const spamKeywords = ['GRATIS!!!', 'CUAN BESAR', 'KLIK SEKARANG', 'SLOT', 'PINJOL', 'PROMO GILA', 'MENANG BANYAK'];

    // Sapaan / Greetings Acak
    const greetings = [
        "Halo kak 👋",
        "Hai kak 😊",
        "Selamat pagi kak ☀️",
        "Selamat siang kak 👋",
        "Selamat sore kak ☕",
        "Sore kak 😊",
        "Hallo kak ✨"
    ];

    // Emojis Acak
    const randomEmojis = ["👋", "😊", "✨", "🔥", "👍", "☀️", "🙏", "⚡", "🚀"];

    // Update Counter Target Nomor Terdeteksi
    if (targetNumbersInput) {
        targetNumbersInput.addEventListener('input', () => {
            const raw = targetNumbersInput.value.trim();
            if (!raw) {
                targetCounter.textContent = '0 Nomor';
                return;
            }
            const count = raw.split(',').map(n => n.trim()).filter(n => n.length > 0).length;
            targetCounter.textContent = `${count} Nomor`;
        });
    }

    // Fungsi menambahkan input variasi template pesan
    function addVariationInput(initialContent = '') {
        const index = variationContainer.children.length + 1;
        const div = document.createElement('div');
        div.className = "relative group flex items-start gap-2 bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 transition-all";
        div.innerHTML = `
            <div class="flex-1">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-semibold text-zinc-400">Variasi Template #${index}</span>
                    <button type="button" class="btn-remove-variation text-xs text-rose-500 hover:opacity-80 transition-opacity hidden group-hover:block"><i class="ph ph-trash"></i> Hapus</button>
                </div>
                <textarea rows="3" class="tpl-rotation-input w-full bg-transparent outline-none text-sm resize-none text-zinc-900 dark:text-white" placeholder="Masukkan variasi pesan lainnya disini...">${initialContent}</textarea>
            </div>
        `;
        variationContainer.appendChild(div);

        // Scan Konten untuk Deteksi Kata Spam
        const textarea = div.querySelector('.tpl-rotation-input');
        textarea.addEventListener('input', () => {
            scanForSpamContent();
        });

        // Event hapus input
        div.querySelector('.btn-remove-variation').addEventListener('click', () => {
            if (variationContainer.children.length > 1) {
                div.remove();
                reindexVariationLabels();
                scanForSpamContent();
            } else {
                Swal.fire('Oops', 'Harus menyisakan minimal 1 variasi pesan.', 'warning');
            }
        });
    }

    function reindexVariationLabels() {
        Array.from(variationContainer.children).forEach((child, index) => {
            child.querySelector('span').textContent = `Variasi Template #${index + 1}`;
        });
    }

    // Pendeteksi Konten Spam Realtime
    function scanForSpamContent() {
        let isSpamFound = false;
        const textareas = document.querySelectorAll('.tpl-rotation-input');
        
        textareas.forEach(textarea => {
            const text = textarea.value.toUpperCase();
            spamKeywords.forEach(keyword => {
                if (text.includes(keyword.toUpperCase())) {
                    isSpamFound = true;
                }
            });
        });

        if (isSpamFound) {
            spamWarningBox.classList.remove('hidden');
            updateDeviceHealth('warning');
        } else {
            spamWarningBox.classList.add('hidden');
            updateDeviceHealth('safe');
        }
    }

    // Inisialisasi awal variasi template acak
    if (btnAddNewVariation) {
        btnAddNewVariation.addEventListener('click', () => {
            if (variationContainer.children.length < 5) {
                addVariationInput();
            } else {
                Swal.fire('Limit Variasi', 'Maksimal penggunaan variasi rotasi template adalah 5.', 'info');
            }
        });
    }

    // Tambah variasi default pertama
    addVariationInput("Halo kak, kami ada penawaran menarik khusus hari ini!");

    // --- LOGIKA SETTING PRESET ANTI-BAN ---
    const presetSafe = document.getElementById('btnPresetSafe');
    const presetNormal = document.getElementById('btnPresetNormal');
    const presetFast = document.getElementById('btnPresetFast');

    const minDelayInput = document.getElementById('minDelay');
    const maxDelayInput = document.getElementById('maxDelay');
    const batchSizeInput = document.getElementById('batchSize');
    const batchPauseInput = document.getElementById('batchPause');
    const presetDesc = document.getElementById('presetDescription');

    function selectPreset(mode) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-zinc-900', 'text-white', 'dark:bg-white', 'dark:text-zinc-950', 'border-zinc-900', 'dark:border-white');
            btn.classList.add('border-zinc-200', 'dark:border-zinc-800', 'text-zinc-700', 'dark:text-zinc-300');
        });

        const activeBtn = document.getElementById(`btnPreset${mode}`);
        activeBtn.classList.remove('border-zinc-200', 'dark:border-zinc-800', 'text-zinc-700', 'dark:text-zinc-300');
        activeBtn.classList.add('active', 'bg-zinc-900', 'text-white', 'dark:bg-white', 'dark:text-zinc-950', 'border-zinc-900', 'dark:border-white');

        if (mode === 'Safe') {
            minDelayInput.value = 30;
            maxDelayInput.value = 60;
            batchSizeInput.value = 15;
            batchPauseInput.value = 3;
            presetDesc.textContent = "Mode Safe: Delay panjang (30-60 detik) dengan jeda batch ketat. Sangat direkomendasikan untuk menghindari filter bot.";
            updateDeviceHealth('safe');
        } else if (mode === 'Normal') {
            minDelayInput.value = 15;
            maxDelayInput.value = 30;
            batchSizeInput.value = 30;
            batchPauseInput.value = 2;
            presetDesc.textContent = "Mode Normal: Kecepatan pengiriman sedang (15-30 detik). Sesuai untuk nomor WhatsApp yang sudah aktif berinteraksi.";
            updateDeviceHealth('normal');
        } else if (mode === 'Fast') {
            minDelayInput.value = 5;
            maxDelayInput.value = 15;
            batchSizeInput.value = 50;
            batchPauseInput.value = 1;
            presetDesc.textContent = "Mode Fast: Pengiriman cepat (5-15 detik). Memiliki risiko ban sangat tinggi jika dikirim ke nomor non-kontak.";
            updateDeviceHealth('high_risk');
        }
    }

    if (presetSafe) presetSafe.addEventListener('click', () => selectPreset('Safe'));
    if (presetNormal) presetNormal.addEventListener('click', () => selectPreset('Normal'));
    if (presetFast) presetFast.addEventListener('click', () => selectPreset('Fast'));

    // --- DAILY LIMIT SELECTION ---
    const btnLimitNewNum = document.getElementById('btnLimitNewNum');
    const btnLimitActiveNum = document.getElementById('btnLimitActiveNum');
    const txtDailyLimitRec = document.getElementById('txtDailyLimitRec');

    if (btnLimitNewNum && btnLimitActiveNum) {
        btnLimitNewNum.addEventListener('click', () => {
            btnLimitNewNum.classList.add('text-zinc-900', 'dark:text-white', 'font-semibold');
            btnLimitActiveNum.classList.remove('text-zinc-900', 'dark:text-white', 'font-semibold');
            btnLimitActiveNum.classList.add('text-zinc-500');
            txtDailyLimitRec.textContent = '50 / Hari (Nomor Baru)';
        });

        btnLimitActiveNum.addEventListener('click', () => {
            btnLimitActiveNum.classList.add('text-zinc-900', 'dark:text-white', 'font-semibold');
            btnLimitNewNum.classList.remove('text-zinc-900', 'dark:text-white', 'font-semibold');
            btnLimitNewNum.classList.add('text-zinc-500');
            txtDailyLimitRec.textContent = '200 / Hari (Nomor Lama/Aktif)';
        });
    }

    // --- DEVICE HEALTH STATUS MODIFIER ---
    const deviceHealthWidget = document.getElementById('deviceHealthWidget');
    const deviceHealthIcon = document.getElementById('deviceHealthIcon');
    const deviceHealthTitle = document.getElementById('deviceHealthTitle');
    const deviceHealthDesc = document.getElementById('deviceHealthDesc');
    const deviceHealthPing = document.getElementById('deviceHealthPing');
    const homeSpamRiskBadge = document.getElementById('homeSpamRiskBadge');

    function updateDeviceHealth(status) {
        if (!deviceHealthWidget) return;

        // Reset classes
        deviceHealthWidget.className = "flex items-center justify-between p-4 border rounded-xl transition-all ";
        deviceHealthPing.className = "w-3 h-3 rounded-full animate-ping shrink-0 ";

        if (status === 'safe') {
            deviceHealthWidget.classList.add("bg-emerald-50", "dark:bg-emerald-950/20", "border-emerald-100", "dark:border-emerald-900/30");
            deviceHealthIcon.className = "ph ph-heartbeat text-2xl text-emerald-500";
            deviceHealthTitle.textContent = "Device Status: AMAN";
            deviceHealthTitle.className = "text-sm font-semibold text-emerald-800 dark:text-emerald-300";
            deviceHealthDesc.textContent = "Sistem anti-ban dikonfigurasi optimal.";
            deviceHealthPing.classList.add("bg-emerald-500");
            if (homeSpamRiskBadge) {
                homeSpamRiskBadge.textContent = "SANGAT AMAN";
                homeSpamRiskBadge.className = "text-xl font-bold tracking-tight text-emerald-500 mt-1";
            }
        } else if (status === 'normal') {
            deviceHealthWidget.classList.add("bg-amber-50", "dark:bg-amber-950/20", "border-amber-100", "dark:border-amber-900/30");
            deviceHealthIcon.className = "ph ph-shield-warning text-2xl text-amber-500";
            deviceHealthTitle.textContent = "Device Status: WASPADA";
            deviceHealthTitle.className = "text-sm font-semibold text-amber-800 dark:text-amber-300";
            deviceHealthDesc.textContent = "Konfigurasi sedang, pastikan nomor Anda sudah di-warmup.";
            deviceHealthPing.classList.add("bg-amber-500");
            if (homeSpamRiskBadge) {
                homeSpamRiskBadge.textContent = "WASPADA";
                homeSpamRiskBadge.className = "text-xl font-bold tracking-tight text-amber-500 mt-1";
            }
        } else if (status === 'high_risk') {
            deviceHealthWidget.classList.add("bg-rose-50", "dark:bg-rose-950/20", "border-rose-100", "dark:border-rose-900/30");
            deviceHealthIcon.className = "ph ph-warning-octagon text-2xl text-rose-500 animate-bounce";
            deviceHealthTitle.textContent = "Device Status: RISIKO TINGGI";
            deviceHealthTitle.className = "text-sm font-semibold text-rose-800 dark:text-rose-300";
            deviceHealthDesc.textContent = "Menggunakan delay cepat! Nomor berisiko terkena ban WhatsApp.";
            deviceHealthPing.classList.add("bg-rose-500");
            if (homeSpamRiskBadge) {
                homeSpamRiskBadge.textContent = "RISIKO TINGGI";
                homeSpamRiskBadge.className = "text-xl font-bold tracking-tight text-rose-500 mt-1";
            }
        }
    }


    // ==========================================
    // MODULE: CORE QUEUE CAMPAIGN RUNNER (ANTI-BAN)
    // ==========================================
    const btnSendBlastPremium = document.getElementById('btnSendBlast');
    const liveQueueBox = document.getElementById('liveQueueBox');
    const queueSimulationText = document.getElementById('queueSimulationText');
    const queueProgressBadge = document.getElementById('queueProgressBadge');
    const queueProgressBar = document.getElementById('queueProgressBar');
    
    const statSuccessCount = document.getElementById('statSuccessCount');
    const statFailedCount = document.getElementById('statFailedCount');
    const statEstTime = document.getElementById('statEstTime');
    const statAvgDelay = document.getElementById('statAvgDelay');

    let cancelCampaign = false;

    if (btnSendBlastPremium) {
        btnSendBlastPremium.addEventListener('click', async () => {
            const rawTargets = targetNumbersInput.value.trim();
            const savedToken = localStorage.getItem('saved_fonnte_token');

            if (!savedToken) {
                Swal.fire('Akses Ditolak', 'Masukkan Token Fonnte di menu Pengaturan terlebih dahulu.', 'warning');
                return;
            }

            if (!rawTargets) {
                Swal.fire('Perhatian', 'Nomor Target wajib diisi!', 'warning');
                return;
            }

            // Parse targets to Array
            const targets = rawTargets.split(',').map(n => n.trim()).filter(n => n.length > 0);
            if (targets.length === 0) {
                Swal.fire('Perhatian', 'Tidak ditemukan nomor target valid!', 'warning');
                return;
            }

            // Get Message Variations
            const variations = Array.from(document.querySelectorAll('.tpl-rotation-input'))
                                    .map(textarea => textarea.value.trim())
                                    .filter(val => val.length > 0);

            if (variations.length === 0) {
                Swal.fire('Perhatian', 'Tulis variasi pesan minimal 1 template!', 'warning');
                return;
            }

            // Confirmation Campaign Launch
            const confirmRun = await Swal.fire({
                title: 'Jalankan Campaign Anti-Ban?',
                text: `Sistem akan mengirim pesan ke ${targets.length} nomor dengan parameter acak secara bergantian.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#18181b',
                confirmButtonText: 'Ya, Jalankan'
            });

            if (!confirmRun.isConfirmed) return;

            // UI Init Queue Monitor
            liveQueueBox.classList.remove('hidden');
            btnSendBlastPremium.disabled = true;
            btnSendBlastPremium.className = "w-full py-3.5 bg-rose-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-2";
            btnSendBlastPremium.innerHTML = '<i class="ph ph-stop"></i> Batalkan / Hentikan Campaign';

            // Reset Stats Counters
            let success = 0;
            let failed = 0;
            statSuccessCount.textContent = '0';
            statFailedCount.textContent = '0';
            queueProgressBadge.textContent = `0 / ${targets.length}`;
            queueProgressBar.style.width = '0%';

            cancelCampaign = false;

            // Get Input Configuration Values
            const minDelay = parseInt(minDelayInput.value) || 15;
            const maxDelay = parseInt(maxDelayInput.value) || 30;
            const batchSize = parseInt(batchSizeInput.value) || 10;
            const batchPause = parseInt(batchPauseInput.value) || 2;

            const chkGreeting = document.getElementById('chkRandomGreeting').checked;
            const chkEmoji = document.getElementById('chkRandomEmoji').checked;

            // Tampilkan rata-rata delay di statistik
            statAvgDelay.textContent = `${Math.round((minDelay + maxDelay) / 2)}s`;

            // --- RUN BLAST QUEUE LOOP ---
            for (let i = 0; i < targets.length; i++) {
                if (cancelCampaign) {
                    Swal.fire('Dibatalkan', 'Campaign berhasil dihentikan oleh pengguna.', 'info');
                    break;
                }

                const currentTarget = targets[i];
                queueSimulationText.innerHTML = `<i class="ph ph-sparkle text-indigo-500 animate-spin"></i> Mempersiapkan pesan ke ${currentTarget}...`;

                // 1. Template Rotation (Pilih Template secara acak)
                const randomTplIndex = Math.floor(Math.random() * variations.length);
                let baseMessage = variations[randomTplIndex];

                // 2. Modifikasi Sapaan Acak (Random Greeting)
                if (chkGreeting) {
                    const randomGreet = greetings[Math.floor(Math.random() * greetings.length)];
                    baseMessage = `${randomGreet}\n\n${baseMessage}`;
                }

                // 3. Modifikasi Emoji Acak (Random Emoji)
                if (chkEmoji) {
                    const randomEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
                    baseMessage = `${baseMessage} ${randomEmoji}`;
                }

                // 4. Human Simulation Mode: Typing Status Delay Simulation (2-4 detik)
                queueSimulationText.innerHTML = `<i class="ph ph-keyboard text-indigo-500 animate-pulse"></i> Mengetik pesan untuk ${currentTarget}...`;
                await new Promise(resolve => setTimeout(resolve, 2500));

                // 5. Send Process (Fonnte Fetch API)
                const payload = new URLSearchParams();
                payload.append('target', currentTarget);
                payload.append('message', baseMessage);

                try {
                    const response = await fetch("https://api.fonnte.com/send", {
                        method: 'POST',
                        headers: { 'Authorization': savedToken },
                        body: payload
                    });
                    const result = await response.json();

                    if (result.status) {
                        success++;
                        statSuccessCount.textContent = success;
                    } else {
                        failed++;
                        statFailedCount.textContent = failed;
                    }
                } catch (err) {
                    failed++;
                    statFailedCount.textContent = failed;
                }

                // Update Progress bar & labels
                const processedCount = i + 1;
                const progressPct = Math.round((processedCount / targets.length) * 100);
                queueProgressBar.style.width = `${progressPct}%`;
                queueProgressBadge.textContent = `${processedCount} / ${targets.length}`;

                // Sisa Antrean Terakhir
                if (processedCount === targets.length) {
                    queueSimulationText.innerHTML = `<i class="ph ph-check-circle text-emerald-500"></i> Selesai! Campaign berhasil dikirim.`;
                    break;
                }

                // 6. Batch Sending Pause System (Setiap X pesan dikirim, jeda Y menit)
                if (processedCount % batchSize === 0) {
                    queueSimulationText.innerHTML = `<i class="ph ph-pause-circle text-amber-500 animate-pulse"></i> Jeda Batch aktif... Menunggu ${batchPause} menit sebelum batch baru.`;
                    
                    let secondsLeft = batchPause * 60;
                    while (secondsLeft > 0) {
                        if (cancelCampaign) break;
                        statEstTime.textContent = `${secondsLeft}s`;
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        secondsLeft--;
                    }
                    continue; // Skip normal delay if batch pause was processed
                }

                // 7. Smart Random Delay System (Antar Pesan Tunggal)
                const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                let countdown = randomDelay;
                
                while (countdown > 0) {
                    if (cancelCampaign) break;
                    queueSimulationText.innerHTML = `<i class="ph ph-hourglass-low text-indigo-500 animate-spin"></i> Jeda human-sleep: Menunggu ${countdown}s sebelum lanjut ke target berikutnya...`;
                    statEstTime.textContent = `${countdown}s`;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    countdown--;
                }
            }

            // Reset Button to Default State
            btnSendBlastPremium.disabled = false;
            btnSendBlastPremium.className = "w-full py-3.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-semibold rounded-xl shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-2";
            btnSendBlastPremium.innerHTML = '<i class="ph ph-rocket-launch"></i> Jalankan Anti-Ban Blast Campaign';
            
            if (!cancelCampaign) {
                Swal.fire({
                    icon: 'success',
                    title: 'Blast Selesai!',
                    text: `Campaign rampung. Terkirim: ${success}, Gagal: ${failed}.`,
                    confirmButtonColor: '#18181b'
                });
            }
        });
    }

    // Listener Stop Campaign Button
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'btnSendBlast' && btnSendBlastPremium.disabled === true) {
            cancelCampaign = true;
            queueSimulationText.innerHTML = `<i class="ph ph-x-circle text-rose-500"></i> Membatalkan pengiriman...`;
        }
    });

}); // Penutup DOMContentLoaded
