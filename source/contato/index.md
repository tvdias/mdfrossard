---
title: Entre em Contato | Fale Conosco
layout: layout.ejs
description: Veja como entrar em contato com a nossa clínica. É possível ligar, mandar mensagem por WhatsApp ou enviar e-mail.
---

<!-- Page Mini Hero -->
<section class="page-hero">
    <div class="page-hero-bg"></div>
    <div class="container page-hero-content reveal">
        <h1>Fale Conosco</h1>
        <p>Estamos prontos para atender você e sua família.</p>
    </div>
</section>

<!-- Contact Section -->
<section class="contact-page section">
    <div class="container">
        <div class="contact-grid">
            <div class="contact-info-panel reveal">
                <h2>Canais de Atendimento</h2>
                <p>Escolha a forma mais conveniente para você:</p>
                
                <div class="contact-methods mt-4">
                    <div class="contact-method-item">
                        <div class="method-icon"><i data-lucide="phone"></i></div>
                        <div>
                            <h4>Telefones</h4>
                            <p>(21) 3217-0430<br>(21) 2266-5955</p>
                        </div>
                    </div>
                    <div class="contact-method-item">
                        <div class="method-icon"><i data-lucide="smartphone"></i></div>
                        <div>
                            <h4>WhatsApp</h4>
                            <p>(21) 97663-7803</p>
                            <a href="https://api.whatsapp.com/send?phone=55021976637803" target="_blank" class="btn btn-sm btn-outline mt-2">Mande um oi</a>
                        </div>
                    </div>
                    <div class="contact-method-item">
                        <div class="method-icon"><i data-lucide="mail"></i></div>
                        <div>
                            <h4>E-mail</h4>
                            <p>contato@mdfrossard.com.br</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-image reveal delay-1">
                <img src="/images/hero-img.jpg" alt="Atendimento MD Frossard" class="img-fluid rounded shadow-lg">
            </div>
        </div>
    </div>
</section>

<style>
.contact-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 60px;
    align-items: center;
}

@media (min-width: 992px) {
    .contact-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.contact-method-item {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f8f6;
    border-radius: 12px;
    transition: transform 0.3s;
}

.contact-method-item:hover {
    transform: translateX(10px);
}

.method-icon {
    width: 50px;
    height: 50px;
    background: #c9a84c;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.contact-method-item h4 {
    margin-bottom: 5px;
    font-size: 1.1rem;
}

.contact-method-item p {
    color: #666;
    margin: 0;
}
</style>