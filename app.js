/* PROSPERIUM PRO - CORE ENGINE (V.4.0)
   Focus: Full Dashboard Sync & Transaction Table
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

    // 1. Atualização dos Cards Superiores
    document.getElementById('totalIn').innerText = `R$ ${tIn.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('totalOut').innerText = `R$ ${tOut.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('mainBalance').innerText = `R$ ${balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    // 2. Widget de Cartão Pro
    document.getElementById('cardBill').innerText = `R$ ${tCard.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('cardAvailable').innerText = `R$ ${cardAvailable.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    const cardProgress = document.getElementById('cardProgress');
    if(cardProgress) cardProgress.style.width = `${Math.min(cardPerc, 100)}%`;
    
    // 3. Termômetro em Arco (Lógica de Graus)
    const ratio = tIn > 0 ? (tOut / tIn) * 100 : 0;
    const pointer = document.getElementById('gaugePointerPro'); // ID do novo HTML
    const status = document.getElementById('gaugeStatus');
    
    if (pointer) {
        // Mapeia 0-100% para -90deg a 90deg
        const rotation = (Math.min(ratio, 100) * 1.8) - 90;
        pointer.style.transform = `rotate(${rotation}deg)`;
    }
    
    if (status) {
        status.innerText = `${Math.round(ratio)}% - ${ratio > 80 ? "Crítico" : (ratio > 50 ? "Alerta" : "Saudável")}`;
        status.style.color = ratio > 80 ? "#da3633" : (ratio > 50 ? "#f1c40f" : "#2ea043");
    }

    // 4. Tabela de Transações Recentes
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

    document.getElementById('sideUserName').innerText = `Olá, ${state.userName}!`;
};

// --- MODAL & SIDEBAR LOGIC ---
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
    if(confirm("Deseja zerar todos os dados do Prosperium Pro?")) {
        localStorage.clear();
        location.reload();
    }
};

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    const openMenuBtn = document.getElementById('openMenu');
    if (openMenuBtn) {
        openMenuBtn.onclick = () => {
            document.getElementById('sideMenu').classList.add('active');
            document.getElementById('overlay').classList.add('active');
        };
    }

    const closeMenuBtn = document.getElementById('closeMenu');
    if (closeMenuBtn) closeMenuBtn.onclick = closeAllModals;

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
        state.cardConfig.limit = parseFloat(document.getElementById('limitInput').value) || 0;
        save();
        closeAllModals();
    };

    document.getElementById('saveConfig').onclick = () => {
        const newName = document.getElementById('configName').value;
        if (newName.trim() !== "") {
            state.userName = newName;
            save();
        }
        closeAllModals();
    };
});