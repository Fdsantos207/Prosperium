// Registro do Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Finanza Prime: Ativo!'))
            .catch(err => console.log('Erro no SW:', err));
    });
}

// Simulação de entrada de dados (Interatividade 11/10)
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Feedback tátil simples (se disponível em mobile)
        if (window.navigator.vibrate) window.navigator.vibrate(50);
        console.log("Ação disparada: " + btn.innerText);
    });
});

const financeData = [
    { cat: 'Lazer', val: 450, color: '#00ff88' },
    { cat: 'Mercado', val: 1200, color: '#00ddeb' },
    { cat: 'Contas', val: 2800, color: '#ff4d4d' }
];

function renderChart() {
    const chart = document.getElementById('mainChart');
    const maxVal = Math.max(...financeData.map(d => d.val));

    chart.innerHTML = financeData.map(item => `
        <div class="chart-bar-group">
            <div class="bar" style="height: ${(item.val / maxVal) * 100}%; background: ${item.color}">
                <span class="bar-value">R$${item.val}</span>
            </div>
            <span class="bar-label">${item.cat}</span>
        </div>
    `).join('');
}

renderChart();