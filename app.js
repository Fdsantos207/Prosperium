/* PROSPERIUM - ENGINE (V.2.5)
   Branding: Prosperium Elite
   Features: PWA Install, Voice AI, Gain/Expense/Advance Management
*/

// 1. ESTADO GLOBAL E DADOS INICIAIS
let selectedCategory = 'Lazer';
let deferredPrompt; // Para a instalação PWA

const gastos = [
    { label: 'Seg', val: 40, color: '#333' },
    { label: 'Ter', val: 65, color: '#333' },
    { label: 'Qua', val: 90, color: '#00ff88' },
    { label: 'Qui', val: 55, color: '#333' },
    { label: 'Sex', val: 80, color: '#333' }
];

const metas = [
    { nome: 'Reserva de Emergência', atual: 15000, total: 20000, color: '#00ff88' }
];

// 2. FUNÇÕES DE RENDERIZAÇÃO
const renderChart = () => {
    const chart = document.getElementById('chart');
    if (!chart) return;
    chart.innerHTML = gastos.map(g => `
        <div class="bar-group">
            <div class="bar" style="height: ${g.val}%; background: ${g.color}"></div>
            <span class="bar-label">${g.label}</span>
        </div>
    `).join('');
};

const renderGoals = () => {
    const container = document.getElementById('goals');
    if (!container) return;
    container.innerHTML = metas.map(m => {
        const perc = (m.atual / m.total) * 100;
        return `
            <div class="goal-card">
                <div style="display:flex; justify-content:space-between; font-weight:600; margin-bottom:5px;">
                    <span>${m.nome}</span><span>${perc.toFixed(0)}%</span>
                </div>
                <div class="progress-bg">
                    <div class="progress-fill" style="width: ${perc}%; background: ${m.color}"></div>
                </div>
            </div>
        `;
    }).join('');
};

// 3. LÓGICA DE MODAIS
const closeAllModals = () => {
    const modals = document.querySelectorAll('.modal-bottom');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay');
    const noteGroup = document.getElementById('noteGroup');
    
    modals.forEach(m => m.classList.remove('active'));
    if (sideMenu) sideMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (noteGroup) noteGroup.style.display = 'none';
    document.body.classList.remove('menu-open');
};

const openEntryModal = (type) => {
    closeAllModals();
    let modalId = '';
    if (type === 'ganho') modalId = 'incomeModal';
    else if (type === 'adiantamento') modalId = 'advanceModal';
    else if (type === 'config') modalId = 'configModal';
    else modalId = 'entryModal';

    const modal = document.getElementById(modalId);
    const overlay = document.querySelector('.menu-overlay');
    
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('menu-open');
    }
};

window.setCategory = (cat) => {
    selectedCategory = cat;
    const noteGroup = document.getElementById('noteGroup');
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-cat') === cat) btn.classList.add('active');
    });
    if (cat === 'Outros') {
        noteGroup.style.display = 'block';
        document.getElementById('inputNote').focus();
    } else {
        noteGroup.style.display = 'none';
        document.getElementById('inputNote').value = ''; 
    }
};

// 4. PERSISTÊNCIA E MATEMÁTICA
const atualizarSaldoInterface = (valor, operacao) => {
    const saldoEl = document.getElementById('main-balance');
    let saldoLimpo = parseFloat(saldoEl.innerText.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
    
    if (operacao === 'soma') saldoLimpo += valor;
    else saldoLimpo -= valor;

    const novoSaldoText = `R$ ${saldoLimpo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    saldoEl.innerText = novoSaldoText;
    localStorage.setItem('prosperium_saldo', novoSaldoText);
};

const carregarDadosSalvos = () => {
    const nomeSalvo = localStorage.getItem('prosperium_nome');
    const saldoSalvo = localStorage.getItem('prosperium_saldo');
    if (nomeSalvo) {
        document.querySelector('.user-name').innerText = nomeSalvo;
        document.querySelector('.user-profile-side h3').innerText = nomeSalvo;
    }
    if (saldoSalvo) document.getElementById('main-balance').innerText = saldoSalvo;
};

// 5. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosSalvos();
    renderChart();
    renderGoals();

    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    // --- LÓGICA DE INSTALAÇÃO PWA ---
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

    // Seletores
    const openMenu = document.getElementById('openMenu');
    const closeMenu = document.getElementById('closeMenu');
    const sideMenu = document.getElementById('sideMenu');
    const linkAddGain = document.getElementById('linkAddGain');
    const linkAddAdvance = document.getElementById('linkAddAdvance');
    const linkAddExpense = document.getElementById('linkAddExpense');
    const configLink = document.querySelectorAll('.nav-link')[4]; // Configurações

    overlay.onclick = closeAllModals;
    if (closeMenu) closeMenu.onclick = closeAllModals;
    document.querySelectorAll('.btn-cancel').forEach(btn => btn.onclick = closeAllModals);
    if (document.getElementById('closeModal')) document.getElementById('closeModal').onclick = closeAllModals;

    if (openMenu) openMenu.onclick = () => {
        sideMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('menu-open');
    };

    if (linkAddGain) linkAddGain.onclick = (e) => { e.preventDefault(); openEntryModal('ganho'); };
    if (linkAddAdvance) linkAddAdvance.onclick = (e) => { e.preventDefault(); openEntryModal('adiantamento'); };
    if (linkAddExpense) linkAddExpense.onclick = (e) => { e.preventDefault(); openEntryModal('despesa'); };
    if (configLink) configLink.onclick = (e) => { e.preventDefault(); openEntryModal('config'); };

    // Salvar Ações
    document.getElementById('saveIncome').onclick = () => {
        const val = parseFloat(document.getElementById('incomeValue').value);
        if (val > 0) { atualizarSaldoInterface(val, 'soma'); closeAllModals(); document.getElementById('incomeValue').value = ''; }
    };

    document.getElementById('saveAdvance').onclick = () => {
        const val = parseFloat(document.getElementById('advanceValue').value);
        if (val > 0) { atualizarSaldoInterface(val, 'soma'); closeAllModals(); document.getElementById('advanceValue').value = ''; }
    };

    document.getElementById('saveEntry').onclick = () => {
        const inputVal = document.getElementById('inputValue');
        const inputNote = document.getElementById('inputNote');
        const val = parseFloat(inputVal.value);
        if (!val || val <= 0) return alert("Valor inválido.");
        if (selectedCategory === 'Outros' && inputNote.value.trim() === "") return alert("Descreva o gasto.");
        atualizarSaldoInterface(val, 'subtrai');
        inputVal.value = ''; inputNote.value = ''; closeAllModals();
    };

    document.getElementById('saveConfig').onclick = () => {
        const nome = document.getElementById('configName').value;
        const saldo = document.getElementById('configBalance').value;
        if (nome) {
            document.querySelector('.user-name').innerText = nome;
            document.querySelector('.user-profile-side h3').innerText = nome;
            localStorage.setItem('prosperium_nome', nome);
        }
        if (saldo) {
            const formatado = `R$ ${parseFloat(saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            document.getElementById('main-balance').innerText = formatado;
            localStorage.setItem('prosperium_saldo', formatado);
        }
        closeAllModals();
    };

    // Voz
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.onclick = () => {
            const SDK = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SDK) return;
            const rec = new SDK(); rec.lang = 'pt-BR';
            rec.onstart = () => { voiceBtn.style.background = '#ff4d4d'; voiceBtn.innerHTML = '...'; };
            rec.onresult = (e) => {
                const text = e.results[0][0].transcript.toLowerCase();
                voiceBtn.style.background = '#00ff88'; voiceBtn.innerHTML = '🎙️';
                if (text.includes('ganhei')) openEntryModal('ganho');
                else if (text.includes('vale') || text.includes('adiantamento')) openEntryModal('adiantamento');
                else openEntryModal('despesa');
            };
            rec.start();
        };
    }
});