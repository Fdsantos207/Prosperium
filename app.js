// Dados iniciais
const gastos = [
    { label: 'Seg', val: 40, color: '#333' },
    { label: 'Ter', val: 65, color: '#333' },
    { label: 'Qua', val: 90, color: '#00ff88' },
    { label: 'Qui', val: 55, color: '#333' },
    { label: 'Sex', val: 80, color: '#333' }
];

const metas = [
    { nome: 'Reserva de Emergência', atual: 15000, total: 20000, cor: '#00ff88' },
    { nome: 'Novo MacBook Pro', atual: 4500, total: 18000, cor: '#00ddeb' }
];

// Funções de Renderização
const renderChart = () => {
    const chart = document.getElementById('chart');
    if(!chart) return;
    chart.innerHTML = gastos.map(g => `
        <div class="bar-group">
            <div class="bar" style="height: ${g.val}%; background: ${g.color}"></div>
            <span class="bar-label">${g.label}</span>
        </div>
    `).join('');
};

const renderGoals = () => {
    const container = document.getElementById('goals');
    if(!container) return;
    container.innerHTML = metas.map(m => {
        const perc = (m.atual / m.total) * 100;
        return `
            <div class="goal-card">
                <div style="display:flex; justify-content:space-between; font-weight:600">
                    <span>${m.nome}</span><span>${perc.toFixed(0)}%</span>
                </div>
                <div class="progress-bg">
                    <div class="progress-fill" style="width: ${perc}%; background: ${m.cor}"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#888">
                    <span>R$ ${m.atual.toLocaleString()}</span><span>R$ ${m.total.toLocaleString()}</span>
                </div>
            </div>
        `;
    }).join('');
};

// Voz e Início
document.addEventListener('DOMContentLoaded', () => {
    renderChart();
    renderGoals();

    const voiceBtn = document.getElementById('voiceBtn');
    voiceBtn.onclick = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'pt-BR';
        recognition.onstart = () => voiceBtn.style.background = '#ff4d4d';
        recognition.onresult = (e) => {
            alert("Processando: " + e.results[0][0].transcript);
            voiceBtn.style.background = '#00ff88';
        };
        recognition.start();
    };
});