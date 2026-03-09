/* FINANZA PRIME - ENGINE (V.2.0)
   Fix: Botão Cancelar & Link de Configurações
*/

// 1. ESTADO GLOBAL E DADOS INICIAIS
let selectedCategory = 'Lazer';

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
    if (noteGroup) noteGroup.style.display = 'none'; // Esconde nota ao fechar
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
    localStorage.setItem('finanza_saldo', novoSaldoText);
};

const carregarDadosSalvos = () => {
    const nomeSalvo = localStorage.getItem('finanza_nome');
    const saldoSalvo = localStorage.getItem('finanza_saldo');
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

    // Seletores Principais
    const openMenu = document.getElementById('openMenu');
    const closeMenu = document.getElementById('closeMenu');
    const sideMenu = document.getElementById('sideMenu');
    
    // Links do Menu (Captura por ID ou Posição)
    const linkAddGain = document.getElementById('linkAddGain');
    const linkAddAdvance = document.getElementById('linkAddAdvance');
    const linkAddExpense = document.getElementById('linkAddExpense');
    const allNavLinks = document.querySelectorAll('.nav-link');
    const configLink = allNavLinks[allNavLinks.length - 1]; // Pega o último da lista

    // Botões de Ação
    const saveIncome = document.getElementById('saveIncome');
    const saveAdvance = document.getElementById('saveAdvance');
    const saveEntry = document.getElementById('saveEntry');
    const saveConfig = document.getElementById('saveConfig');
    
    // Botões de Cancelar/Fechar
    const closeModal = document.getElementById('closeModal');
    const cancelButtons = document.querySelectorAll('.btn-cancel');

    // --- EVENTOS ---

    overlay.onclick = closeAllModals;
    if (closeMenu) closeMenu.onclick = closeAllModals;
    if (closeModal) closeModal.onclick = closeAllModals;
    
    // Aplica fechar em todos os botões "Voltar/Cancelar" dos modais
    cancelButtons.forEach(btn => btn.onclick = closeAllModals);

    if (openMenu) openMenu.onclick = () => {
        sideMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('menu-open');
    };

    // Navegação do Menu Lateral
    if (linkAddGain) linkAddGain.onclick = (e) => { e.preventDefault(); openEntryModal('ganho'); };
    if (linkAddAdvance) linkAddAdvance.onclick = (e) => { e.preventDefault(); openEntryModal('adiantamento'); };
    if (linkAddExpense) linkAddExpense.onclick = (e) => { e.preventDefault(); openEntryModal('despesa'); };
    
    if (configLink) {
        configLink.onclick = (e) => {
            e.preventDefault();
            openEntryModal('config');
        };
    }

    // Salvar Dados
    if (saveIncome) {
        saveIncome.onclick = () => {
            const val = parseFloat(document.getElementById('incomeValue').value);
            if (val > 0) { atualizarSaldoInterface(val, 'soma'); closeAllModals(); document.getElementById('incomeValue').value = ''; }
        };
    }

    if (saveAdvance) {
        saveAdvance.onclick = () => {
            const val = parseFloat(document.getElementById('advanceValue').value);
            if (val > 0) { atualizarSaldoInterface(val, 'soma'); closeAllModals(); document.getElementById('advanceValue').value = ''; }
        };
    }

    if (saveEntry) {
        saveEntry.onclick = () => {
            const inputVal = document.getElementById('inputValue');
            const inputNote = document.getElementById('inputNote');
            const val = parseFloat(inputVal.value);

            if (!val || val <= 0) return alert("Valor inválido.");
            if (selectedCategory === 'Outros' && inputNote.value.trim() === "") return alert("Descreva o gasto 'Outros'.");

            atualizarSaldoInterface(val, 'subtrai');
            inputVal.value = '';
            inputNote.value = '';
            closeAllModals();
        };
    }

    if (saveConfig) {
        saveConfig.onclick = () => {
            const nome = document.getElementById('configName').value;
            const saldo = document.getElementById('configBalance').value;
            if (nome) {
                document.querySelector('.user-name').innerText = nome;
                document.querySelector('.user-profile-side h3').innerText = nome;
                localStorage.setItem('finanza_nome', nome);
            }
            if (saldo) {
                const num = parseFloat(saldo);
                const formatado = `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                document.getElementById('main-balance').innerText = formatado;
                localStorage.setItem('finanza_saldo', formatado);
            }
            closeAllModals();
        };
    }

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