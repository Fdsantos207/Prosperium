/* PROSPERIUM - ENGINE (V.2.2)
   Focus: Branding Correction & PWA Installation
*/

// ... (Mantenha as funções renderChart, renderGoals e closeAllModals iguais)

const carregarDadosSalvos = () => {
    // Atualizado para buscar do novo namespace do app
    const nomeSalvo = localStorage.getItem('prosperium_nome');
    const saldoSalvo = localStorage.getItem('prosperium_saldo');
    
    if (nomeSalvo) {
        document.querySelector('.user-name').innerText = nomeSalvo;
        document.querySelector('.user-profile-side h3').innerText = nomeSalvo;
    }
    if (saldoSalvo) document.getElementById('main-balance').innerText = saldoSalvo;
};

// ... (Mantenha a lógica de atualizarSaldoInterface usando as chaves 'prosperium_saldo')

document.addEventListener('DOMContentLoaded', () => {
    carregarDadosSalvos();
    renderChart();
    renderGoals();

    // --- LÓGICA DE INSTALAÇÃO PROSPERIUM ---
    let deferredPrompt;
    const installBtn = document.getElementById('installBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.style.display = 'block';
    });

    if (installBtn) {
        installBtn.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') installBtn.style.display = 'none';
                deferredPrompt = null;
            }
        };
    }

    // --- LOGICA DE VOZ ATUALIZADA ---
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.onclick = () => {
            const SDK = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SDK) return;
            const rec = new SDK();
            rec.lang = 'pt-BR';
            rec.onstart = () => { voiceBtn.style.background = '#ff4d4d'; voiceBtn.innerHTML = '...'; };
            rec.onresult = (e) => {
                const text = e.results[0][0].transcript.toLowerCase();
                voiceBtn.style.background = '#00ff88';
                voiceBtn.innerHTML = '🎙️';
                
                // Inteligência Prosperium
                if (text.includes('ganhei')) openEntryModal('ganho');
                else if (text.includes('vale') || text.includes('adiantamento')) openEntryModal('adiantamento');
                else openEntryModal('despesa');
            };
            rec.start();
        };
    }

    // ... (Mantenha os outros handlers de salvar e fechar modais)
});