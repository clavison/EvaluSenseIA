# EvalusenseIA 🚀

**Projeto desenvolvido durante a Imersão IA — Alura + Google**, explorando o poder da API Gemini para criar uma aplicação prática e didática que automatiza a correção de avaliações de programação.

Este repositório contém um **projeto Angular standalone** que integra diretamente com o GitHub e a **Google Generative AI (Gemini 1.5 Flash)**, demonstrando como transformar prompts em feedbacks estruturados, notas e insights automáticos.

---

## 🌟 Funcionalidades

### Integração com Gemini
- Conexão direta com o modelo **gemini-1.5-flash** utilizando a SDK oficial do Google Generative AI.

### Execução de prompts
- Cada prompt é enviado ao modelo e retorna um **JSON estruturado**, contendo:
  - Branch analisada
  - Nota da avaliação
  - Feedback detalhado com critérios de correção

### Formatação automática
- Respostas válidas em JSON são exibidas já formatadas em um `<textarea>` para **fácil leitura e cópia**.

### Gerar/Regenerar prompts
- Possibilidade de criar novos conjuntos de prompts.
- Prompts anteriores permanecem visíveis até a conclusão da nova execução.
- A tela se atualiza automaticamente após a resposta.

### Copiar resultados
- Com um clique, é possível copiar:
  - O prompt original
  - A saída da IA já formatada

### Feedback orientado
- Avaliação de projetos de programação com foco em:
  - Funcionalidade
  - Boas práticas (DTOs, mappers, arquitetura)
  - Implementação de testes
  - Uso de conceitos avançados (ex.: HATEOAS)

---

## 🔄 Fluxo de uso

1. **Configuração para o GitHub**
   - Informe seu usuário GitHub, token e repositório a ser avaliado.

2. **Configuração da chave Gemini**
   - Insira seu token de acesso à API Gemini.
   - O `GeminiApiService` inicializa a SDK com essa chave.

3. **Execução de um prompt**
   - Selecione ou gere um prompt.
   - Clique em **Executar**.
   - A resposta é recebida e exibida, mostrando o status da execução enquanto aguarda o retorno.

4. **Recebimento e exibição da resposta**
   - JSON válido → formatado com indentação.
   - Caso contrário → exibido em texto cru.
   - Resultado aparece no painel de saída com opção de cópia.

5. **Geração/Regeneração de prompts**
   - Novo conjunto de prompts é criado.
   - Prompts antigos permanecem visíveis até a finalização.
   - A tela se atualiza automaticamente após a resposta.

---

## 🛠️ Tecnologias utilizadas

- [Angular 18](https://angular.io/) (Standalone Components)
- [TypeScript](https://www.typescriptlang.org/)
- [Google Generative AI SDK](https://developers.generativeai.google/)
- [RxJS](https://rxjs.dev/) para controle de assinaturas
- [API GitHub](https://docs.github.com/en/rest)
- HTML, CSS e SCSS

---

## ⚙️ Configurações necessárias

### 1. Chave Google Generative AI
- Necessário ter uma chave de API do Google Generative AI.
- Crie ou acesse sua chave em: [Google AI Studio](https://studio.google.com/)
- Insira a chave no campo indicado na interface do projeto.

### 2. Chave GitHub
- Necessário ter uma chave de API do GitHub.
- Crie ou acesse sua chave:  
  `Perfil do usuário → Configurações → Configurações de desenvolvimento → Tokens`
- Insira a chave no campo indicado na interface do projeto.

---

## 📚 Créditos

Este projeto foi construído no contexto da **Imersão IA — Alura + Google**, uma experiência que uniu educação e inteligência artificial para capacitar desenvolvedores no uso prático das tecnologias mais avançadas de IA.

- [Alura](https://www.alura.com.br/)
- [Google](https://developers.google.com/)

---

## 💡 Observações

- **Foco educacional e experimental**: este projeto demonstra como a IA pode auxiliar no aprendizado e avaliação em programação.
- Ideal para desenvolvedores que querem explorar integração de IA generativa com fluxos de desenvolvimento reais.
- Pode ser adaptado para múltiplos tipos de avaliação e feedback.

---

## 📌 Como rodar o projeto localmente

1. Clone este repositório:
```bash
git clone https://github.com/seu-usuario/evalusenseia.git
````

2. Instale as dependências:

```bash
npm install
```

3. Execute a aplicação:

```bash
ng serve
```

4. Abra no navegador: `http://localhost:4200`

---

## 🔗 Links úteis

* [Documentação Angular](https://angular.io/docs)
* [Documentação Google Generative AI](https://developers.generativeai.google/)
* [Documentação GitHub API](https://docs.github.com/en/rest)
