/* FINANZA PRIME - ENGINE (V.1.3)
   Core: Charts, Sidebar, Voice AI & Data Entry
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

// 3. LÓGICA DO MODAL DE ENTRADA
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
    const modal = document.getElementById('entryModal');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay');
    
    if (modal) modal.classList.remove('active');
    if (sideMenu) sideMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
};

// Função Global para o HTML encontrar
window.setCategory = (cat) => {
    selectedCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.includes(cat)) btn.classList.add('active');
    });
};

// 4. INICIALIZAÇÃO E EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    renderChart();
    renderGoals();

    // -- Overlay do Sistema --
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    // -- Elementos do Menu e Modal --
    const sideMenu = document.getElementById('sideMenu');
    const openMenu = document.getElementById('openMenu');
    const closeMenu = document.getElementById('closeMenu');
    const closeModal = document.getElementById('closeModal');
    const saveEntry = document.getElementById('saveEntry');

    // -- Listeners de Fechamento --
    [overlay, closeMenu, closeModal].forEach(btn => {
        if (btn) btn.addEventListener('click', closeAllModals);
    });

    // -- Abrir Menu Lateral --
    if (openMenu) {
        openMenu.addEventListener('click', () => {
            sideMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.classList.add('menu-open');
        });
    }

    // -- Atalho: Clicar no cartão na Tab Bar abre Despesa --
    const tabCards = document.querySelectorAll('.tab-item')[1];
    if (tabCards) {
        tabCards.addEventListener('click', (e) => {
            e.preventDefault();
            openEntryModal('despesa');
        });
    }

    // -- Lógica de Salvar --
    if (saveEntry) {
        saveEntry.onclick = () => {
            const valorInput = document.getElementById('inputValue');
            const descInput = document.getElementById('inputDesc');
            const valor = parseFloat(valorInput.value);

            if (!valor || valor <= 0) {
                alert("Insira um valor válido.");
                return;
            }

            const saldoAtualEl = document.getElementById('main-balance');
            let saldoLimpo = parseFloat(saldoAtualEl.innerText.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
            
            if (document.getElementById('modalTitle').innerText === 'Nova Receita') {
                saldoLimpo += valor;
            } else {
                saldoLimpo -= valor;
            }

            // Atualiza Interface
            saldoAtualEl.innerText = `R$ ${saldoLimpo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            
            // Limpa e Fecha
            valorInput.value = '';
            descInput.value = '';
            closeAllModals();
            
            // Feedback tátil sutil
            if (navigator.vibrate) navigator.vibrate(10);
        };
    }

    // -- Lógica de Voz --
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.onclick = () => {
            const SpeechSDK = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechSDK) return alert("Voz não suportada.");
            
            const recognition = new SpeechSDK();
            recognition.lang = 'pt-BR';
            
            recognition.onstart = () => {
                voiceBtn.style.background = '#ff4d4d';
                voiceBtn.innerHTML = '⚡';
            };
            
            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript.toLowerCase();
                voiceBtn.style.background = '#00ff88';
                voiceBtn.innerHTML = '🎙️';

                // Inteligência: Se falar "receita", abre o modal de receita
                if (transcript.includes('receita') || transcript.includes('ganhei')) {
                    openEntryModal('receita');
                } else {
                    openEntryModal('despesa');
                    document.getElementById('inputDesc').value = transcript;
                }
            };

            recognition.onerror = () => {
                voiceBtn.style.background = '#00ff88';
                voiceBtn.innerHTML = '🎙️';
            };
            
            recognition.start();
        };
    }
});