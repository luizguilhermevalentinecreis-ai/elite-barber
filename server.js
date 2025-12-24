const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'agendamentos.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Inicializar arquivo de dados se não existir
async function initDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
        console.log('📄 Arquivo de dados criado: agendamentos.json');
    }
}

// Ler agendamentos
async function readAgendamentos() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler agendamentos:', error);
        return [];
    }
}

// Salvar agendamentos
async function saveAgendamentos(agendamentos) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(agendamentos, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar agendamentos:', error);
        return false;
    }
}

// ========== ROTAS ==========

// Status do servidor
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        timestamp: new Date().toISOString(),
        message: 'Servidor Elite Barber ativo! 💈'
    });
});

// GET - Listar todos os agendamentos
app.get('/api/agendamentos', async (req, res) => {
    try {
        const agendamentos = await readAgendamentos();
        console.log(`📋 ${agendamentos.length} agendamentos enviados`);
        res.json(agendamentos);
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
});

// POST - Criar novo agendamento
app.post('/api/agendamentos', async (req, res) => {
    try {
        const novoAgendamento = req.body;
        
        // Validação básica
        if (!novoAgendamento.nome || !novoAgendamento.telefone || !novoAgendamento.email || 
            !novoAgendamento.servico || !novoAgendamento.data || !novoAgendamento.horario) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        const agendamentos = await readAgendamentos();
        agendamentos.push(novoAgendamento);
        
        const saved = await saveAgendamentos(agendamentos);
        
        if (saved) {
            console.log(`✅ Novo agendamento: ${novoAgendamento.nome} - ${novoAgendamento.servico}`);
            res.status(201).json({ 
                message: 'Agendamento criado com sucesso!',
                agendamento: novoAgendamento
            });
        } else {
            res.status(500).json({ error: 'Erro ao salvar agendamento' });
        }
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
});

// DELETE - Excluir agendamento por índice
app.delete('/api/agendamentos/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const agendamentos = await readAgendamentos();

        if (index < 0 || index >= agendamentos.length) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        const removido = agendamentos.splice(index, 1)[0];
        const saved = await saveAgendamentos(agendamentos);

        if (saved) {
            console.log(`🗑️ Agendamento removido: ${removido.nome}`);
            res.json({ 
                message: 'Agendamento excluído com sucesso!',
                removido: removido
            });
        } else {
            res.status(500).json({ error: 'Erro ao excluir agendamento' });
        }
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        res.status(500).json({ error: 'Erro ao excluir agendamento' });
    }
});

// DELETE - Limpar todos os agendamentos
app.delete('/api/agendamentos', async (req, res) => {
    try {
        const saved = await saveAgendamentos([]);
        
        if (saved) {
            console.log('🗑️ Todos os agendamentos foram limpos');
            res.json({ message: 'Todos os agendamentos foram excluídos!' });
        } else {
            res.status(500).json({ error: 'Erro ao limpar agendamentos' });
        }
    } catch (error) {
        console.error('Erro ao limpar agendamentos:', error);
        res.status(500).json({ error: 'Erro ao limpar agendamentos' });
    }
});

// GET - Buscar agendamentos por data
app.get('/api/agendamentos/data/:data', async (req, res) => {
    try {
        const data = req.params.data;
        const agendamentos = await readAgendamentos();
        const filtrados = agendamentos.filter(a => a.data === data);
        
        console.log(`📅 ${filtrados.length} agendamentos encontrados para ${data}`);
        res.json(filtrados);
    } catch (error) {
        console.error('Erro ao buscar agendamentos por data:', error);
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
});

// GET - Estatísticas
app.get('/api/estatisticas', async (req, res) => {
    try {
        const agendamentos = await readAgendamentos();
        const hoje = new Date().toISOString().split('T')[0];
        
        const stats = {
            total: agendamentos.length,
            hoje: agendamentos.filter(a => a.data === hoje).length,
            porServico: {},
            ultimosAgendamentos: agendamentos.slice(-5).reverse()
        };

        // Contar por serviço
        agendamentos.forEach(a => {
            stats.porServico[a.servico] = (stats.porServico[a.servico] || 0) + 1;
        });

        res.json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

// Servir arquivos HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 404 - Rota não encontrada
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
async function startServer() {
    await initDataFile();
    
    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 SERVIDOR ELITE BARBER CLUB INICIADO! 🎉');
        console.log('='.repeat(60));
        console.log(`\n📍 Servidor rodando em: http://localhost:${PORT}`);
        console.log(`🌐 Site principal: http://localhost:${PORT}/`);
        console.log(`🔐 Painel admin: http://localhost:${PORT}/admin`);
        console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
        console.log(`\n💡 Senha do admin: barbearia2025`);
        console.log('\n' + '='.repeat(60));
        console.log('💈 Pronto para receber agendamentos!');
        console.log('⌨️  Pressione Ctrl+C para parar o servidor');
        console.log('='.repeat(60) + '\n');
    });
}

// Tratamento de erros
process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Promessa rejeitada:', error);
});

// Iniciar
startServer();
