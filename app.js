console.log("Sistem CRM Premium & WA Blast Engine v3.1 aktif...");

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

// Fungsi Proteksi Sesi Login
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

    // ----------------------------------------------------------------------
    // [A] DEKLARASI EXPLICIT SEMUA ELEMENT DOM DI ATAS (MENCEGAH REFERENCE ERROR) [1]
    // ----------------------------------------------------------------------
    
    // UI Global & Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('pageTitle');
    const darkToggle = document.getElementById('darkModeToggle');
    const logoutBtn = document.getElementById('logoutBtn');

    // CRM / Contacts Page
    const crmTableBody = document.getElementById('crmTableBody');
    const crmEmptyState = document.getElementById('crmEmptyState');
    const crmTableContainer = document.getElementById('crmTableContainer');
    const crmSearch = document.getElementById('crmSearch');
    const stickyBulkToolbar = document.getElementById('stickyBulkToolbar');
    const txtBulkSelectedCount = document.getElementById('txtBulkSelectedCount');
    const chkSelectAllCRM = document.getElementById('chkSelectAllCRM');

    // Customer Modal
    const customerModal = document.getElementById('customerModal');
    const customerForm = document.getElementById('customerForm');
    const btnAddCustomer = document.getElementById('btnAddCustomer');
    const btnCloseCustModal = document.getElementById('btnCloseCustModal');
    const custModalBackdrop = document.getElementById('custModalBackdrop');
    const waValidationWarning = document.getElementById('waValidationWarning');

    // Customer Detail Drawer
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

    // CRM Badges & Analytics
    const badgeSegAll = document.getElementById('badgeSegAll');
    const badgeSegVip = document.getElementById('badgeSegVip');
    const badgeSegHot = document.getElementById('badgeSegHot');
    const badgeSegDormant = document.getElementById('badgeSegDormant');
    const crmStatTotal = document.getElementById('crmStatTotal');
    const crmStatActive = document.getElementById('crmStatActive');
    const crmStatHot = document.getElementById('crmStatHot');
    const crmStatDormant = document.getElementById('crmStatDormant');
    const crmStatLTV = document.getElementById('crmStatLTV');
    const homeTotalContacts = document.getElementById('homeTotalContacts');

    // Message Templates Page [2]
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

    // WA Blast Page & Anti-Ban Config [1]
    const targetNumbersInput = document.getElementById('targetNumbers');
    const targetCounter = document.getElementById('targetCounter');
    const variationContainer = document.getElementById('variationInputsContainer');
    const btnAddNewVariation = document.getElementById('btnAddNewVariation');
    const spamWarningBox = document.getElementById('spamWarningBox');
    
    const presetSafe = document.getElementById('btnPresetSafe');
    const presetNormal = document.getElementById('btnPresetNormal');
    const presetFast = document.getElementById('btnPresetFast');

    const minDelayInput = document.getElementById('minDelay');
    const maxDelayInput = document.getElementById('maxDelay');
    const batchSizeInput = document.getElementById('batchSize');
    const batchPauseInput = document.getElementById('batchPause');
    const presetDesc = document.getElementById('presetDescription');

    const btnLimitNewNum = document.getElementById('btnLimitNewNum');
    const btnLimitActiveNum = document.getElementById('btnLimitActiveNum');
    const txtDailyLimitRec = document.getElementById('txtDailyLimitRec');

    const deviceHealthWidget = document.getElementById('deviceHealthWidget');
    const deviceHealthIcon = document.getElementById('deviceHealthIcon');
    const deviceHealthTitle = document.getElementById('deviceHealthTitle');
    const deviceHealthDesc = document.getElementById('deviceHealthDesc');
    const deviceHealthPing = document.getElementById('deviceHealthPing');
    const homeSpamRiskBadge = document.getElementById('homeSpamRiskBadge');

    // Queue System & Campaign
    const btnSendBlastPremium = document.getElementById('btnSendBlast');
    const liveQueueBox = document.getElementById('liveQueueBox');
    const queueSimulationText = document.getElementById('queueSimulationText');
    const queueProgressBadge = document.getElementById('queueProgressBadge');
    const queueProgressBar = document.getElementById('queueProgressBar');
    
    const statSuccessCount = document.getElementById('statSuccessCount');
    const statFailedCount = document.getElementById('statFailedCount');
    const statEstTime = document.getElementById('statEstTime');
    const statAvgDelay = document.getElementById('statAvgDelay');

    // History & Settings Page [1]
    const historyTableBody = document.getElementById('historyTableBody');
    const homeBlastTerkirim = document.getElementById('homeBlastTerkirim');
    const tokenInput = document.getElementById('fonnteTokenInput');
    const btnSaveFonnte = document.getElementById('btnSaveFonnte');

    // ----------------------------------------------------------------------
    // [B] VARIABEL DEKLARASI DATA & KAMUS KONFIGURASI
    // ----------------------------------------------------------------------
    
    const titles = {
        'home': 'Dashboard',
        'contacts': 'CRM Customer Management',
        'templates': 'Template Pesan',
        'blast': 'Anti-Ban WA Blast Panel',
        'history': 'Riwayat Blast',
        'settings': 'Pengaturan Sistem'
    };

    const spamKeywords = ['GRATIS!!!', 'CUAN BESAR', 'KLIK SEKARANG', 'SLOT', 'PINJOL', 'PROMO GILA', 'MENANG BANYAK'];
    const greetings = ["Halo kak 👋", "Hai kak 😊", "Selamat pagi kak ☀️", "Selamat siang kak 👋", "Selamat sore kak ☕", "Sore kak 😊", "Hallo kak ✨"];
    const randomEmojis = ["👋", "😊", "✨", "🔥", "👍", "☀️", "🙏", "⚡", "🚀"];

    const defaultCustomers = [
        { id: "17b354ca-fa2e-40dc-bc76-d183df592651", name: "Sarah Connor", phone: "6281234567890", tags: "VIP Customer, Hot Lead", transactions: 9500000, source: "Instagram", last_active: "2026-05-20", score: 85 },
        { id: "e6f4773c-ba32-47ef-bc90-9988ff77ea10", name: "John Doe", phone: "6281987654321", tags: "Warm Lead", transactions: 1200000, source: "Website Direct", last_active: "2026-05-15", score: 45 },
        { id: "28cfa100-332e-4cf4-90aa-bd88aa33ba21", name: "T-800 Terminator", phone: "6285611223344", tags: "Dormant Customer, Cold Lead", transactions: 0, source: "Referral", last_active: "2026-04-01", score: 10 }
    ];

    const defaultTemplates = [
        { id: "tpl-1", title: "Promo Akhir Bulan", category: "Promo", content: "Halo kak 👋 Ada promo terbaru hari ini.\n\nDapatkan diskon gila-gilaan akhir bulan up to 50% khusus produk terlaris kami!\n\nKlik link berikut untuk order: s.id/order-promo" },
        { id: "tpl-2", title: "Reminder Tagihan", category: "Tagihan", content: "Hai kak 😊 Mau info promo spesial hari ini?\n\nKami ingin mengingatkan bahwa tagihan Anda bulan ini akan jatuh tempo dalam 3 hari lagi.\n\nSilakan abaikan pesan ini jika Anda sudah melakukan pembayaran." }
    ];

    let crmData = JSON.parse(localStorage.getItem('saved_crm_data')) || defaultCustomers;
    let templates = JSON.parse(localStorage.getItem('saved_templates')) || defaultTemplates;
    let localHistory = JSON.parse(localStorage.getItem('saved_blast_history')) || [
        { date: "2026-05-23 14:30", total: 150, success: 148, failed: 2, delay: "30s - 60s", status: "Success" }
    ];

    let activeSegment = "all";
    let selectedCRMIds = [];
    let currentViewingCustomerId = null;
    let cancelCampaign = false;
    let searchTimeout;

    // ----------------------------------------------------------------------
    // [C] FUNGSI-FUNGSI UTAMA (HOISTING-SAFE: DITULIS SEBELUM DIGUNAKAN) [1]
    // ----------------------------------------------------------------------
    
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    function openCustomerModal(id = null) {
        if (!customerModal) return;
        customerModal.classList.remove('hidden');

        if (id) {
            const cust = crmData.find(x => x.id === id);
            if (cust) {
                document.getElementById('custModalTitle').innerText = "Edit Detail Customer";
                document.getElementById('custIndex').value = cust.id;
                document.getElementById('custName').value = cust.name;
                document.getElementById('custPhone').value = cust.phone;
                document.getElementById('custTags').value = cust.tags;
                document.getElementById('custTransactions').value = cust.transactions;
                document.getElementById('custSource').value = cust.source || 'Manual';
            }
        } else {
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

    async function syncContactsFromSupabase() {
        if (!supabaseClient) {
            renderCRM();
            return;
        }

        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                renderCRM();
                return;
            }

            const { data, error } = await supabaseClient
                .from('contacts') 
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                crmData = data;
                localStorage.setItem('saved_crm_data', JSON.stringify(crmData));
            }
        } catch (err) {
            console.warn("Gagal fetch dari Supabase, memuat cadangan lokal:", err);
        } finally {
            renderCRM();
        }
    }

    function renderCRM() {
        if (!crmTableBody || !crmEmptyState || !crmTableContainer) return;

        let filtered = crmData;
        if (activeSegment === 'vip') {
            filtered = crmData.filter(c => c.transactions > 5000000);
        } else if (activeSegment === 'hot') {
            filtered = crmData.filter(c => c.score >= 70);
        } else if (activeSegment === 'dormant') {
            filtered = crmData.filter(c => {
                const diffTime = Math.abs(new Date() - new Date(c.last_active || c.lastActive));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 30;
            });
        }

        const searchVal = crmSearch.value.trim().toLowerCase();
        if (searchVal) {
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(searchVal) || 
                c.phone.includes(searchVal) || 
                c.tags.toLowerCase().includes(searchVal) || 
                c.source.toLowerCase().includes(searchVal)
            );
        }

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
            
            let autoTags = (cust.tags || '').split(',').map(t => t.trim()).filter(t => t.length > 0);
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
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-lg ${scoreColor}">${cust.score || 40} Poin</span>
                </td>
                <td class="px-6 py-4 col-ltv font-medium text-indigo-500">${formatRupiah(cust.transactions || 0)}</td>
                <td class="px-6 py-4 col-source text-zinc-500 text-xs">${cust.source || 'Manual'}</td>
                <td class="px-6 py-4 col-activity text-zinc-500 text-xs">${cust.last_active || cust.lastActive || 'Hari Ini'}</td>
                <td class="px-6 py-4 text-right" onclick="event.stopPropagation()">
                    <div class="flex items-center justify-end gap-2">
                        <button class="btn-quick-wa text-zinc-400 hover:text-emerald-500 transition-colors text-lg" data-phone="${cust.phone}"><i class="ph ph-whatsapp-logo"></i></button>
                        <button class="btn-edit-cust text-zinc-400 hover:text-indigo-500 transition-colors text-lg" data-id="${cust.id}"><i class="ph ph-pencil-simple"></i></button>
                        <button class="btn-delete-cust text-zinc-400 hover:text-rose-500 transition-colors text-lg" data-id="${cust.id}"><i class="ph ph-trash"></i></button>
                    </div>
                </td>
            `;

            tr.addEventListener('click', () => {
                openCustomerDrawer(cust.id);
            });

            crmTableBody.appendChild(tr);
        });

        // Event listener row actions
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

        document.querySelectorAll('.btn-quick-wa').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const phone = e.currentTarget.getAttribute('data-phone');
                window.open(`https://wa.me/${phone}`, '_blank');
            });
        });

        document.querySelectorAll('.btn-edit-cust').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                openCustomerModal(id);
            });
        });

        document.querySelectorAll('.btn-delete-cust').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const result = await Swal.fire({
                    title: 'Hapus customer?',
                    text: 'Seluruh riwayat catatan dan timeline akan terhapus.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33'
                });

                if (result.isConfirmed) {
                    try {
                        if (supabaseClient) {
                            await supabaseClient.from('contacts').delete().eq('id', id);
                        }
                    } catch (e) { console.error(e); }

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

    function updateCRMAnalytics() {
        if (!crmStatTotal) return;

        const total = crmData.length;
        const active = crmData.filter(c => (c.score || 40) >= 50).length;
        const hot = crmData.filter(c => (c.score || 40) >= 70).length;
        
        const dormant = crmData.filter(c => {
            const diffTime = Math.abs(new Date() - new Date(c.last_active || c.lastActive));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 30;
        }).length;

        const totalLtv = crmData.reduce((acc, curr) => acc + (parseInt(curr.transactions) || 0), 0);

        crmStatTotal.textContent = total;
        crmStatActive.textContent = active;
        crmStatHot.textContent = hot;
        crmStatDormant.textContent = dormant;
        crmStatLTV.textContent = formatRupiah(totalLtv);

        if (homeTotalContacts) homeTotalContacts.textContent = total;

        if (badgeSegAll) badgeSegAll.textContent = total;
        if (badgeSegVip) badgeSegVip.textContent = crmData.filter(c => c.transactions > 5000000).length;
        if (badgeSegHot) badgeSegHot.textContent = hot;
        if (badgeSegDormant) badgeSegDormant.textContent = dormant;
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

    async function openCustomerDrawer(id) {
        if (!customerDrawer) return;
        currentViewingCustomerId = id;

        const cust = crmData.find(x => x.id === id);
        if (!cust) return;

        drawerAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name)}&background=random`;
        drawerName.textContent = cust.name;
        drawerPhone.textContent = cust.phone;
        drawerLTV.textContent = formatRupiah(cust.transactions || 0);
        drawerScore.textContent = `${cust.score || 40} Poin`;

        if ((cust.score || 40) >= 70) {
            drawerScoreBadge.textContent = "Hot Lead";
            drawerScoreBadge.className = "text-[9px] font-semibold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded";
        } else if ((cust.score || 40) >= 40) {
            drawerScoreBadge.textContent = "Warm Lead";
            drawerScoreBadge.className = "text-[9px] font-semibold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded";
        } else {
            drawerScoreBadge.textContent = "Cold Lead";
            drawerScoreBadge.className = "text-[9px] font-semibold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded";
        }

        await renderTimeline(cust);
        customerDrawer.classList.remove('translate-x-full');
    }

    function closeCustomerDrawer() {
        if (customerDrawer) customerDrawer.classList.add('translate-x-full');
        currentViewingCustomerId = null;
    }

    async function renderTimeline(cust) {
        if (!drawerTimeline) return;
        drawerTimeline.innerHTML = '';

        let savedNotes = [];

        if (supabaseClient) {
            try {
                const { data } = await supabaseClient
                    .from('customer_notes')
                    .select('*')
                    .eq('contact_id', cust.id)
                    .order('created_at', { ascending: false });
                if (data) {
                    savedNotes = data.map(x => ({ date: x.created_at.split('T')[0], content: x.content }));
                }
            } catch (err) { console.error(err); }
        }

        if (savedNotes.length === 0) {
            const notesKey = `notes_${cust.id}`;
            savedNotes = JSON.parse(localStorage.getItem(notesKey)) || [
                { date: cust.last_active || '2026-05-24', content: `Customer berhasil ditambahkan ke sistem.` }
            ];
        }

        savedNotes.forEach(note => {
            const div = document.createElement('div');
            div.className = "relative pl-1";
            div.innerHTML = `
                <div class="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-white shrink-0"></div>
                <div class="space-y-1">
                    <span class="text-[10px] text-zinc-400 font-semibold block leading-none">${note.date}</span>
                    <p class="text-xs text-zinc-700 dark:text-zinc-300 font-medium">${note.content}</p>
                </div>
            `;
            drawerTimeline.appendChild(div);
        });
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
                openTemplateModal(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const result = await Swal.fire({
                    title: 'Hapus template?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33'
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

    function openTemplateModal(id = null) {
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

    function closeTemplateModal() {
        if (templateModal) templateModal.classList.add('hidden');
    }

    function addVariationInput(initialContent = '') {
        if (!variationContainer) return;
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

        const textarea = div.querySelector('.tpl-rotation-input');
        textarea.addEventListener('input', () => {
            scanForSpamContent();
        });

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
        if (!variationContainer) return;
        Array.from(variationContainer.children).forEach((child, index) => {
            child.querySelector('span').textContent = `Variasi Template #${index + 1}`;
        });
    }

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
            if (spamWarningBox) spamWarningBox.classList.remove('hidden');
            updateDeviceHealth('warning');
        } else {
            if (spamWarningBox) spamWarningBox.classList.add('hidden');
            updateDeviceHealth('safe');
        }
    }

    function selectPreset(mode) {
        if (!presetSafe) return;
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
            presetDesc.textContent = "Mode Safe: Delay panjang (30-60 detik) dengan jeda batch ketat. Sangat direkomendasikan.";
            updateDeviceHealth('safe');
        } else if (mode === 'Normal') {
            minDelayInput.value = 15;
            maxDelayInput.value = 30;
            batchSizeInput.value = 30;
            batchPauseInput.value = 2;
            presetDesc.textContent = "Mode Normal: Kecepatan pengiriman sedang (15-30 detik). Sesuai untuk nomor yang sudah hangat.";
            updateDeviceHealth('normal');
        } else if (mode === 'Fast') {
            minDelayInput.value = 5;
            maxDelayInput.value = 15;
            batchSizeInput.value = 50;
            batchPauseInput.value = 1;
            presetDesc.textContent = "Mode Fast: Pengiriman cepat (5-15 detik). Memiliki risiko ban sangat tinggi.";
            updateDeviceHealth('high_risk');
        }
    }

    async function syncHistoryFromSupabase() {
        if (!supabaseClient || !historyTableBody) {
            renderHistory();
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from('blast_history')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                localHistory = data.map(x => ({
                    date: x.created_at.replace('T', ' ').substr(0, 16),
                    total: x.total_recipients,
                    success: x.success_count,
                    failed: x.failed_count,
                    delay: "Random Delay",
                    status: x.status
                }));
                localStorage.setItem('saved_blast_history', JSON.stringify(localHistory));
            }
        } catch (e) {
            console.warn("Gagal sync history Supabase:", e);
        } finally {
            renderHistory();
        }
    }

    function renderHistory() {
        if (!historyTableBody) return;
        historyTableBody.innerHTML = '';

        let totalTerkirimAll = 0;

        localHistory.forEach(h => {
            totalTerkirimAll += h.success;
            const badgeColor = h.status === 'Success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4">${h.date}</td>
                <td class="px-6 py-4 font-semibold">${h.total}</td>
                <td class="px-6 py-4 text-emerald-500 font-semibold">${h.success}</td>
                <td class="px-6 py-4 text-rose-500 font-semibold">${h.failed}</td>
                <td class="px-6 py-4 text-zinc-500">${h.delay}</td>
                <td class="px-6 py-4 text-right">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-lg ${badgeColor}">${h.status}</span>
                </td>
            `;
            historyTableBody.appendChild(tr);
        });

        if (homeBlastTerkirim) homeBlastTerkirim.textContent = totalTerkirimAll;
    }

    // ----------------------------------------------------------------------
    // [D] INTERACTIVE EVENT LISTENERS & LOGIC (DIPASANG PALING BAWAH) [1]
    // ----------------------------------------------------------------------

    // Navigasi SPA Tab Click
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

    // CRM Search Debounce
    if (crmSearch) {
        crmSearch.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                renderCRM();
            }, 300);
        });
    }

    // CRM Saved Segments
    const segmentButtons = document.querySelectorAll('#savedSegmentsList button');
    segmentButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            segmentButtons.forEach(b => b.className = "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50 flex justify-between items-center");
            btn.className = "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex justify-between items-center";
            
            activeSegment = btn.getAttribute('data-segment');
            renderCRM();
        });
    });

    // CRM Checkbox Select All
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

    // Bulk Delete
    if (btnBulkDelete) {
        btnBulkDelete.addEventListener('click', async () => {
            const result = await Swal.fire({
                title: `Hapus ${selectedCRMIds.length} kontak terpilih?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33'
            });

            if (result.isConfirmed) {
                try {
                    if (supabaseClient) {
                        await supabaseClient.from('contacts').delete().in('id', selectedCRMIds);
                    }
                } catch (e) { console.error(e); }

                crmData = crmData.filter(c => !selectedCRMIds.includes(c.id));
                localStorage.setItem('saved_crm_data', JSON.stringify(crmData));
                selectedCRMIds = [];
                renderCRM();
                updateBulkToolbar();
                Swal.fire('Terhapus', 'Kontak terpilih berhasil dihapus.', 'success');
            }
        });
    }

    // Bulk WA Blast
    if (btnBulkBlast) {
        btnBulkBlast.addEventListener('click', () => {
            const targetList = crmData.filter(c => selectedCRMIds.includes(c.id)).map(c => c.phone).join(', ');
            
            document.querySelector('[data-target="blast"]').click();
            document.getElementById('targetNumbers').value = targetList;
            document.getElementById('targetNumbers').dispatchEvent(new Event('input'));

            selectedCRMIds = [];
            updateBulkToolbar();
            renderCRM();
        });
    }

    // Pro Export Excel
    if (btnExportMenu) {
        btnExportMenu.addEventListener('click', () => {
            const ws = XLSX.utils.json_to_sheet(crmData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "CRM Customers");
            XLSX.writeFile(wb, "SaaS_CRM_Export.xlsx");
            Swal.fire('Sukses Export', 'Data berhasil diexport ke file Excel.', 'success');
        });
    }

    // Save CRM Notes & Reminders
    if (btnSaveDrawerNote) {
        btnSaveDrawerNote.addEventListener('click', async () => {
            const noteText = drawerNoteInput.value.trim();
            const reminderTime = drawerReminderTime.value;

            if (!currentViewingCustomerId) return;

            const custIdx = crmData.findIndex(x => x.id === currentViewingCustomerId);
            if (custIdx === -1) return;

            crmData[custIdx].score = Math.min((crmData[custIdx].score || 40) + 10, 100);

            let userId = null;
            if (supabaseClient) {
                const { data: { session } } = await supabaseClient.auth.getSession();
                if (session) userId = session.user.id;

                if (noteText) {
                    await supabaseClient.from('customer_notes').insert([{
                        contact_id: currentViewingCustomerId,
                        user_id: userId,
                        content: noteText
                    }]);
                }

                if (reminderTime) {
                    await supabaseClient.from('follow_up_reminders').insert([{
                        contact_id: currentViewingCustomerId,
                        user_id: userId,
                        reminder_time: reminderTime
                    }]);
                }

                await supabaseClient.from('contacts').update({ score: crmData[custIdx].score }).eq('id', currentViewingCustomerId);
            }

            const notesKey = `notes_${currentViewingCustomerId}`;
            const savedNotes = JSON.parse(localStorage.getItem(notesKey)) || [
                { date: crmData[custIdx].last_active || '2026-05-24', content: `Customer berhasil ditambahkan ke sistem.` }
            ];

            const today = new Date().toISOString().split('T')[0];
            if (noteText) savedNotes.unshift({ date: today, content: noteText });
            if (reminderTime) {
                savedNotes.unshift({ date: today, content: `🔔 Reminder Follow-Up diset: ${reminderTime.replace('T', ' ')}` });
                Swal.fire('Reminder Jadwal!', 'Jadwal pengingat berhasil dibuat.', 'success');
            }

            localStorage.setItem(notesKey, JSON.stringify(savedNotes));
            localStorage.setItem('saved_crm_data', JSON.stringify(crmData));

            drawerNoteInput.value = '';
            drawerReminderTime.value = '';

            await renderTimeline(crmData[custIdx]);
            renderCRM();
            openCustomerDrawer(currentViewingCustomerId);
        });
    }

    // Modal Add Manual Customer Trigger
    if (btnAddCustomer) btnAddCustomer.addEventListener('click', () => openCustomerModal());
    if (btnCloseCustModal) btnCloseCustModal.addEventListener('click', closeCustomerModal);
    if (custModalBackdrop) custModalBackdrop.addEventListener('click', closeCustomerModal);

    // Save/Update Customer Form Submit
    if (customerForm) {
        customerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('custIndex').value;
            const name = document.getElementById('custName').value.trim();
            const phone = document.getElementById('custPhone').value.trim();
            const tags = document.getElementById('custTags').value.trim();
            const transactions = parseInt(document.getElementById('custTransactions').value) || 0;
            const source = document.getElementById('custSource').value.trim() || 'Manual';

            let userId = null;
            if (supabaseClient) {
                const { data: { session } } = await supabaseClient.auth.getSession();
                if (session) userId = session.user.id;
            }

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
                    crmData[targetIdx].score = Math.min((crmData[targetIdx].score || 40) + 15, 100);
                    
                    if (supabaseClient) {
                        await supabaseClient.from('contacts').update({
                            transactions: crmData[targetIdx].transactions,
                            tags: crmData[targetIdx].tags,
                            score: crmData[targetIdx].score
                        }).eq('id', crmData[targetIdx].id);
                    }

                    localStorage.setItem('saved_crm_data', JSON.stringify(crmData));
                    renderCRM();
                    closeCustomerModal();
                    Swal.fire('Data Digabungkan!', 'Transaksi berhasil digabungkan.', 'success');
                }
                return;
            }

            if (id) {
                if (supabaseClient) {
                    await supabaseClient.from('contacts').update({ name, phone, tags, transactions, source }).eq('id', id);
                }
                crmData = crmData.map(c => c.id === id ? { id, name, phone, tags, transactions, source, last_active: c.last_active, score: c.score } : c);
            } else {
                const newContact = {
                    name,
                    phone,
                    tags,
                    transactions,
                    source,
                    score: 40,
                    last_active: new Date().toISOString().split('T')[0],
                    user_id: userId
                };

                if (supabaseClient) {
                    const { data, error } = await supabaseClient.from('contacts').insert([newContact]).select();
                    if (data && data[0]) {
                        crmData.push(data[0]);
                    } else if (error) {
                        console.error("Gagal simpan ke Supabase contacts:", error);
                    }
                } else {
                    const newId = 'cust-' + Date.now();
                    crmData.push({ ...newContact, id: newId });
                }
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

    // Modal Template Pesan Triggers [2]
    if (btnOpenTemplateModal) btnOpenTemplateModal.addEventListener('click', () => openTemplateModal());
    if (btnCloseTemplateModal) btnCloseTemplateModal.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    // Save/Update Template Form Submit
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

    // Fonnte API Key Save Settings
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

    // Inisialisasi awal sinkronisasi data Supabase & Local
    syncContactsFromSupabase();
    renderTemplates();
    populateBlastDropdown();
    syncHistoryFromSupabase();
});
