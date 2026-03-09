/* FINANZA PRIME - ENGINE (V.1.2)
   Focus: Performance & UI Sync
*/

// 1. Dados iniciais (Simulação de API)
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

// 2. Funções de Renderização
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

// 3. Inicialização e Eventos
document.addEventListener('DOMContentLoaded', () => {
    renderChart();
    renderGoals();

    // Elementos do Menu
    const sideMenu = document.getElementById('sideMenu');
    const openMenu = document.getElementById('openMenu');
    const closeMenu = document.getElementById('closeMenu');
    
    // Criar overlay dinamicamente (Garante que o fundo escureça)
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    const toggleMenu = () => {
        sideMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('menu-open'); // Ajuste sênior: trava o scroll
    };

    // Listeners do Menu
    if(openMenu) openMenu.addEventListener('click', toggleMenu);
    if(closeMenu) closeMenu.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Fechar menu ao clicar em links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // Lógica de Voz (Melhorada com feedback visual)
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.onclick = () => {
            const SpeechSDK = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechSDK) {
                alert("Navegador não suporta voz.");
                return;
            }
            
            const recognition = new SpeechSDK();
            recognition.lang = 'pt-BR';
            
            recognition.onstart = () => {
                voiceBtn.style.background = '#ff4d4d'; // Vermelho gravando
                voiceBtn.innerHTML = '🎙️...';
            };
            
            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                alert("Finanza ouviu: " + transcript);
                voiceBtn.style.background = '#00ff88';
                voiceBtn.innerHTML = '🎙️';
            };

            recognition.onerror = () => {
                voiceBtn.style.background = '#00ff88';
                voiceBtn.innerHTML = '🎙️';
            };
            
            recognition.start();
        };
    }
});