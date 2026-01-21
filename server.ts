import express from 'express';
import cors from 'cors';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Resend } from 'resend';

// --- DIAGNÓSTICO DE INICIALIZAÇÃO ---
console.log("--- STARTING NUTURL SERVER ---");
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);

// Fallbacks de Segurança
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_prod';

// URL DO FRONTEND (CORS)
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

const prisma = new PrismaClient();
const app = express();

// Configuração Mercado Pago
const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'seu_access_token_aqui' 
});

// Configuração Resend (Email)
const resend = new Resend(process.env.RESEND_API_KEY || 're_fallback_key');

// --- CORS CONFIGURATION (ROBUST & SECURE) ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://web.nuturl.com',
  'https://nuturl.com',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 Blocked CORS from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json() as any);

// --- Helpers ---
const hashPassword = (password: string): { salt: string; hash: string } => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

const generateToken = (userId: string, accountType: string) => {
  return jwt.sign({ id: userId, type: accountType }, JWT_SECRET, { expiresIn: '7d' });
};

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // Verifica se a chave do Resend está configurada
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_fallback')) {
      console.log(`[DEV MODE] Email simulado para ${to}: "${subject}"`);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      return;
    }

    console.log(`📧 Email enviado para ${to} | ID: ${data?.id}`);
  } catch (err) {
    console.error('❌ Erro inesperado ao enviar email:', err);
  }
};

const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso negado' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// --- ROTAS ---

app.get('/api/stats', async (req, res) => {
  try {
    const [userCount, linkCount, clicksAgg] = await Promise.all([
      prisma.user.count(),
      prisma.shortLink.count(),
      prisma.shortLink.aggregate({ _sum: { clicks: true } })
    ]);

    res.json({
      users: userCount,
      links: linkCount,
      clicks: clicksAgg._sum.clicks || 0,
      uptime: '99.9%'
    });
  } catch (error) {
    console.error('Erro stats:', error);
    res.json({ users: 0, links: 0, clicks: 0, uptime: 'Offline' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email já cadastrado' });

    const { salt, hash } = hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, passwordHash: hash, salt, accountType: 'FREE' }
    });

    sendEmail(email, 'Bem-vindo ao nuturl!', `
      <div style="font-family: sans-serif; color: #020617; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h1 style="color: #d97706; margin-bottom: 20px;">Olá, ${name}!</h1>
        <p style="font-size: 16px;">Sua conta foi criada com sucesso.</p>
        <p style="font-size: 16px;">Comece a encurtar links com elegância agora mesmo.</p>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
           <small style="color: #64748b;">nuturl Inc.</small>
        </div>
      </div>
    `);

    const token = generateToken(user.id, user.accountType);
    res.json({ user: { id: user.id, email: user.email, name: user.name, accountType: user.accountType }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no registro' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash || !user.salt) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }
    if (!verifyPassword(password, user.passwordHash, user.salt)) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }
    const token = generateToken(user.id, user.accountType);
    res.json({ user: { id: user.id, email: user.email, name: user.name, accountType: user.accountType }, token });
  } catch (err) {
    res.status(500).json({ error: 'Erro no login' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  try {
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const googleData = await googleRes.json();
    if (googleData.error) throw new Error('Token Google inválido');

    const { email, name, sub: googleId } = googleData;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, googleId, accountType: 'FREE' }
      });
      sendEmail(email, 'Bem-vindo ao nuturl!', `<h1>Olá, ${name}!</h1><p>Você entrou com Google.</p>`);
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId } });
    }

    const token = generateToken(user.id, user.accountType);
    res.json({ user: { id: user.id, email: user.email, name: user.name, accountType: user.accountType }, token });
  } catch (err) {
    res.status(500).json({ error: 'Erro na autenticação Google' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  // Security by obscurity
  res.json({ message: 'Se o email existir, as instruções foram enviadas.' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;
    
    const frontendBase = process.env.FRONTEND_URL || 'https://web.nuturl.com';
    const resetLink = `${frontendBase}/reset-password?email=${encodeURIComponent(email)}`;
    
    await sendEmail(
      email,
      'Recuperação de Senha - nuturl',
      `
      <div style="font-family: sans-serif; color: #020617; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #d97706;">Recuperação de Senha</h2>
        <p>Você solicitou a redefinição de sua senha.</p>
        <a href="${resetLink}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 20px 0;">Redefinir Senha</a>
        <p><small style="color: #64748b;">Se você não solicitou isso, ignore este email.</small></p>
      </div>
      `
    );
  } catch (err) { console.error(err); }
});

app.post('/api/links', async (req, res) => {
  const { originalUrl, userId } = req.body;
  try {
    const slug = Math.random().toString(36).substring(2, 8);
    let expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    if (userId) {
       const user = await prisma.user.findUnique({ where: { id: userId }});
       if (user?.accountType === 'PREMIUM') expiresAt = null as any;
       else if (user?.accountType === 'FREE') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const link = await prisma.shortLink.create({
      data: {
        originalUrl: originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`,
        slug,
        userId: userId || null,
        expiresAt
      }
    });
    res.json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar link' });
  }
});

app.get('/api/links', authenticate, async (req: any, res) => {
  try {
    const links = await prisma.shortLink.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar links' });
  }
});

app.delete('/api/links/:id', authenticate, async (req: any, res) => {
  const { id } = req.params;
  try {
    const link = await prisma.shortLink.findUnique({ where: { id } });
    if (!link) return res.status(404).json({ error: 'Link não encontrado' });
    if (link.userId !== req.user.id) return res.status(403).json({ error: 'Proibido' });

    await prisma.shortLink.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});

app.post('/api/create-checkout', authenticate, async (req: any, res) => {
  const user = req.user;
  try {
    const preference = new Preference(mpClient);
    const frontendBase = process.env.FRONTEND_URL || 'https://web.nuturl.com';
    
    const result = await preference.create({
      body: {
        items: [{
            id: 'premium_plan_lifetime',
            title: 'nuturl Premium (Vitalício)',
            quantity: 1,
            unit_price: 29.90,
            currency_id: 'BRL',
        }],
        payer: { email: user.email },
        external_reference: user.id,
        back_urls: {
          success: `${frontendBase}/dashboard?status=success`,
          failure: `${frontendBase}/dashboard?status=failure`,
          pending: `${frontendBase}/dashboard?status=pending`
        },
        auto_return: 'approved',
        notification_url: `${API_URL}/api/webhooks/mercadopago` 
      }
    });
    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Erro Mercado Pago:', error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

app.post('/api/webhooks/mercadopago', async (req, res) => {
  const { query, body } = req;
  const topic = query.topic || query.type;
  const paymentId = query.id || query['data.id'] || body?.data?.id;

  console.log(`🔔 Webhook recebido: ${topic} - ID: ${paymentId}`);
  res.status(200).send('OK');

  if (topic === 'payment' && paymentId) {
    try {
      const paymentClient = new Payment(mpClient);
      const payment = await paymentClient.get({ id: paymentId });
      if (payment.status === 'approved') {
        const userId = payment.external_reference;
        if (userId) {
          await prisma.user.update({ where: { id: userId }, data: { accountType: 'PREMIUM' } });
          console.log(`✅ Usuário ${userId} atualizado para PREMIUM!`);
          
          const user = await prisma.user.findUnique({ where: { id: userId }});
          if (user) {
            sendEmail(user.email, 'Pagamento Aprovado!', `
              <div style="font-family: sans-serif; color: #020617; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h1 style="color: #d97706;">Você agora é Premium!</h1>
                <p>Obrigado por apoiar o nuturl.</p>
                <p>Acesse seu dashboard para ver seus novos recursos.</p>
              </div>
            `);
          }
        }
      }
    } catch (error) {
      console.error('Erro webhook:', error);
    }
  }
});

app.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const link = await prisma.shortLink.findUnique({ where: { slug }, include: { user: true } });
    if (!link) return res.status(404).send('Link não encontrado');

    prisma.shortLink.update({ where: { id: link.id }, data: { clicks: { increment: 1 } } }).catch(console.error);

    if (link.user?.accountType === 'PREMIUM') {
      return res.redirect(301, link.originalUrl);
    } else {
      const frontendBase = process.env.FRONTEND_URL || 'https://web.nuturl.com';
      return res.redirect(`${frontendBase}/?waiting=${slug}`);
    }
  } catch (err) {
    res.status(500).send('Erro interno');
  }
});

app.get('/api/links/public/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const link = await prisma.shortLink.findUnique({ 
      where: { slug },
      include: { user: { select: { id: true, name: true, email: true, accountType: true } } }
    });
    if (!link) return res.status(404).json({ error: 'Not found' });
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: 'Erro' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});