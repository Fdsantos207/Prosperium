/* FINANZA PRIME - ENGINE (V.1.9)
   Especialista: Categorias Inteligentes e Notas Descritivas
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

// 3. LÓGICA DE MODAIS E CATEGORIAS
const closeAllModals = () => {
    const modals = document.querySelectorAll('.modal-bottom');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay');
    
    modals.forEach(m => m.classList.remove('active'));
    if (sideMenu) sideMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
};

const openEntryModal = (type) => {
    closeAllModals();
    let modalId = '';
    if (type === 'ganho') modalId = 'incomeModal';
    else if (type === 'adiantamento') modalId = 'advanceModal';
    else modalId = 'entryModal';

    const modal = document.getElementById(modalId);
    const overlay = document.querySelector('.menu-overlay');
    
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('menu-open');
    }
};

// FUNÇÃO DE CATEGORIA COM LÓGICA DE NOTA
window.setCategory = (cat) => {
    selectedCategory = cat;
    const noteGroup = document.getElementById('noteGroup');
    const inputNote = document.getElementById('inputNote');
    
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-cat') === cat) btn.classList.add('active');
    });

    if (cat === 'Outros') {
        noteGroup.style.display = 'block';
        inputNote.focus();
    } else {
        noteGroup.style.display = 'none';
        inputNote.value = ''; 
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

    const openMenu = document.getElementById('openMenu');
    const sideMenu = document.getElementById('sideMenu');
    const linkAddGain = document.getElementById('linkAddGain');
    const linkAddAdvance = document.getElementById('linkAddAdvance');
    const linkAddExpense = document.getElementById('linkAddExpense');
    
    const saveIncome = document.getElementById('saveIncome');
    const saveAdvance = document.getElementById('saveAdvance');
    const saveEntry = document.getElementById('saveEntry');

    overlay.onclick = closeAllModals;

    if (openMenu) openMenu.onclick = () => {
        sideMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('menu-open');
    };

    if (linkAddGain) linkAddGain.onclick = (e) => { e.preventDefault(); openEntryModal('ganho'); };
    if (linkAddAdvance) linkAddAdvance.onclick = (e) => { e.preventDefault(); openEntryModal('adiantamento'); };
    if (linkAddExpense) linkAddExpense.onclick = (e) => { e.preventDefault(); openEntryModal('despesa'); };

    if (saveIncome) {
        saveIncome.onclick = () => {
            const input = document.getElementById('incomeValue');
            const valor = parseFloat(input.value);
            if (valor > 0) {
                atualizarSaldoInterface(valor, 'soma');
                input.value = '';
                closeAllModals();
            }
        };
    }

    if (saveAdvance) {
        saveAdvance.onclick = () => {
            const input = document.getElementById('advanceValue');
            const valor = parseFloat(input.value);
            if (valor > 0) {
                atualizarSaldoInterface(valor, 'soma');
                const vales = JSON.parse(localStorage.getItem('finanza_vales') || "[]");
                vales.push({ data: new Date().toLocaleDateString(), valor: valor });
                localStorage.setItem('finanza_vales', JSON.stringify(vales));
                input.value = '';
                closeAllModals();
            }
        };
    }

    if (saveEntry) {
        saveEntry.onclick = () => {
            const inputVal = document.getElementById('inputValue');
            const inputNote = document.getElementById('inputNote');
            const valor = parseFloat(inputVal.value);

            if (!valor || valor <= 0) return alert("Insira um valor válido.");

            // Validação Sênior: Se for outros, nota é obrigatória
            if (selectedCategory === 'Outros' && inputNote.value.trim() === "") {
                alert("Por favor, descreva o que é esse gasto em 'Outros'.");
                return;
            }

            atualizarSaldoInterface(valor, 'subtrai');
            
            // Limpa tudo
            inputVal.value = '';
            inputNote.value = '';
            document.getElementById('noteGroup').style.display = 'none';
            closeAllModals();
        };
    }

    const saveConfig = document.getElementById('saveConfig');
    if (saveConfig) {
        saveConfig.onclick = () => {
            const nome = document.getElementById('configName').value;
            const saldo = document.getElementById('configBalance').value;
            if (nome) {
                document.querySelector('.user-name').innerText = nome;
                localStorage.setItem('finanza_nome', nome);
            }
            if (saldo) {
                const formatado = `R$ ${parseFloat(saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                document.getElementById('main-balance').innerText = formatado;
                localStorage.setItem('finanza_saldo', formatado);
            }
            closeAllModals();
        };
    }

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
                if (text.includes('ganhei')) openEntryModal('ganho');
                else if (text.includes('adiantamento')) openEntryModal('adiantamento');
                else openEntryModal('despesa');
            };
            rec.start();
        };
    }
});