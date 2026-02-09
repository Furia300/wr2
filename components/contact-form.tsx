"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    empresa: "",
    whatsapp: "",
    mensagem: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/contato@grupowr2servicos.com.br",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: formData.nome,
            email: formData.email,
            empresa: formData.empresa,
            whatsapp: formData.whatsapp,
            mensagem: formData.mensagem,
            _subject: "Nova cotação - Site WR2",
          }),
        }
      );

      if (response.ok) {
        setStatus("success");
        setFormData({ nome: "", email: "", empresa: "", whatsapp: "", mensagem: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section id="contato" className="contact-form-section">
      <div className="contact-form-container">
        <div className="contact-form-header">
          <h2 className="contact-form-title">
            Solicite uma cotação gratuita
          </h2>
          <p className="contact-form-subtitle">
            Entre em contato com nossos especialistas para mais informações
          </p>
        </div>

        <div className="contact-form-wrapper">
          <div className="contact-form-image-wrap">
            <img
              src="/images/homens-terno.png?v=3"
              alt="Equipe WR2"
              className="contact-form-image"
            />
            <div className="contact-form-image-overlay" aria-hidden />
          </div>

          <form
            onSubmit={handleSubmit}
            className="contact-form"
          >
            <div className="contact-form-field">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form-field">
              <label htmlFor="empresa">Empresa</label>
              <input
                id="empresa"
                name="empresa"
                type="text"
                placeholder="Nome fantasia"
                value={formData.empresa}
                onChange={handleChange}
              />
            </div>

            <div className="contact-form-field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="(011) 99999-9999"
                value={formData.whatsapp}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form-field">
              <label htmlFor="mensagem">Mensagem</label>
              <textarea
                id="mensagem"
                name="mensagem"
                placeholder="Sua mensagem"
                rows={4}
                value={formData.mensagem}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="contact-form-submit"
              disabled={status === "sending"}
            >
              {status === "sending"
                ? "Enviando..."
                : status === "success"
                  ? "Enviado!"
                  : "FALAR COM ESPECIALISTA"}
            </button>

            {status === "success" && (
              <p className="contact-form-success">
                Mensagem enviada com sucesso! Entraremos em contato em breve.
              </p>
            )}
            {status === "error" && (
              <p className="contact-form-error">
                Erro ao enviar. Tente novamente ou entre em contato pelo
                WhatsApp.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
