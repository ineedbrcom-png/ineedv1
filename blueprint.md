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

## Style Guidelines:

-   **Primary color**: `#29ABE2` (Vibrant Blue)
-   **Background color**: `#F0F8FF` (Alice Blue)
-   **Accent color**: `#FFB347` (Warm Orange)
-   **Font**: 'Inter', sans-serif.
