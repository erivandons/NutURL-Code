
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'pt';

const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      logout: "Logout",
      login: "Login",
      home: "Home"
    },
    home: {
      hero_title_1: "Shorten with",
      hero_title_2: "class.",
      hero_desc: "Transform long links into short, elegant URLs. Impeccable performance with Premium design for demanding creators.",
      input_placeholder: "Paste your long link here...",
      shorten_btn: "Shorten",
      processing: "Processing...",
      link_ready: "YOUR LINK IS READY",
      copy: "Copy",
      visit: "Visit",
      validity_premium: "forever",
      validity_free: "1 year",
      validity_guest: "6 months",
      create_account_hint: "Create an account for lifetime links.",
      premium_ad_remove: "Your Premium account automatically removes ads.",
      stats_clicks: "Total Clicks",
      stats_links: "Active Links",
      stats_users: "Users",
      stats_uptime: "Uptime"
    },
    login: {
      create_title: "Create your account",
      welcome_title: "Welcome back",
      create_desc: "Start shortening links with prestige.",
      welcome_desc: "Manage your links and analytics.",
      google_fail: "Failed to authenticate with Google",
      or_email: "OR CONTINUE WITH EMAIL",
      name_label: "NAME",
      name_placeholder: "Your name",
      email_label: "E-MAIL",
      pass_label: "PASSWORD",
      forgot_pass: "Forgot password?",
      btn_create: "Create Account",
      btn_login: "Login",
      have_account: "Already have an account?",
      no_account: "Don't have an account?",
      action_login: "Login",
      action_create: "Create now",
      recover_title: "Recover Password",
      recover_desc: "Enter your email to receive the link.",
      btn_send: "Send Link",
      btn_back: "Back",
      recover_success: "If the email exists, instructions have been sent.",
      recover_error: "Error requesting recovery."
    },
    dashboard: {
      welcome: "Welcome,",
      subtitle: "Manage your digital assets.",
      plan_label: "YOUR PLAN",
      plan_free: "FREE",
      plan_premium: "PREMIUM (LIFETIME)",
      upgrade_btn: "Upgrade ($5.90)", 
      manage_btn: "Manage",
      card_links: "LINKS CREATED",
      card_clicks: "TOTAL CLICKS",
      card_growth: "MONTHLY GROWTH",
      filter_placeholder: "Filter by URL or slug...",
      filter_title: "Your Links",
      table_orig: "ORIGINAL LINK",
      table_short: "SHORTENED",
      table_clicks: "CLICKS",
      table_exp: "EXPIRATION",
      table_actions: "ACTIONS",
      no_links: "No links found. Start shortening on the home page!",
      delete_confirm: "Are you sure you want to delete this link?",
      delete_error: "Error deleting link",
      payment_error: "Error starting payment. Try again.",
      downgrade_alert: "To cancel, contact support or manage via Mercado Pago panel."
    },
    waiting: {
      title: "Safe Destination.",
      desc_1: "You are being redirected via",
      desc_2: "Wait while we validate the destination digital certificate.",
      btn_verifying: "Verifying...",
      btn_go: "Access Link",
      validating: "Validating encryption...",
      vip_title: "VIP ACCESS",
      vip_desc: "Premium members skip this screen instantly.",
      sponsors: "SPONSORS",
      error_title: "Oops! Broken link.",
      btn_home: "Back to Home",
      loading: "Loading...",
      redirecting: "Redirecting Premium Direct..."
    },
    ads: {
      space: "AD SPACE"
    },
    legal: {
      privacy_title: "Privacy Policy",
      cookies_title: "Cookie Policy",
      updated: "Last updated: October 26, 2024",
      privacy_intro: "At nuturl, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.",
      
      section_1_title: "1. Collection of Information",
      section_1_text: "We may collect information about you in a variety of ways. The information we may collect on the Site includes: Personal Data (Name, email address) that you voluntarily give to us when you register. Derivative Data (IP address, browser type, operating system, access times) automatically collected when you access the Site.",
      
      section_2_title: "2. Use of Your Information",
      section_2_text: "Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We use information to: Create and manage your account, Process payments (via secure third-party processors like Mercado Pago), Email you regarding your account or order, Enable user-to-user communications, and Compile anonymous statistical data.",
      
      section_3_title: "3. Google AdSense & DoubleClick Cookie",
      section_3_text: "Google, as a third-party vendor, uses cookies to serve ads on our Site. Google's use of the DART cookie enables it to serve ads to our users based on their visit to our Site and other sites on the Internet. Users may opt-out of the use of the DART cookie by visiting the Google ad and content network privacy policy.",
      
      section_4_title: "4. Disclosure of Your Information",
      section_4_text: "We may share information we have collected about you in certain situations. Your information may be disclosed as follows: By Law or to Protect Rights, or with Third-Party Service Providers (Payment processing, data analysis, email delivery). We do not sell your personal data to marketing agencies.",
      
      section_5_title: "5. Security of Your Information",
      section_5_text: "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.",

      cookies_intro: "This Cookie Policy explains what cookies are and how we use them. You should read this policy so you can understand what type of cookies we use, or the information we collect using cookies and how that information is used.",
      
      c_section_1_title: "1. What are Cookies?",
      c_section_1_text: "Cookies are small text files that are sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.",
      
      c_section_2_title: "2. How nuturl uses Cookies",
      c_section_2_text: "When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes: To enable certain functions of the Service (Authentication), to provide analytics, to store your preferences, and to enable advertisements delivery, including behavioral advertising.",
      
      c_section_3_title: "3. Third-party Cookies",
      c_section_3_text: "In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on. This includes Google Analytics and Google AdSense.",
      
      c_section_4_title: "4. Your Choices",
      c_section_4_text: "If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly."
    }
  },
  pt: {
    nav: {
      dashboard: "Painel",
      logout: "Sair",
      login: "Entrar",
      home: "Início"
    },
    home: {
      hero_title_1: "Encurte com",
      hero_title_2: "classe.",
      hero_desc: "Transforme links longos em URLs curtas e elegantes. Performance impecável com design Premium para criadores exigentes.",
      input_placeholder: "Cole seu link longo aqui...",
      shorten_btn: "Encurtar",
      processing: "Processando...",
      link_ready: "SEU LINK PRONTO",
      copy: "Copiar",
      visit: "Visitar",
      validity_premium: "sempre",
      validity_free: "1 ano",
      validity_guest: "6 meses",
      create_account_hint: "Crie uma conta para links vitalícios.",
      premium_ad_remove: "Sua conta Premium remove anúncios automaticamente.",
      stats_clicks: "Total de Cliques",
      stats_links: "Links Ativos",
      stats_users: "Usuários",
      stats_uptime: "Uptime"
    },
    login: {
      create_title: "Crie sua conta",
      welcome_title: "Bem-vindo de volta",
      create_desc: "Comece a encurtar links com prestígio.",
      welcome_desc: "Gerencie seus links e analytics.",
      google_fail: "Falha ao autenticar com Google",
      or_email: "OU CONTINUE COM EMAIL",
      name_label: "NOME",
      name_placeholder: "Seu nome",
      email_label: "E-MAIL",
      pass_label: "SENHA",
      forgot_pass: "Esqueceu a senha?",
      btn_create: "Criar Conta",
      btn_login: "Entrar",
      have_account: "Já tem uma conta?",
      no_account: "Não tem uma conta?",
      action_login: "Entrar",
      action_create: "Criar agora",
      recover_title: "Recuperar Senha",
      recover_desc: "Digite seu email para receber o link.",
      btn_send: "Enviar Link",
      btn_back: "Voltar",
      recover_success: "Se o email existir, as instruções foram enviadas.",
      recover_error: "Erro ao solicitar recuperação."
    },
    dashboard: {
      welcome: "Bem-vindo,",
      subtitle: "Gerencie seus ativos digitais.",
      plan_label: "SEU PLANO",
      plan_free: "GRATUITO",
      plan_premium: "PREMIUM (VITALÍCIO)",
      upgrade_btn: "Fazer Upgrade (R$ 29,90)",
      manage_btn: "Gerenciar",
      card_links: "LINKS CRIADOS",
      card_clicks: "TOTAL DE CLIQUES",
      card_growth: "CRESCIMENTO MÊS",
      filter_placeholder: "Filtrar por URL ou slug...",
      filter_title: "Seus Links",
      table_orig: "LINK ORIGINAL",
      table_short: "ENCURTADO",
      table_clicks: "CLIQUES",
      table_exp: "EXPIRAÇÃO",
      table_actions: "AÇÕES",
      no_links: "Nenhum link encontrado. Comece a encurtar na página inicial!",
      delete_confirm: "Tem certeza que deseja apagar este link?",
      delete_error: "Erro ao apagar link",
      payment_error: "Erro ao iniciar pagamento. Tente novamente.",
      downgrade_alert: "Para cancelar, entre em contato com o suporte ou gerencie no painel do Mercado Pago."
    },
    waiting: {
      title: "Destino Seguro.",
      desc_1: "Você está sendo redirecionado via",
      desc_2: "Aguarde enquanto validamos o certificado digital do destino.",
      btn_verifying: "Verificando...",
      btn_go: "Acessar Link",
      validating: "Validating encryption...",
      vip_title: "VIP ACCESS",
      vip_desc: "Membros Premium pulam esta tela instantaneamente.",
      sponsors: "PATROCINADORES",
      error_title: "Ops! Link quebrado.",
      btn_home: "Voltar para o Início",
      loading: "Carregando...",
      redirecting: "Redirecionando Premium Direct..."
    },
    ads: {
      space: "ESPAÇO PUBLICITÁRIO"
    },
    legal: {
      privacy_title: "Política de Privacidade",
      cookies_title: "Política de Cookies",
      updated: "Última atualização: 26 de Outubro, 2024",
      privacy_intro: "Na nuturl, levamos sua privacidade a sério. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você visita nosso site. Ao usar o serviço, você concorda com a coleta e uso de informações de acordo com esta política.",
      
      section_1_title: "1. Coleta de Informações",
      section_1_text: "Podemos coletar informações sobre você de várias maneiras. As informações que podemos coletar incluem: Dados Pessoais (Nome, endereço de e-mail) que você nos fornece voluntariamente ao se registrar. Dados Derivados (Endereço IP, tipo de navegador, sistema operacional, horários de acesso) coletados automaticamente quando você acessa o Site.",
      
      section_2_title: "2. Uso de Suas Informações",
      section_2_text: "Ter informações precisas sobre você nos permite fornecer uma experiência suave, eficiente e personalizada. Usamos as informações para: Criar e gerenciar sua conta, Processar pagamentos (via processadores seguros de terceiros como Mercado Pago), Enviar e-mail sobre sua conta ou pedido, Habilitar comunicações entre usuários e Compilar dados estatísticos anônimos.",
      
      section_3_title: "3. Google AdSense e Cookie DoubleClick",
      section_3_text: "O Google, como fornecedor terceirizado, usa cookies para exibir anúncios em nosso Site. O uso do cookie DART pelo Google permite que ele exiba anúncios para nossos usuários com base em sua visita ao nosso Site e outros sites na Internet. Os usuários podem optar por não usar o cookie DART visitando a política de privacidade da rede de anúncios e conteúdo do Google.",
      
      section_4_title: "4. Divulgação de Suas Informações",
      section_4_text: "Podemos compartilhar informações que coletamos sobre você em certas situações. Suas informações podem ser divulgadas da seguinte forma: Por Lei ou para Proteger Direitos, ou com Provedores de Serviços Terceirizados (Processamento de pagamentos, análise de dados, entrega de e-mail). Não vendemos seus dados pessoais para agências de marketing.",
      
      section_5_title: "5. Segurança de Suas Informações",
      section_5_text: "Usamos medidas de segurança administrativas, técnicas e físicas para ajudar a proteger suas informações pessoais. Embora tenhamos tomado medidas razoáveis para proteger as informações pessoais que você nos fornece, esteja ciente de que, apesar de nossos esforços, nenhuma medida de segurança é perfeita ou impenetrável.",

      cookies_intro: "Esta Política de Cookies explica o que são cookies e como os usamos. Você deve ler esta política para entender que tipo de cookies usamos, ou as informações que coletamos usando cookies e como essas informações são usadas.",
      
      c_section_1_title: "1. O que são Cookies?",
      c_section_1_text: "Cookies são pequenos arquivos de texto enviados para o seu navegador por um site que você visita. Um arquivo de cookie é armazenado no seu navegador e permite que o Serviço ou um terceiro o reconheça e torne sua próxima visita mais fácil e o Serviço mais útil para você.",
      
      c_section_2_title: "2. Como a nuturl usa Cookies",
      c_section_2_text: "Quando você usa e acessa o Serviço, podemos colocar vários arquivos de cookies no seu navegador. Usamos cookies para os seguintes fins: Habilitar certas funções do Serviço (Autenticação), fornecer análises (Analytics), armazenar suas preferências e permitir a entrega de anúncios, incluindo publicidade comportamental.",
      
      c_section_3_title: "3. Cookies de Terceiros",
      c_section_3_text: "Além de nossos próprios cookies, também podemos usar vários cookies de terceiros para relatar estatísticas de uso do Serviço, entregar anúncios no e através do Serviço, e assim por diante. Isso inclui Google Analytics e Google AdSense.",
      
      c_section_4_title: "4. Suas Escolhas",
      c_section_4_text: "Se você quiser excluir cookies ou instruir seu navegador a excluir ou recusar cookies, visite as páginas de ajuda do seu navegador. Observe, no entanto, que se você excluir cookies ou se recusar a aceitá-los, poderá não conseguir usar todos os recursos que oferecemos, poderá não conseguir armazenar suas preferências e algumas de nossas páginas podem não ser exibidas corretamente."
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 'en' as requested
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('nuturl_lang') as Language;
    if (saved && (saved === 'en' || saved === 'pt')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('nuturl_lang', lang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation missing for key: ${path} in language: ${language}`);
        return path;
      }
      current = current[key];
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
