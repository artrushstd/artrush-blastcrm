console.log("Sistem CRM Premium & WA Blast Engine diaktifkan...");

// ==========================================
// 1. INISIALISASI SUPABASE
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

    const html = document.documentElement;

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
        'contacts': 'CRM Customer Management',
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

    // ==========================================
    // MODULE: ADVANCED CRM CUSTOMER ENGINE
    // ==========================================
    
    // CRM Elements
    const crmTableBody = document.getElementById('crmTableBody');
    const crmEmptyState = document.getElementById('crmEmptyState');
    const crmTableContainer = document.getElementById('crmTableContainer');
    const crmSearch = document.getElementById('crmSearch');
    const stickyBulkToolbar = document.getElementById('stickyBulkToolbar');
    const txtBulkSelectedCount = document.getElementById('txtBulkSelectedCount');
    const chkSelectAllCRM = document.getElementById('chkSelectAllCRM');

    // Customer Modal Elements
    const customerModal = document.getElementById('customerModal');
    const customerForm = document.getElementById('customerForm');
    const btnAddCustomer = document.getElementById('btnAddCustomer');
    const btnCloseCustModal = document.getElementById('btnCloseCustModal');
    const custModalBackdrop = document.getElementById('custModalBackdrop');
    const waValidationWarning = document.getElementById('waValidationWarning');

    // Drawer Elements (Detail Notion-style)
    const customerDrawer = document.getElementById('customerDrawer');
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    const drawerAvatar = document.getElementById('drawerAvatar');
    const drawerName = document.getElementById('drawerName');
    const drawerPhone = document.getElementById('drawerPhone');
    const drawerLTV = document.getElementById('drawerLTV');
    const drawerScore = document.getElementById('drawerScore');
    const drawerScoreBadge = document.getElementById('drawerScoreBadge');
    const drawerNoteInput = document.getElementById('drawerNoteInput');
    const drawerReminderTime = document.getElementById('drawerReminderTime');
    const btnSaveDrawerNote = document.getElementById('btnSaveDrawerNote');
    const drawerTimeline = document.getElementById('drawerTimeline');

    // Saved Segments List Elements
    const badgeSegAll = document.getElementById('badgeSegAll');
    const badgeSegVip = document.getElementById('badgeSegVip');
    const badgeSegHot = document.getElementById('badgeSegHot');
    const badgeSegDormant = document.getElementById('badgeSegDormant');

    // Analytics Counter
    const crmStatTotal = document.getElementById('crmStatTotal');
    const crmStatActive = document.getElementById('crmStatActive');
    const crmStatHot = document.getElementById('crmStatHot');
    const crmStatDormant = document.getElementById('crmStatDormant');
    const crmStatLTV = document.getElementById('crmStatLTV');

    // CRM State Data (Sistem fallback LocalStorage)
    const defaultCustomers = [
        { id: "cust-1", name: "Sarah Connor", phone: "6281234567890", tags: "VIP Customer, Hot Lead", transactions: 9500000, source: "Instagram", lastActive: "2026-05-20", score: 85 },
        { id: "cust-2", name: "John Doe", phone: "6281987654321", tags: "Warm Lead", transactions: 1200000, source: "Website Direct", lastActive: "2026-05-15", score: 45 },
        { id: "cust-3", name: "T-800 Terminator", phone: "6285611223344", tags: "Dormant Customer, Cold Lead", transactions: 0, source: "Referral", lastActive: "2026-04-01", score: 10 }
    ];

    let crmData = JSON.parse(localStorage.getItem('saved_crm_data')) || defaultCustomers;
    if (!localStorage.getItem('saved_crm_data')) {
        localStorage.setItem('saved_crm_data', JSON.stringify(defaultCustomers));
    }

    let activeSegment = "all";
    let selectedCRMIds = [];
    let currentViewingCustomerId = null;

    // --- LOGIKA UTAMA RENDER CRM ---
    function renderCRM() {
        if (!crmTableBody || !crmEmptyState || !crmTableContainer) return;

        // Filter berdasarkan Segment
        let filtered = crmData;
        if (activeSegment === 'vip') {
            filtered = crmData.filter(c => c.transactions > 5000000);
        } else if (activeSegment === 'hot') {
            filtered = crmData.filter(c => c.score >= 70);
        } else if (activeSegment === 'dormant') {
            filtered = crmData.filter(c => {
                const diffTime = Math.abs(new Date() - new Date(c.lastActive));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 30;
            });
        }

        // Filter berdasarkan Realtime Search
        const searchVal = crmSearch.value.trim().toLowerCase();
        if (searchVal) {
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(searchVal) || 
                c.phone.includes(searchVal) || 
                c.tags.toLowerCase().includes(searchVal) || 
                c.source.toLowerCase().includes(searchVal)
            );
        }

        // Tampilkan Empty State jika kosong
        if (filtered.length === 0) {
            crmTableContainer.classList.add('hidden');
            crmEmptyState.classList.remove('hidden');
            return;
        }

        crmEmptyState.classList.add('hidden');
        crmTableContainer.classList.remove('hidden');
        crmTableBody.innerHTML = '';

        filtered.forEach(cust => {
            const isChecked = selectedCRMIds.includes(cust.id);
            const scoreColor = cust.score >= 70 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : cust.score >= 40 ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40';
            
            // Aturan Auto Tagging
            let autoTags = cust.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
            if (cust.transactions > 5000000 && !autoTags.includes('VIP')) autoTags.push('VIP');
            
            const tr = document.createElement('tr');
            tr.className = "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors cursor-pointer group";
            tr.dataset.id = cust.id;
            tr.innerHTML = `
                <td class="px-6 py-4" onclick="event.stopPropagation()">
                    <input type="checkbox" class="chk-row rounded accent-zinc-950" data-id="${cust.id}" ${isChecked ? 'checked' : ''}>
                </td>
                <td class="px-6 py-4 font-semibold text-zinc-900 dark:text-white flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name)}&background=random" class="w-8 h-8 rounded-full">
                    <span>${cust.name}</span>
                </td>
                <td class="px-6 py-4 text-zinc-600 dark:text-zinc-400">${cust.phone}</td>
                <td class="px-6 py-4 whitespace-normal max-w-xs">
                    <div class="flex flex-wrap gap-1.5">
                        ${autoTags.map(tag => `<span class="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium border border-zinc-200 dark:border-zinc-700 rounded-md">${tag}</span>`).join('')}
                    </div>
                </td>
                <td class="px-6 py-4 col-score">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-lg ${scoreColor}">${cust.score} Poin</span>
                </td>
                <td class="px-6 py-4 col-ltv font-medium text-indigo-500">${formatRupiah(cust.transactions)}</td>
                <td class="px-6 py-4 col-source text-zinc-500 text-xs">${cust.source}</td>
                <td class="px-6 py-4 col-activity text-zinc-500 text-xs">${cust.lastActive}</td>
                <td class="px-6 py-4 text-right" onclick="event.stopPropagation()">
                    <div class="flex items-center justify-end gap-2">
                        <button class="btn-quick-wa text-zinc-400 hover:text-emerald-500 transition-colors text-lg" data-phone="${cust.phone}"><i class="ph ph-whatsapp-logo"></i></button>
                        <button class="btn-edit-cust text-zinc-400 hover:text-indigo-500 transition-colors text-lg" data-id="${cust.id}"><i class="ph ph-pencil-simple"></i></button>
                        <button class="btn-delete-cust text-zinc-400 hover:text-rose-500 transition-colors text-lg" data-id="${cust.id}"><i class="ph ph-trash"></i></button>
                    </div>
                </td>
            `;

            // Buka Drawer Detail saat Baris Klik
            tr.addEventListener('click', () => {
                openCustomerDrawer(cust.id);
            });

            crmTableBody.appendChild(tr);
        });

        // Event listener dinamis checkbox baris
        document.querySelectorAll('.chk-row').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                if (e.target.checked) {
                    selectedCRMIds.push(id);
                } else {
                    selectedCRMIds = selectedCRMIds.filter(x => x !== id);
                }
                updateBulkToolbar();
            });
        });

        // Event listener Quick Action WA
        document.querySelectorAll('.btn-quick-wa').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const phone = e.currentTarget.getAttribute('data-phone');
                window.open(`https://wa.me/${phone}`, '_blank');
            });
        });

        // Event listener Edit Customer
        document.querySelectorAll('.btn-edit-cust').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                openCustomerModal(id);
            });
        });

        // Event listener Hapus Customer
        document.querySelectorAll('.btn-delete-cust').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const result = await Swal.fire({
                    title: 'Hapus customer?',
                    text: 'Seluruh riwayat catatan dan timeline akan terhapus permanen.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33'
                });

                if (result.isConfirmed) {
                    crmData = crmData.filter(x => x.id !== id);
                    localStorage.setItem('saved_crm_data', JSON.stringify(crmData));
                    renderCRM();
                    updateCRMAnalytics();
                    Swal.fire('Terhapus', 'Kontak customer berhasil dihapus.', 'success');
                }
            });
        });

        updateCRMAnalytics();
    }

    // --- DEBOUNCE SEARCH ---
    let searchTimeout;
    if (crmSearch) {
        crmSearch.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                renderCRM();
            }, 300);
        });
    }

    // --- SISTEM SEGMENTASI (SAVED SEGMENTS) ---
    const segmentButtons = document.querySelectorAll('#savedSegmentsList button');
    segmentButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            segmentButtons.forEach(b => b.className = "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50 flex justify-between items-center");
            btn.className = "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex justify-between items-center";
            
            activeSegment = btn.getAttribute('data-segment');
            renderCRM();
        });
    });

    // --- REALTIME CUSTOMER ANALYTICS & BADGES ---
    function updateCRMAnalytics() {
        if (!crmStatTotal) return;

        const total = crmData.length;
        const active = crmData.filter(c => c.score >= 50).length;
        const hot = crmData.filter(c => c.score >= 70).length;
        
        const dormant = crmData.filter(c => {
            const diffTime = Math.abs(new Date() - new Date(c.lastActive));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 30;
        }).length;

        const totalLtv = crmData.reduce((acc, curr) => acc + (parseInt(curr.transactions) || 0), 0);

        crmStatTotal.textContent = total;
        crmStatActive.textContent = active;
        crmStatHot.textContent = hot;
        crmStatDormant.textContent = dormant;
        crmStatLTV.textContent = formatRupiah(totalLtv);

        // Update Badges di Sidebar
        if (badgeSegAll) badgeSegAll.textContent = total;
        if (badgeSegVip) badgeSegVip.textContent = crmData.filter(c => c.transactions > 5000000).length;
        if (badgeSegHot) badgeSegHot.textContent = hot;
        if (badgeSegDormant) badgeSegDormant.textContent = dormant;
    }

    // --- STICKY BULK ACTIONS TOOLBAR LOGIC ---
    if (chkSelectAllCRM) {
        chkSelectAllCRM.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedCRMIds = crmData.map(c => c.id);
            } else {
                selectedCRMIds = [];
            }
            renderCRM();
            updateBulkToolbar();
        });
    }

    function updateBulkToolbar() {
        if (!stickyBulkToolbar) return;

        if (selectedCRMIds.length > 0) {
            stickyBulkToolbar.classList.remove('translate-y-24', 'opacity-0');
            stickyBulkToolbar.classList.add('translate-y-0', 'opacity-100');
            txtBulkSelectedCount.textContent = `${selectedCRMIds.length} terpilih`;
        } else {
            stickyBulkToolbar.classList.add('translate-y-24', 'opacity-0');
            stickyBulkToolbar.classList.remove('translate-y-0', 'opacity-100');
            if (chkSelectAllCRM) chkSelectAllCRM.checked = false;
        }
    }

    // Bulk Delete
    const btnBulkDelete = document.getElementById('btnBulkDelete');
    if (btnBulkDelete) {
        btnBulkDelete.addEventListener('click', async () => {
            const result = await Swal.fire({
                title: `Hapus ${selectedCRMIds.length} kontak?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33'
            });

            if (result.isConfirmed) {
                crmData = crmData.filter(c => !selectedCRMIds.includes(c.id));
                localStorage.setItem('saved_crm_data', JSON.stringify(crmData));
                selectedCRMIds = [];
                renderCRM();
                updateBulkToolbar();
                Swal.fire('Terhapus', 'Kontak terpilih berhasil dihapus.', 'success');
            }
        });
    }

    // Bulk Blast (Pindahkan nomor target langsung ke panel WA Blast)
    const btnBulkBlast = document.getElementById('btnBulkBlast');
    if (btnBulkBlast) {
        btnBulkBlast.addEventListener('click', () => {
            const targetList = crmData.filter(c => selectedCRMIds.includes(c.id)).map(c => c.phone).join(', ');
            
            // Pindahkan ke panel WA Blast
            document.querySelector('[data-target="blast"]').click();
            document.getElementById('targetNumbers').value = targetList;
            // Trigger input event to update numbers counter
            document.getElementById('targetNumbers').dispatchEvent(new Event('input'));

            // Clear selections
            selectedCRMIds = [];
            updateBulkToolbar();
            renderCRM();
        });
    }

    // --- COLOUMN CUSTOMIZATION POPULARITY ---
    const btnToggleColumns = document.getElementById('btnToggleColumns');
    const columnSelectorPopover = document.getElementById('columnSelectorPopover');

    if (btnToggleColumns && columnSelectorPopover) {
        btnToggleColumns.addEventListener('click', (e) => {
            e.stopPropagation();
            columnSelectorPopover.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            columnSelectorPopover.classList.add('hidden');
        });

        columnSelectorPopover.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.querySelectorAll('.col-toggle').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const targetCol = e.target.getAttribute('data-col');
                const cells = document.querySelectorAll(`.${targetCol}`);
                cells.forEach(c => {
                    if (e.target.checked) {
                        c.classList.remove('hidden');
                    } else {
                        c.classList.add('hidden');
                    }
                });
            });
        });
    }

    // --- PRO EXPORT EXCEL/CSV ---
    const btnExportMenu = document.getElementById('btnExportMenu');
    if (btnExportMenu) {
        btnExportMenu.addEventListener('click', () => {
            const ws = XLSX.utils.json_to_sheet(crmData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "CRM Customers");
            XLSX.writeFile(wb, "SaaS_CRM_Export.xlsx");
            Swal.fire('Sukses Export', 'Data berhasil diexport ke file Excel.', 'success');
        });
    }

    // --- SMART IMPORT CSV/EXCEL (DENGAN DETEKSI DUPLIKAT & MERGE) ---
    const importCRMExcel = document.getElementById('importCRMExcel');
    if (importCRMExcel) {
        importCRMExcel.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawImported = XLSX.utils.sheet_to_json(firstSheet);

                let addedCount = 0;
                let mergedCount = 0;

                rawImported.forEach(row => {
                    const cleanPhone = String(row.phone || row.Phone || '').trim();
                    const cleanName = String(row.name || row.Name || 'Tanpa Nama').trim();
                    const cleanTags = String(row.tags || row.Tags || 'Imported').trim();
                    const cleanLTV = parseInt(row.transactions || row.Transactions || 0);
                    const cleanSource = String(row.source || row.Source || 'Import').trim();

                    if (cleanPhone) {
                        // Cek Duplikat Nomor WA
                        const existingIdx = crmData.findIndex(x => x.phone === cleanPhone);
                        if (existingIdx !== -1) {
                            // Merge Data Transaksi / CLV & Tambah Tag
                            crmData[existingIdx].transactions += cleanLTV;
                            crmData[existingIdx].tags += `, ${cleanTags}`;
                            crmData[existingIdx].score = Math.min(crmData[existingIdx].score + 10, 100);
                            mergedCount++;
                        } else {
                            // Masukkan Baru
                            crmData.push({
                                id: 'cust-' + Date.now() + Math.random().toString(36).substr(2, 5),
                                name: cleanName,
                                phone: cleanPhone,
                                tags: cleanTags,
                                transactions: cleanLTV,
                                source: cleanSource,
                                lastActive: new Date().toISOString().split('T')[0],
                                score: 50
                            });
                            addedCount++;
                        }
                    }
                });

                localStorage.setItem('saved_crm_data', JSON.stringify(crmData));
                renderCRM();

                Swal.fire({
                    icon: 'success',
                    title: 'Smart Import Berhasil!',
                    text: `Berhasil menambahkan ${addedCount} kontak baru dan merge ${mergedCount} kontak duplikat.`,
                    confirmButtonColor: '#18181b'
                });
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // --- NOTION-STYLE DETAIL DRAWER LOGIC ---
    function openCustomerDrawer(id) {
        if (!customerDrawer) return;
        currentViewingCustomerId = id;

        const cust = crmData.find(x => x.id === id);
        if (!cust) return;

        // Populate Drawer Info
        drawerAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name)}&background=random`;
        drawerName.textContent = cust.name;
        drawerPhone.textContent = cust.phone;
        drawerLTV.textContent = formatRupiah(cust.transactions);
        drawerScore.textContent = `${cust.score} Poin`;

        // Update Score Badge Kategori
        if (cust.score >= 70) {
            drawerScoreBadge.textContent = "Hot Lead";
            drawerScoreBadge.className = "text-[9px] font-semibold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded";
        } else if (cust.score >= 40) {
            drawerScoreBadge.textContent = "Warm Lead";
            drawerScoreBadge.className = "text-[9px] font-semibold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded";
        } else {
            drawerScoreBadge.textContent = "Cold Lead";
            drawerScoreBadge.className = "text-[9px] font-semibold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded";
        }

        // Render Timeline
        renderTimeline(cust);

        // Slide In Drawer Panel
        customerDrawer.classList.remove('translate-x-full');
    }

    function closeCustomerDrawer() {
        if (customerDrawer) customerDrawer.classList.add('translate-x-full');
        currentViewingCustomerId = null;
    }

    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeCustomerDrawer);

    // --- TIMELINE ACTIVITIES & NOTES LOGIC ---
    function renderTimeline(cust) {
        if (!drawerTimeline) return;
        drawerTimeline.innerHTML = '';

        // Ambil list catatan internal
        const notesKey = `notes_${cust.id}`;
        const savedNotes = JSON.parse(localStorage.getItem(notesKey)) || [
            { date: cust.lastActive, content: `Customer berhasil ditambahkan ke sistem via ${cust.source}.` }
        ];

        savedNotes.forEach(note => {
            const div = document.createElement('div');
            div.className = "relative pl-1";
            div.innerHTML = `
                <div class="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-white shrink-0"></div>
                <div class="space-y-1">
                    <span class="text-[10px] text-zinc-400 font-semibold block leading-none">${note.date}</span>
                    <p class="text-xs text-zinc-700 dark:text-zinc-300 font-medium">${note.content}</p>
                </div>
            `;
            drawerTimeline.appendChild(div);
        });
    }

    if (btnSaveDrawerNote) {
        btnSaveDrawerNote.addEventListener('click', () => {
            const noteText = drawerNoteInput.value.trim();
            const reminderTime = drawerReminderTime.value;

            if (!currentViewingCustomerId) return;

            const custIdx = crmData.findIndex(x => x.id === currentViewingCustomerId);
            if (custIdx === -1) return;

            // Tambah Poin Peminatan (+10 Poin jika Admin memberi catatan/follow-up)
            crmData[currentViewingCustomerId ? crmData.findIndex(x => x.id === currentViewingCustomerId) : -1].score = Math.min(crmData[custIdx].score + 10, 100);

            const notesKey = `notes_${currentViewingCustomerId}`;
            const savedNotes = JSON.parse(localStorage.getItem(notesKey)) || [
                { date: crmData[custIdx].lastActive, content: `Customer berhasil ditambahkan ke sistem via ${crmData[custIdx].source}.` }
            ];

            const today = new Date().toISOString().split('T')[0];
            
            if (noteText) {
                savedNotes.unshift({ date: today, content: noteText });
            }

            if (reminderTime) {
                savedNotes.unshift({ date: today, content: `🔔 Jadwal Pengingat Follow-Up diset: ${reminderTime.replace('T', ' ')}` });
                Swal.fire('Reminder Jadwal!', 'Reminder follow-up WhatsApp telah dijadwalkan.', 'success');
            }

            localStorage.setItem(notesKey, JSON.stringify(savedNotes));
            localStorage.setItem('saved_crm_data', JSON.stringify(crmData));

            drawerNoteInput.value = '';
            drawerReminderTime.value = '';

            // Update UI
            renderTimeline(crmData[custIdx]);
            renderCRM();
            openCustomerDrawer(currentViewingCustomerId);
        });
    }

    // --- MANUAL CUSTOMER ADD & UPDATE MODAL ---
    function openCustomerModal(id = null) {
        if (!customerModal) return;
        customerModal.classList.remove('hidden');

        if (id) {
            // Edit Mode
            const cust = crmData.find(x => x.id === id);
            if (cust) {
                document.getElementById('custModalTitle').innerText = "Edit Detail Customer";
                document.getElementById('custIndex').value = cust.id;
                document.getElementById('custName').value = cust.name;
                document.getElementById('custPhone').value = cust.phone;
                document.getElementById('custTags').value = cust.tags;
                document.getElementById('custTransactions').value = cust.transactions;
                document.getElementById('custSource').value = cust.source;
            }
        } else {
            // Tambah Baru
            document.getElementById('custModalTitle').innerText = "Tambah Customer Baru";
            customerForm.reset();
            document.getElementById('custIndex').value = '';
        }
    }

    function closeCustomerModal() {
        if (customerModal) {
            customerModal.classList.add('hidden');
            waValidationWarning.classList.add('hidden');
        }
    }

    if (btnAddCustomer) btnAddCustomer.addEventListener('click', () => openCustomerModal());
    if (btnCloseCustModal) btnCloseCustModal.addEventListener('click', closeCustomerModal);
    if (custModalBackdrop) custModalBackdrop.addEventListener('click', closeCustomerModal);

    // Realtime WhatsApp Number Validator
    const custPhone = document.getElementById('custPhone');
    if (custPhone) {
        custPhone.addEventListener('input', () => {
            const raw = custPhone.value.trim();
            // Aturan validasi (Harus mengandung angka saja, panjang 9-14 karakter)
            const isValid = /^[0-9]{9,15}$/.test(raw) && (raw.startsWith('08') || raw.startsWith('628'));
            if (!isValid && raw.length > 0) {
                waValidationWarning.classList.remove('hidden');
            } else {
                waValidationWarning.classList.add('hidden');
            }
        });
    }

    // Form Submit (Simpan / Update)
    if (customerForm) {
        customerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('custIndex').value;
            const name = document.getElementById('custName').value.trim();
            const phone = document.getElementById('custPhone').value.trim();
            const tags = document.getElementById('custTags').value.trim();
            const transactions = parseInt(document.getElementById('custTransactions').value) || 0;
            const source = document.getElementById('custSource').value.trim() || 'Manual Input';

            // Deteksi Duplikat Nomor (Kecuali sedang mengedit kontak tersebut)
            const isDuplicate = crmData.some(x => x.phone === phone && x.id !== id);
            if (isDuplicate) {
                const confirmMerge = await Swal.fire({
                    title: 'Nomor Sudah Terdaftar!',
                    text: 'Apakah Anda ingin menggabungkan total transaksi ke kontak yang sudah ada?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#18181b',
                    confirmButtonText: 'Ya, Gabungkan'
                });

                if (confirmMerge.isConfirmed) {
                    const targetIdx = crmData.findIndex(x => x.phone === phone);
                    crmData[targetIdx].transactions += transactions;
                    crmData[targetIdx].tags += `, ${tags}`;
                    crmData[targetIdx].score = Math.min(crmData[targetIdx].score + 15, 100);
                    localStorage.setItem('saved_crm_data', JSON.stringify(crmData));
                    renderCRM();
                    closeCustomerModal();
                    Swal.fire('Data Digabungkan!', 'Transaksi berhasil ditambahkan ke kontak yang ada.', 'success');
                }
                return;
            }

            if (id) {
                // Update
                crmData = crmData.map(c => c.id === id ? { id, name, phone, tags, transactions, source, lastActive: c.lastActive, score: c.score } : c);
            } else {
                // Tambah baru
                const newId = 'cust-' + Date.now();
                crmData.push({
                    id: newId,
                    name,
                    phone,
                    tags,
                    transactions,
                    source,
                    lastActive: new Date().toISOString().split('T')[0],
                    score: 40 // Default Score Poin hangat
                });
            }

            localStorage.setItem('saved_crm_data', JSON.stringify(crmData));
            renderCRM();
            closeCustomerModal();

            Swal.fire({
                icon: 'success',
                title: id ? 'Data Customer Diupdate!' : 'Customer Ditambahkan!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        });
    }

    // Jalankan sistem CRM
    renderCRM();

    // --- CORE LOGIKA TEMPLATE SINKRONISASI DAN ANTI BAN TETAP DISATUKAN DI SINI ---
    // --- (Semua kode dari sub-modul WA Blast Anti-ban sebelumnya tetap aman berjalan di sini) ---
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

    // --- UTILS HELPER ---
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

}); // Penutup DOMContentLoaded
