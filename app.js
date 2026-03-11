/* PROSPERIUM PRO - CORE ENGINE */

const state = {
    transactions: JSON.parse(localStorage.getItem('prosper_tx')) || [],
    cardConfig: JSON.parse(localStorage.getItem('prosper_card')) || { limit: 0 },
    userName: localStorage.getItem('prosper_user') || 'Danilo'
};

// --- CORE FUNCTIONS ---
const save = () => {
    localStorage.setItem('prosper_tx', JSON.stringify(state.transactions));
    localStorage.setItem('prosper_card', JSON.stringify(state.cardConfig));
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

    // Update Elements
    document.getElementById('totalIn').innerText = `R$ ${tIn.toLocaleString('pt-BR')}`;
    document.getElementById('totalOut').innerText = `R$ ${tOut.toLocaleString('pt-BR')}`;
    document.getElementById('mainBalance').innerText = `R$ ${balance.toLocaleString('pt-BR')}`;
    document.getElementById('cardBill').innerText = `R$ ${tCard.toLocaleString('pt-BR')}`;
    document.getElementById('cardAvailable').innerText = `R$ ${cardAvailable.toLocaleString('pt-BR')}`;
    document.getElementById('cardProgress').style.width = `${Math.min(cardPerc, 100)}%`;
    
    // Termômetro
    const ratio = tIn > 0 ? (tOut / tIn) * 100 : 0;
    document.getElementById('gaugePointer').style.width = `${Math.min(ratio, 100)}%`;
    document.getElementById('gaugeStatus').innerText = ratio > 80 ? "Crítico" : (ratio > 50 ? "Alerta" : "Saudável");
};

// --- MODAL LOGIC ---
const openModal = (id) => {
    document.getElementById(id).classList.add('active');
    document.getElementById('overlay').classList.add('active');
};

const closeAllModals = () => {
    document.querySelectorAll('.modal-bottom').forEach(m => m.classList.remove('active'));
    document.getElementById('sideMenu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
};

const resetApp = () => {
    if(confirm("Zerar todos os dados do Prosperium?")) {
        localStorage.clear();
        location.reload();
    }
};

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    document.getElementById('openMenu').onclick = () => {
        document.getElementById('sideMenu').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    };

    document.getElementById('overlay').onclick = closeAllModals;
    document.getElementById('fabAdd').onclick = () => openModal('entryModal');
    document.getElementById('linkCardSetup').onclick = () => openModal('cardModal');

    // Save Entry
    document.getElementById('saveEntry').onclick = () => {
        const val = parseFloat(document.getElementById('entryValue').value);
        const type = document.getElementById('entryType').value;
        const method = document.getElementById('entryMethod').value;

        if (val > 0) {
            state.transactions.push({ val, type, method, date: new Date() });
            save();
            document.getElementById('entryValue').value = '';
            closeAllModals();
        }
    };

    // Save Card
    document.getElementById('saveCardConfig').onclick = () => {
        state.cardConfig.limit = parseFloat(document.getElementById('limitInput').value) || 0;
        save();
        closeAllModals();
    };
});