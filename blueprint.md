# iNeed Marketplace Blueprint

## Core Features:

- **Service and Product Listing**: Allow users to post requests for services or products they need, detailing requirements, budget, and location. When creating the listing, use an AI tool to help refine the user's description.
- **User Authentication and Profiles**: Enable secure user registration, login, and profile management, allowing users to showcase their skills or needs. The profile shall contain verification badges for email, phone and document.
- **Category and Sub-category Browsing**: Enable browsing the requests using categories and sub-categories.
- **Search and Filter**: Implement a robust search functionality with filters to refine requests based on keywords, location, budget, and categories.
- **Real-Time Notifications**: Push notifications to inform users about new offers, messages, and updates related to their requests or services.
- **AI-Powered Recommendation**: An AI tool suggests related service providers to a potential client and vice versa.
- **Interactive Map Integration**: Display active requests on an interactive map, enabling users to visualize and engage with local opportunities.

### New: Proposal & Bidding System

To facilitate interaction between clients and service providers, a formal proposal system will be implemented.

1.  **Submitting a Proposal**:
    *   A service provider can find a request they are interested in via browsing or searching.
    *   From the request detail page, the provider can initiate a conversation with the client.
    *   Within the chat interface, the provider will have an option to "Send a Formal Proposal".
    *   The proposal form will include fields for:
        *   **Price**: The amount the provider is charging for the service/product.
        *   **Deadline/Delivery Time**: The estimated time to complete the work.
        *   **Conditions/Message**: A personalized message detailing the scope of work, what is included, payment conditions, etc.

2.  **Receiving and Reviewing Proposals**:
    *   The client receives the proposal as a special message card within their chat window with the provider.
    *   The client can review the details of the proposal.
    *   The client has two primary actions: **Accept** or **Reject**.

3.  **Accepting a Proposal**:
    *   When a client accepts a proposal, the system marks that proposal as "Accepted".
    *   Any other pending proposals for the same request from other providers can be automatically marked as "Not selected" or the client can be prompted to do so.
    *   Accepting a proposal unlocks the next step: **Contract Generation**.

4.  **Contract Generation**:
    *   Upon proposal acceptance, either party can generate a digital contract based on the agreed-upon terms (price, deadline, conditions).
    *   This contract is also sent as a special message card in the chat, requiring the other party's digital acceptance to become binding within the platform.

5.  **Payment and Completion**:
    *   (Future Scope) Once a contract is accepted, a secure payment flow can be initiated.
    *   After the work is delivered and approved by the client, the project is marked as "Completed", and both parties are prompted to leave a review.

## Fluxo de Verificação de Documentos

Para aumentar a segurança e a confiança na plataforma, será implementado um fluxo de verificação de documentos.

1.  **Segurança no Upload e Armazenamento**:
    *   **Upload**: O usuário fará o upload de seu documento (ex: RG, CNH) através de uma interface segura no seu perfil. O upload será feito diretamente para um bucket privado no Google Cloud Storage.
    *   **Armazenamento**: Os arquivos serão armazenados no Cloud Storage com regras de segurança estritas, permitindo o acesso apenas à função de back-end (Cloud Function) responsável pela verificação e a um número limitado de administradores autorizados. Os documentos não serão publicamente acessíveis.
    *   **Retenção**: Após a verificação (bem-sucedida ou não), o arquivo de imagem do documento será excluído permanentemente para minimizar a retenção de dados sensíveis. Apenas o resultado (verificado: sim/não) será armazenado no perfil do usuário no Firestore.

2.  **Privacidade e Conformidade com a LGPD**:
    *   **Consentimento**: O usuário deverá consentir explicitamente com o uso de seu documento para fins de verificação de identidade antes de fazer o upload.
    *   **Finalidade**: O uso do documento será estritamente para a finalidade de verificação de identidade e não será compartilhado com terceiros ou outros usuários.
    *   **Direito de Exclusão**: Em conformidade com a LGPD, os usuários terão o direito de solicitar a exclusão de seus dados. Como o documento original será excluído após a verificação, o processo focará na exclusão dos dados de perfil.

3.  **Processo de Verificação (Fase Inicial - Manual)**:
    *   **Upload e Notificação**: Após o upload, uma tarefa será adicionada a uma fila de verificação manual.
    *   **Interface de Admin**: Uma interface de administração interna e segura será desenvolvida para que a equipe do iNeed possa revisar os documentos pendentes.
    *   **Aprovação/Rejeição**: O administrador revisará o documento, comparando-o com os dados do perfil (nome, CPF), e aprovará ou rejeitará a verificação.
    *   **Atualização do Status**: Após a decisão, o status `isDocumentVerified` no perfil do usuário no Firestore será atualizado para `true` ou `false`, e o usuário será notificado.
    *   **(Futuro)**: Em uma fase posterior, pode-se avaliar a integração com um serviço de verificação de identidade automatizado (ex: usando a API Vision do Google para OCR e validação) para escalar o processo.

## Style Guidelines:

-   **Primary color**: `#29ABE2` (Vibrant Blue)
-   **Background color**: `#F0F8FF` (Alice Blue)
-   **Accent color**: `#FFB347` (Warm Orange)
-   **Font**: 'Inter', sans-serif.
