// --- 6. PENGATURAN TOKEN & TEST KONEKSI FONNTE ---
    const tokenInput = document.getElementById('fonnteTokenInput');
    const btnSaveFonnte = document.getElementById('btnSaveFonnte');

    // Load token dari LocalStorage saat web pertama kali dibuka
    if (localStorage.getItem('saved_fonnte_token')) {
        if(tokenInput) tokenInput.value = localStorage.getItem('saved_fonnte_token');
    }

    if (btnSaveFonnte) {
        btnSaveFonnte.addEventListener('click', async () => {
            const token = tokenInput.value.trim();
            if (!token) {
                Swal.fire('Oops!', 'Token API tidak boleh kosong', 'warning');
                return;
            }

            // Animasi Loading
            btnSaveFonnte.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Menghubungkan...';
            btnSaveFonnte.disabled = true;

            try {
                // Request ke API Fonnte untuk mengecek Device
                const response = await fetch("https://api.fonnte.com/device", {
                    method: 'POST',
                    headers: { 'Authorization': token }
                });
                const result = await response.json();

                if (result.status) {
                    // Simpan token ke LocalStorage jika sukses terhubung
                    localStorage.setItem('saved_fonnte_token', token);
                    Swal.fire({
                        icon: 'success',
                        title: 'Terkoneksi!',
                        text: `Device WA Anda terhubung: ${result.name} (${result.device})`,
                        confirmButtonColor: '#18181b',
                        background: html.classList.contains('dark') ? '#18181b' : '#fff',
                        color: html.classList.contains('dark') ? '#fff' : '#000'
                    });
                } else {
                    Swal.fire('Gagal', result.reason || 'Token tidak valid / Device Offline', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Gagal menghubungi server Fonnte', 'error');
            } finally {
                // Kembalikan tombol ke semula
                btnSaveFonnte.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Simpan & Test Koneksi';
                btnSaveFonnte.disabled = false;
            }
        });
    }

    // --- 7. KIRIM WA BLAST DINAMIS ---
    const btnSendBlast = document.getElementById('btnSendBlast');
    
    if (btnSendBlast) {
        btnSendBlast.addEventListener('click', async () => {
            const targetNumbers = document.getElementById('targetNumbers').value.trim();
            const blastMessage = document.getElementById('blastMessage').value.trim();
            const savedToken = localStorage.getItem('saved_fonnte_token'); // Ambil token yg disimpan

            // Validasi Input
            if (!savedToken) {
                Swal.fire('Akses Ditolak', 'Silakan masukkan Token Fonnte di menu Pengaturan terlebih dahulu.', 'warning');
                return;
            }
            if (!targetNumbers || !blastMessage) {
                Swal.fire('Perhatian', 'Nomor Target dan Isi Pesan wajib diisi!', 'warning');
                return;
            }

            // Animasi Loading Tombol Kirim
            btnSendBlast.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Mengirim...';
            btnSendBlast.disabled = true;

            // Siapkan payload/data untuk dikirim ke Fonnte
            const rawData = {
                target: targetNumbers,
                message: blastMessage,
                delay: '2', 
            };

            const formData = new URLSearchParams();
            for (const key in rawData) formData.append(key, rawData[key]);

            try {
                // Eksekusi pengiriman pesan sungguhan ke Fonnte
                const response = await fetch("https://api.fonnte.com/send", {
                    method: 'POST',
                    headers: { 'Authorization': savedToken },
                    body: formData
                });
                const result = await response.json();

                if (result.status) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Blast Berhasil!',
                        text: 'Pesan sudah masuk antrean pengiriman server Fonnte.',
                        confirmButtonColor: '#18181b',
                        background: html.classList.contains('dark') ? '#18181b' : '#fff',
                        color: html.classList.contains('dark') ? '#fff' : '#000'
                    });
                    
                    // Bersihkan form setelah sukses (opsional)
                    // document.getElementById('targetNumbers').value = ''; 
                    document.getElementById('blastMessage').value = '';
                } else {
                    Swal.fire('Gagal Mengirim', result.reason || 'Terjadi kesalahan pada Fonnte', 'error');
                }

            } catch (error) {
                Swal.fire('Error', 'Gagal memproses permintaan', 'error');
            } finally {
                btnSendBlast.innerHTML = '<i class="ph ph-paper-plane-right"></i> Kirim Sekarang';
                btnSendBlast.disabled = false;
            }
        });
    }