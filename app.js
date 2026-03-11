/* PROSPERIUM PRO - CORE ENGINE (V.3.5)
   Focus: Hybrid Sidebar Logic & Transaction Sync
*/

const state = {
    transactions: JSON.parse(localStorage.getItem('prosper_tx')) || [],
    cardConfig: JSON.parse(localStorage.getItem('prosper_card')) || { limit: 0 },
    userName: localStorage.getItem('prosper_user') || 'Danilo'
};

// --- CORE FUNCTIONS ---
const save = () => {
    localStorage.setItem('prosper_tx', JSON.stringify(state.transactions));
    localStorage.setItem('prosper_card', JSON.stringify(state.cardConfig));
    localStorage.setItem('prosper_user', state.userName);
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

    // Dashboard
    document.getElementById('totalIn').innerText = `R$ ${tIn.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('totalOut').innerText = `R$ ${tOut.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('mainBalance').innerText = `R$ ${balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    // Cartão
    document.getElementById('cardBill').innerText = `R$ ${tCard.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('cardAvailable').innerText = `R$ ${cardAvailable.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('cardProgress').style.width = `${Math.min(cardPerc, 100)}%`;
    
    // Termômetro
    const ratio = tIn > 0 ? (tOut / tIn) * 100 : 0;
    const pointer = document.getElementById('gaugePointer');
    const status = document.getElementById('gaugeStatus');
    
    pointer.style.width = `${Math.min(ratio, 100)}%`;
    
    if (ratio > 80) { status.innerText = "Crítico"; status.style.color = "#da3633"; }
    else if (ratio > 50) { status.innerText = "Alerta"; status.style.color = "#f1c40f"; }
    else { status.innerText = "Saudável"; status.style.color = "#2ea043"; }

    document.getElementById('sideUserName').innerText = `Olá, ${state.userName}!`;
};

// --- MODAL & SIDEBAR LOGIC ---
const openModal = (id) => {
    const modal = document.getElementById(id);
    const overlay = document.getElementById('overlay');
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
        if (window.innerWidth <= 1024) document.body.style.overflow = 'hidden';
    }
};

const closeAllModals = () => {
    // Fecha Modais
    document.querySelectorAll('.modal-bottom').forEach(m => m.classList.remove('active'));
    // Fecha Sidebar (Mobile)
    document.getElementById('sideMenu').classList.remove('active');
    // Esconde Overlay
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
};

const resetApp = () => {
    if(confirm("Deseja zerar todos os dados do Prosperium Pro?")) {
        localStorage.clear();
        location.reload();
    }
};

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    // Toggle Sidebar (Mobile)
    const openMenuBtn = document.getElementById('openMenu');
    if (openMenuBtn) {
        openMenuBtn.onclick = () => {
            document.getElementById('sideMenu').classList.add('active');
            document.getElementById('overlay').classList.add('active');
        };
    }

    // Botão de fechar (X) na Sidebar Mobile
    const closeMenuBtn = document.getElementById('closeMenu');
    if (closeMenuBtn) {
        closeMenuBtn.onclick = closeAllModals;
    }

    document.getElementById('overlay').onclick = closeAllModals;
    document.getElementById('fabAdd').onclick = () => openModal('entryModal');
    document.getElementById('linkCardSetup').onclick = (e) => { e.preventDefault(); openModal('cardModal'); };
    
    const linkConfig = document.getElementById('linkConfig');
    if (linkConfig) {
        linkConfig.onclick = (e) => {
            e.preventDefault();
            document.getElementById('configName').value = state.userName;
            openModal('configModal');
        };
    }

    // Salvar Transação
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

    // Salvar Cartão
    document.getElementById('saveCardConfig').onclick = () => {
        state.cardConfig.limit = parseFloat(document.getElementById('limitInput').value) || 0;
        save();
        closeAllModals();
    };

    // Salvar Configurações
    document.getElementById('saveConfig').onclick = () => {
        const newName = document.getElementById('configName').value;
        if (newName.trim() !== "") {
            state.userName = newName;
            save();
        }
        closeAllModals();
    };
});