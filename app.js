/* FINANZA PRIME - ENGINE (V.1.6)
   Clean Version: Optimized for Sidebar Navigation
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
    { nome: 'Reserva de Emergência', atual: 15000, total: 20000, color: '#00ff88' },
    { nome: 'Novo MacBook Pro', atual: 4500, total: 18000, color: '#00ddeb' }
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
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#888; margin-top:8px;">
                    <span>R$ ${m.atual.toLocaleString('pt-BR')}</span>
                    <span>R$ ${m.total.toLocaleString('pt-BR')}</span>
                </div>
            </div>
        `;
    }).join('');
};

// 3. LÓGICA DE MODAIS
const openEntryModal = (type) => {
    const modal = document.getElementById('entryModal');
    const overlay = document.querySelector('.menu-overlay');
    if (!modal || !overlay) return;

    document.getElementById('modalTitle').innerText = type === 'receita' ? 'Nova Receita' : 'Nova Despesa';
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
};

const closeAllModals = () => {
    const modals = document.querySelectorAll('.modal-bottom');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay');
    
    modals.forEach(m => m.classList.remove('active'));
    if (sideMenu) sideMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
};

window.setCategory = (cat) => {
    selectedCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.includes(cat)) btn.classList.add('active');
    });
};

// 4. PERSISTÊNCIA (LOCAL STORAGE)
const carregarDadosSalvos = () => {
    const nomeSalvo = localStorage.getItem('finanza_nome');
    const saldoSalvo = localStorage.getItem('finanza_saldo');

    if (nomeSalvo) {
        document.querySelector('.user-name').innerText = nomeSalvo;
        document.querySelector('.user-profile-side h3').innerText = nomeSalvo;
    }
    if (saldoSalvo) {
        document.getElementById('main-balance').innerText = saldoSalvo;
    }
};

// 5. INICIALIZAÇÃO E EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosSalvos();
    renderChart();
    renderGoals();

    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    const sideMenu = document.getElementById('sideMenu');
    const openMenu = document.getElementById('openMenu');
    const closeMenu = document.getElementById('closeMenu');
    const saveEntry = document.getElementById('saveEntry');
    
    // Links do Menu Lateral
    const navLinks = document.querySelectorAll('.nav-link');
    const configLink = navLinks[navLinks.length - 1]; // Último: Configurações
    const entryLink = navLinks[0]; // Primeiro: Minhas Contas (usaremos como atalho de lançamento)

    const configModal = document.getElementById('configModal');
    const saveConfig = document.getElementById('saveConfig');

    overlay.onclick = closeAllModals;
    if (closeMenu) closeMenu.onclick = closeAllModals;

    if (openMenu) {
        openMenu.onclick = () => {
            sideMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.classList.add('menu-open');
        };
    }

    // Ação do primeiro link (Minhas Contas) abre o Modal de Lançamento
    if (entryLink) {
        entryLink.onclick = (e) => {
            e.preventDefault();
            closeAllModals();
            openEntryModal('despesa');
        };
    }

    if (configLink) {
        configLink.onclick = (e) => {
            e.preventDefault();
            closeAllModals();
            configModal.classList.add('active');
            overlay.classList.add('active');
        };
    }

    if (saveConfig) {
        saveConfig.onclick = () => {
            const novoNome = document.getElementById('configName').value;
            const novoSaldo = document.getElementById('configBalance').value;

            if (novoNome) {
                document.querySelector('.user-name').innerText = novoNome;
                document.querySelector('.user-profile-side h3').innerText = novoNome;
                localStorage.setItem('finanza_nome', novoNome);
            }

            if (novoSaldo) {
                const formatado = `R$ ${parseFloat(novoSaldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                document.getElementById('main-balance').innerText = formatado;
                localStorage.setItem('finanza_saldo', formatado);
            }
            closeAllModals();
        };
    }

    if (saveEntry) {
        saveEntry.onclick = () => {
            const valorInput = document.getElementById('inputValue');
            const valor = parseFloat(valorInput.value);
            if (!valor || valor <= 0) return alert("Valor inválido.");

            const saldoEl = document.getElementById('main-balance');
            let saldoLimpo = parseFloat(saldoEl.innerText.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
            
            if (document.getElementById('modalTitle').innerText === 'Nova Receita') {
                saldoLimpo += valor;
            } else {
                saldoLimpo -= valor;
            }

            const novoSaldoText = `R$ ${saldoLimpo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            saldoEl.innerText = novoSaldoText;
            localStorage.setItem('finanza_saldo', novoSaldoText);
            
            valorInput.value = '';
            document.getElementById('inputDesc').value = '';
            closeAllModals();
        };
    }

    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.onclick = () => {
            const SDK = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SDK) return alert("Voz não suportada.");
            const rec = new SDK();
            rec.lang = 'pt-BR';
            rec.onstart = () => { voiceBtn.style.background = '#ff4d4d'; voiceBtn.innerHTML = '⚡'; };
            rec.onresult = (e) => {
                const text = e.results[0][0].transcript.toLowerCase();
                voiceBtn.style.background = '#00ff88';
                voiceBtn.innerHTML = '🎙️';
                if (text.includes('receita')) openEntryModal('receita');
                else {
                    openEntryModal('despesa');
                    document.getElementById('inputDesc').value = text;
                }
            };
            rec.onerror = () => { voiceBtn.style.background = '#00ff88'; voiceBtn.innerHTML = '🎙️'; };
            rec.start();
        };
    }
});