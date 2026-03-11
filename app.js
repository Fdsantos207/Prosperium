/* PROSPERIUM PRO - CORE */
const updateProDashboard = () => {
    const transactions = JSON.parse(localStorage.getItem('prosperium_tx') || "[]");
    
    let totalIn = 0;
    let totalOut = 0;
    
    transactions.forEach(t => {
        if (t.type === 'in') totalIn += t.val;
        else totalOut += t.val;
    });

    const balance = totalIn - totalOut;
    const ratio = totalIn > 0 ? (totalOut / totalIn) * 100 : 100;

    // Atualiza Widgets
    document.getElementById('totalIn').innerText = `R$ ${totalIn.toLocaleString('pt-BR')}`;
    document.getElementById('totalOut').innerText = `R$ ${totalOut.toLocaleString('pt-BR')}`;
    document.getElementById('mainBalance').innerText = `R$ ${balance.toLocaleString('pt-BR')}`;

    // Lógica do Termômetro
    const pointer = document.getElementById('gaugePointer');
    // Mapeia 0-100% para -90deg a 90deg do ponteiro
    const rotation = (ratio * 1.8) - 90;
    pointer.style.transform = `rotate(${Math.min(rotation, 90)}deg)`;
};