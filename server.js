const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Arquivo de dados
const DATA_FILE = path.join(__dirname, 'agendamentos.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Servir arquivos estáticos da pasta public
app.use(express.static(PUBLIC_DIR));

// ========== NODEMAILER CONFIGURATION ==========
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'seu-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'sua-senha-app'
    }
});

// Função para enviar email de confirmação
async function sendConfirmationEmail(agendamento) {
    const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const mailOptions = {
        from: '"Elite Barber Club 💈" <noreply@elitebarber.com.br>',
        to: agendamento.email,
        subject: '✅ Agendamento Confirmado - Elite Barber Club',
        html: `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Arial', sans-serif; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 50px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #0a0a0a, #1a1a1a); padding: 40px 30px; text-align: center; }
                    .header h1 { color: #D4AF37; font-size: 36px; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 10px; }
                    .header p { color: #999; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }
                    .content { padding: 50px 40px; }
                    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
                    .greeting strong { color: #D4AF37; }
                    .success-badge { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 2px; margin: 20px 0; }
                    .info-box { background: linear-gradient(135deg, #f9f9f9, #f0f0f0); border-left: 5px solid #D4AF37; padding: 30px; margin: 30px 0; border-radius: 5px; }
                    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
                    .info-row:last-child { border-bottom: none; }
                    .label { color: #666; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
                    .value { color: #000; font-weight: bold; font-size: 16px; }
                    .highlight { color: #D4AF37; font-size: 18px; }
                    .message-box { background: #fff8e1; border: 2px dashed #D4AF37; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .message-box h3 { color: #D4AF37; margin-bottom: 10px; }
                    .button { display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #D4AF37, #c99e2e); color: #000; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 5px; margin: 30px 0; box-shadow: 0 10px 30px rgba(212,175,55,0.3); transition: all 0.3s ease; }
                    .button:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(212,175,55,0.5); }
                    .contact-info { background: #f9f9f9; padding: 30px; margin-top: 30px; border-radius: 5px; text-align: center; }
                    .contact-info h3 { color: #D4AF37; margin-bottom: 20px; font-size: 20px; }
                    .contact-item { margin: 15px 0; color: #666; font-size: 15px; }
                    .contact-item strong { color: #333; }
                    .footer { background: #0a0a0a; color: #999; text-align: center; padding: 30px 20px; font-size: 13px; line-height: 1.8; }
                    .footer a { color: #D4AF37; text-decoration: none; }
                    .social-links { margin: 20px 0; }
                    .social-links a { display: inline-block; margin: 0 10px; font-size: 24px; text-decoration: none; }
                    .divider { height: 3px; background: linear-gradient(to right, transparent, #D4AF37, transparent); margin: 30px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- HEADER -->
                    <div class="header">
                        <h1>💈 ELITE BARBER</h1>
                        <p>Barbearia Premium</p>
                    </div>

                    <!-- CONTENT -->
                    <div class="content">
                        <p class="greeting">Olá, <strong>${agendamento.nome}</strong>!</p>
                        
                        <div class="success-badge">
                            ✅ Agendamento Confirmado!
                        </div>

                        <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 20px 0;">
                            Seu agendamento foi <strong style="color: #4CAF50;">confirmado com sucesso</strong>! 
                            Estamos ansiosos para recebê-lo e proporcionar uma experiência única de cuidado e estilo.
                        </p>

                        <div class="divider"></div>

                        <!-- INFO BOX -->
                        <div class="info-box">
                            <div class="info-row">
                                <span class="label">📋 Serviço</span>
                                <span class="value highlight">${agendamento.servico}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">📅 Data</span>
                                <span class="value">${dataFormatada}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">🕐 Horário</span>
                                <span class="value highlight">${agendamento.horario}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">📞 Telefone</span>
                                <span class="value">${agendamento.telefone}</span>
                            </div>
                        </div>

                        ${agendamento.mensagem && agendamento.mensagem !== 'Sem observações' ? `
                        <div class="message-box">
                            <h3>💬 Suas Observações:</h3>
                            <p style="color: #666; line-height: 1.6;">${agendamento.mensagem}</p>
                        </div>
                        ` : ''}

                        <div style="text-align: center;">
                            <a href="https://elite-barber.onrender.com" class="button">
                                🌐 Acessar Site
                            </a>
                        </div>

                        <div class="divider"></div>

                        <!-- CONTACT INFO -->
                        <div class="contact-info">
                            <h3>📍 Como Chegar</h3>
                            <div class="contact-item">
                                <strong>Endereço:</strong><br>
                                Rua das Flores, 123 - Centro<br>
                                Ubá/MG - CEP: 36500-000
                            </div>
                            <div class="contact-item">
                                <strong>📞 Telefone:</strong> (32) 99999-9999
                            </div>
                            <div class="contact-item">
                                <strong>📧 Email:</strong> contato@elitebarber.com.br
                            </div>
                            <div class="contact-item">
                                <strong>⏰ Horário de Funcionamento:</strong><br>
                                Segunda à Sexta: 9h às 20h<br>
                                Sábado: 9h às 18h
                            </div>
                        </div>

                        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px; line-height: 1.6;">
                            <strong style="color: #D4AF37;">⚠️ Importante:</strong><br>
                            Por favor, chegue com 5 minutos de antecedência.<br>
                            Em caso de imprevistos, entre em contato para reagendar.
                        </p>
                    </div>

                    <!-- FOOTER -->
                    <div class="footer">
                        <div class="social-links">
                            <a href="#" style="color: #D4AF37;">📷</a>
                            <a href="#" style="color: #D4AF37;">📘</a>
                            <a href="#" style="color: #D4AF37;">💬</a>
                        </div>
                        
                        <p><strong style="color: #D4AF37;">Elite Barber Club</strong></p>
                        <p>Tradição, Estilo & Elegância</p>
                        <p style="margin-top: 15px;">&copy; 2025 Elite Barber Club. Todos os direitos reservados.</p>
                        <p style="margin-top: 10px; font-size: 11px;">
                            Você recebeu este email porque realizou um agendamento em nosso site.<br>
                            <a href="#">Cancelar agendamento</a> | <a href="#">Política de Privacidade</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email de confirmação enviado para: ${agendamento.email}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error.message);
        return false;
    }
}

// ========== FILE OPERATIONS ==========
async function readAgendamentos() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await saveAgendamentos([]);
            return [];
        }
        throw error;
    }
}

async function saveAgendamentos(agendamentos) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(agendamentos, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao salvar agendamentos:', error);
        return false;
    }
}

// ========== API ROUTES ==========

// Health check / Status
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Elite Barber API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// GET - Listar todos os agendamentos
app.get('/api/agendamentos', async (req, res) => {
    try {
        const agendamentos = await readAgendamentos();
        console.log(`📊 ${agendamentos.length} agendamentos recuperados`);
        res.json(agendamentos);
    } catch (error) {
        console.error('Erro ao ler agendamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
});

// POST - Criar novo agendamento
app.post('/api/agendamentos', async (req, res) => {
    try {
        const novoAgendamento = {
            ...req.body,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            status: req.body.status || 'PENDENTE'
        };
        
        // Validação básica
        if (!novoAgendamento.nome || !novoAgendamento.telefone || !novoAgendamento.email || 
            !novoAgendamento.servico || !novoAgendamento.data || !novoAgendamento.horario) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        const agendamentos = await readAgendamentos();
        agendamentos.push(novoAgendamento);
        
        const saved = await saveAgendamentos(agendamentos);
        
        if (saved) {
            // Enviar email de confirmação (não-bloqueante)
            sendConfirmationEmail(novoAgendamento).catch(err => {
                console.error('Erro ao enviar email (não crítico):', err.message);
            });
            
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

// DELETE - Excluir agendamento específico
app.delete('/api/agendamentos/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const agendamentos = await readAgendamentos();
        
        if (index < 0 || index >= agendamentos.length) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        const removido = agendamentos.splice(index, 1)[0];
        await saveAgendamentos(agendamentos);
        
        console.log(`🗑️ Agendamento excluído: ${removido.nome}`);
        res.json({ message: 'Agendamento excluído com sucesso', agendamento: removido });
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        res.status(500).json({ error: 'Erro ao excluir agendamento' });
    }
});

// DELETE - Limpar todos os agendamentos
app.delete('/api/agendamentos', async (req, res) => {
    try {
        await saveAgendamentos([]);
        console.log('🗑️ Todos os agendamentos foram excluídos');
        res.json({ message: 'Todos os agendamentos foram excluídos' });
    } catch (error) {
        console.error('Erro ao limpar agendamentos:', error);
        res.status(500).json({ error: 'Erro ao limpar agendamentos' });
    }
});

// POST - Enviar email de marketing
app.post('/api/send-marketing', async (req, res) => {
    try {
        const { emails, subject, message } = req.body;
        
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ error: 'Lista de emails inválida' });
        }

        const results = await Promise.allSettled(
            emails.map(email => transporter.sendMail({
                from: '"Elite Barber Club 💈" <noreply@elitebarber.com.br>',
                to: email,
                subject: subject || 'Novidades Elite Barber Club',
                html: message || '<p>Confira nossas novidades!</p>'
            }))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`📧 Email marketing: ${successful} enviados, ${failed} falharam`);
        res.json({ 
            message: 'Emails enviados',
            successful,
            failed,
            total: emails.length
        });
    } catch (error) {
        console.error('Erro ao enviar email marketing:', error);
        res.status(500).json({ error: 'Erro ao enviar emails' });
    }
});

// Rota catch-all para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ========== SERVER START ==========
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║       💈 ELITE BARBER CLUB API 💈          ║
║                                            ║
║   🚀 Servidor rodando na porta ${PORT}       ║
║   🌐 http://localhost:${PORT}                ║
║   📊 Status: http://localhost:${PORT}/api/status ║
║                                            ║
║   ✅ Sistema Online e Operacional          ║
║                                            ║
╚════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM recebido. Encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT recebido. Encerrando servidor...');
    process.exit(0);
});
