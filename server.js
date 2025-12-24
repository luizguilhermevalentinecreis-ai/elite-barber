const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ✅ Banco de dados em memória (substitua por MongoDB em produção)
let agendamentos = [];

// ========================================
// 📌 ROTAS DA API
// ========================================

// ✅ GET - Buscar todos os agendamentos
app.get('/api/agendamentos', (req, res) => {
    console.log('📥 GET /api/agendamentos - Total:', agendamentos.length);
    res.json(agendamentos);
});

// ✅ GET - Buscar agendamento por ID
app.get('/api/agendamentos/:id', (req, res) => {
    const agendamento = agendamentos.find(a => a.id === parseInt(req.params.id));
    
    if (agendamento) {
        res.json(agendamento);
    } else {
        res.status(404).json({ error: 'Agendamento não encontrado' });
    }
});

// ✅ POST - Criar novo agendamento
app.post('/api/agendamentos', (req, res) => {
    const novoAgendamento = {
        id: req.body.id || Date.now(),
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        service: req.body.service,
        date: req.body.date,
        time: req.body.time,
        notes: req.body.notes || '',
        status: req.body.status || 'PENDENTE',
        servicePrice: req.body.servicePrice || 0,
        createdAt: req.body.createdAt || new Date().toISOString()
    };
    
    agendamentos.push(novoAgendamento);
    console.log('✅ POST /api/agendamentos - Novo agendamento criado:', novoAgendamento.id);
    
    res.status(201).json(novoAgendamento);
});

// ✅ PUT - Atualizar agendamento existente
app.put('/api/agendamentos/:id', (req, res) => {
    const index = agendamentos.findIndex(a => a.id === parseInt(req.params.id));
    
    if (index !== -1) {
        agendamentos[index] = {
            ...agendamentos[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        console.log('✅ PUT /api/agendamentos/:id - Atualizado:', req.params.id);
        res.json(agendamentos[index]);
    } else {
        res.status(404).json({ error: 'Agendamento não encontrado' });
    }
});

// ✅ DELETE - Excluir agendamento específico
app.delete('/api/agendamentos/:id', (req, res) => {
    const index = agendamentos.findIndex(a => a.id === parseInt(req.params.id));
    
    if (index !== -1) {
        const deletado = agendamentos.splice(index, 1);
        console.log('🗑️ DELETE /api/agendamentos/:id - Excluído:', req.params.id);
        res.json({ message: 'Agendamento excluído', agendamento: deletado[0] });
    } else {
        res.status(404).json({ error: 'Agendamento não encontrado' });
    }
});

// ✅ DELETE - Limpar todos os agendamentos
app.delete('/api/agendamentos', (req, res) => {
    const total = agendamentos.length;
    agendamentos = [];
    console.log('🗑️ DELETE /api/agendamentos - Todos excluídos. Total:', total);
    res.json({ message: `${total} agendamentos excluídos` });
});

// ✅ GET - Status do servidor
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        totalAgendamentos: agendamentos.length
    });
});

// ========================================
// 📌 ROTAS HTML
// ========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ========================================
// 🚀 INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
    console.log('🚀 Servidor rodando em http://localhost:' + PORT);
    console.log('📡 API disponível em http://localhost:' + PORT + '/api/agendamentos');
});

// ========================================
// 📊 DADOS DE TESTE (opcional)
// ========================================



console.log('✅ Servidor inicializado com', agendamentos.length, 'agendamentos de teste');
