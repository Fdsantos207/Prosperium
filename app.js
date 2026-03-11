/* PROSPERIUM PRO - CORE ENGINE (V.4.6)
   Focus: FAB Integration & UI Sync
*/

const state = {
    transactions: JSON.parse(localStorage.getItem('prosper_tx')) || [],
    cardConfig: JSON.parse(localStorage.getItem('prosper_card')) || { limit: 0 },
    userName: localStorage.getItem('prosper_user') || 'Danilo',
    goals: JSON.parse(localStorage.getItem('prosper_goals')) || [false, false, false]
};

// --- CORE FUNCTIONS ---
const save = () => {
    localStorage.setItem('prosper_tx', JSON.stringify(state.transactions));
    localStorage.setItem('prosper_card', JSON.stringify(state.cardConfig));
    localStorage.setItem('prosper_user', state.userName);
    localStorage.setItem('prosper_goals', JSON.stringify(state.goals));
    updateUI();
};

const updateUI = () => {
    let tIn = 0, tOut = 0, tCard = 0;
    
    state.transactions.forEach(t => {
        if (t.type === 'in') tIn += t.val;
        else {
            if (t.method === 'credit') tCard += t.val;
            else tOut += t.val;
        }
    });

    const balance = tIn - tOut;
    const cardAvailable = state.cardConfig.limit - tCard;
    const cardPerc = state.cardConfig.limit > 0 ? (tCard / state.cardConfig.limit) * 100 : 0;

    // 1. Cards Superiores
    document.getElementById('totalIn').innerText = `R$ ${tIn.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('totalOut').innerText = `R$ ${tOut.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('mainBalance').innerText = `R$ ${balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    // 2. Cartão de Crédito
    document.getElementById('cardBill').innerText = `R$ ${tCard.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('cardAvailable').innerText = `R$ ${cardAvailable.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    const cardProgress = document.getElementById('cardProgress');
    if(cardProgress) cardProgress.style.width = `${Math.min(cardPerc, 100)}%`;
    
    // 3. Termômetro em Arco
    const ratio = tIn > 0 ? (tOut / tIn) * 100 : 0;
    const pointer = document.getElementById('gaugePointerPro');
    const status = document.getElementById('gaugeStatus');
    
    if (pointer) {
        const rotation = (Math.min(ratio, 100) * 1.8) - 90;
        pointer.style.transform = `rotate(${rotation}deg)`;
    }
    
    if (status) {
        status.innerText = `${Math.round(ratio)}% - ${ratio > 80 ? "Crítico" : (ratio > 50 ? "Alerta" : "Saudável")}`;
        status.style.color = ratio > 80 ? "#da3633" : (ratio > 50 ? "#f1c40f" : "#2ea043");
    }

    // 4. Renderizar Metas e Tabela
    renderGoals();
    renderTransactions();

    document.getElementById('sideUserName').innerText = `Olá, ${state.userName}!`;
};

// --- LOGICA DE METAS ---
window.toggleGoal = (element, index) => {
    state.goals[index] = !state.goals[index];
    save(); 
};

const renderGoals = () => {
    const goalLines = document.querySelectorAll('.goal-line');
    goalLines.forEach((line, index) => {
        if (state.goals[index]) line.classList.add('completed');
        else line.classList.remove('completed');
    });
};

// --- RENDERIZAR TABELA ---
const renderTransactions = () => {
    const txBody = document.getElementById('txBody');
    if (txBody) {
        txBody.innerHTML = state.transactions.slice(-5).reverse().map(t => `
            <tr>
                <td>${t.type === 'in' ? 'Recebimento' : 'Pagamento Compra'}</td>
                <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td><span class="badge-type">${t.type === 'in' ? 'Renda' : 'Necessidades'}</span></td>
                <td style="font-weight: 800; color: ${t.type === 'in' ? '#2ea043' : '#fff'}">
                    R$ ${t.val.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </td>
                <td>Outros</td>
                <td>${t.method === 'credit' ? 'credit' : 'cash'}</td>
                <td><div class="check-circle" style="background: #2ea043; width: 12px; height: 12px; border-radius: 50%; margin: auto;"></div></td>
            </tr>
        `).join('');
    }
};

// --- MODAL & SIDEBAR ---
const openModal = (id) => {
    const modal = document.getElementById(id);
    const overlay = document.getElementById('overlay');
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

const closeAllModals = () => {
    document.querySelectorAll('.modal-bottom').forEach(m => m.classList.remove('active'));
    document.getElementById('sideMenu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
};

const resetApp = () => {
    if(confirm("Zerar todos os dados do Prosperium Pro?")) {
        localStorage.clear();
        location.reload();
    }
};

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    // Menu hambúrguer mobile
    document.getElementById('openMenu').onclick = () => {
        document.getElementById('sideMenu').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    };

    const closeMenuBtn = document.getElementById('closeMenu');
    if (closeMenuBtn) closeMenuBtn.onclick = closeAllModals;

    document.getElementById('overlay').onclick = closeAllModals;

    // BOTÃO FAB (+) - Abre o modal de entrada
    const fabAdd = document.getElementById('fabAdd');
    if (fabAdd) {
        fabAdd.onclick = () => openModal('entryModal');
    }

    document.getElementById('linkCardSetup').onclick = (e) => { e.preventDefault(); openModal('cardModal'); };
    
    // Salvar nova transação do Modal
    document.getElementById('saveEntry').onclick = () => {
        const valInput = document.getElementById('entryValue');
        const val = parseFloat(valInput.value);
        const type = document.getElementById('entryType').value;
        const method = document.getElementById('entryMethod').value;

        if (val > 0) {
            state.transactions.push({ val, type, method, date: new Date().toISOString() });
            save();
            valInput.value = '';
            closeAllModals();
        }
    };

    document.getElementById('saveCardConfig').onclick = () => {
        const limitInput = document.getElementById('limitInput');
        state.cardConfig.limit = parseFloat(limitInput.value) || 0;
        save();
        closeAllModals();
    };
});