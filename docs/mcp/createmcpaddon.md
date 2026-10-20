Alexa+ MCP QuickStart Guide
This guide walks you through the prerequisites, requirements, and onboarding steps to connect your MCP server to Alexa+. For a conceptual overview of the integration architecture, see the Alexa+ MCP Toolkit Overview.

Before you begin, complete the steps in Set Up Your Development Environment.

MCP requirements for Alexa+
Make sure that your MCP server meets all the requirements in this section.

Technical requirements
Your MCP server must support Streamable HTTP. The MCP specification (2025-11-25) deprecated the standalone HTTP+SSE transport in favor of Streamable HTTP. If your MCP server currently uses the legacy SSE transport, you must migrate before connecting to Alexa+.

If you expect to provide visuals, follow the MCP Apps standard. The MCP Apps SDK (@modelcontextprotocol/ext-apps) provides Agent Skills that guide AI coding agents to scaffold a new MCP App with an interactive UI from scratch, or convert an existing OpenAI App to use MCP Apps.
If you provide a text-only customer experience, proceed with existing server integration with Alexa+.

Your MCP server must be accessible via a remote URL. During local development, you can use a tunneling service (such as cloudflared) to expose your server.
Authentication checklist
Discovery

Your MCP server returns 401 Unauthorized (without a WWW-Authenticate header) for unauthenticated requests.

Your server hosts a Protected Resource Metadata (PRM) document at the well-known URI according to RFC 9728.

Your auth server metadata is available at /.well-known/oauth-authorization-server.

code_challenge_methods_supported must be present and must include S256. Account linking won't proceed without it.

Authorization Request

Required: Use OAuth 2.1 authorization code flow with PKCE (S256).

Required: Set the resource parameter to your MCP server's canonical URI.

Required: Include scopes from scopes_supported in the PRM document. Omit scope if scopes_supported is undefined.

Token Request

Required: Include the resource parameter.

Required: Include the PKCE code_verifier.

Token Usage

Required: Send the Bearer token in the Authorization header on every authenticated request.

Required: Don't send the Bearer token in the query string.

Not Supported Yet

Dynamic Client Registration (DCR)

Client ID Metadata Documents (CIMD)

OpenID Connect (OIDC)

Step-Up Authorization.

WWW-Authenticate header in 401 responses.

Performance
Your MCP server must meet a round-trip query response latency of less than 500 ms.

Security and data policies
 Note: Security and data policy details will be published in a future revision of this guide.
Media (audio and video codecs)
Audio

AAC LC, HE-AACv1, HE-AACv2 (enhanced AAC+), xHE-AAC, AAC ELD (enhanced low delay AAC), AMR-NB, AMR-WB, FLAC, MIDI, MP3, Opus, PCM/WAVE, Vorbis
Video

H.264/AVC, H.265/HEVC, AV1, VP9 / VP8, MPEG4, MPEG2, JPEG, VVC, LCEVC, WebP
Connect your MCP server to Alexa+
You can onboard your MCP server to Alexa+ using the Alexa AI CLI. If you use an AI coding agent (Claude Code, Kiro, Codex, Cursor), install the Add-on Agent Skill for faster onboarding.

Step 1. Download and install CLI and authenticate

After you install CLI, authenticate with your Alexa developer account:

alexa-ai configure
This opens a browser for Login with Amazon (LWA) OAuth. Credentials are stored at ~/.alexa-ai/credentials. Use --no-browser for headless/SSH environments.

After you authenticate the CLI, choose whether to create your add-on using an AI agent, or create the add-on manually.

Path A: Add-on Agent Skill (recommended)
Path B: Alexa AI CLI (manual)
Path A: Add-on Agent Skill (recommended)
The Add-on Agent Skill guides your AI coding agent through the entire onboarding process. It works in Claude Code, Kiro, Cursor, VS Code Copilot, or any coding agent with shell access.

Terminal window showing how you can create your add-on using an agent
Click to enlarge
Step 2 — Prompt your coding agent

Open your coding agent and provide your MCP server URL:

I have an MCP server at https://mcp.example.com for a hotel booking service.

Help me create an Alexa+ add-on.
Step 3 — The skill walks you through the following phases

MCP Introspection — Gets you authenticated with your developer account. Connects to your MCP server via JSON-RPC 2.0 (Streamable HTTP), discovers tools and resources, proposes an Add-on name. You confirm the name before proceeding.
Add-on Scaffolding — Runs alexa-ai new mcp to create the project structure, fills in capability-derived descriptions (shortDescription, fullDescription, examplePhrases) derived from your MCP server. You review and approve.
Media Assets & Compliance — Collects your privacy policy URL, terms of use URL, and required media assets (icon sizes + carousel image). Runs full validation.
Deploy — Deploys your add-on to the development stage after you confirm. Returns your Add-on ID and enables testing in the web simulator.
Submit — Submits your add-on for certification after you have tested your add-on in the web simulator.
Path B: Alexa AI CLI (manual)
If you prefer to work without an AI coding agent, use the Alexa AI CLI directly.

Terminal window showing how to create the add-on using the CLI manually
Click to enlarge
Step 2 — Scaffold your add-on

alexa-ai new mcp --name "Hotel Finder" --locale en-US --mcp-server-url "https://mcp.example.com"
This creates the project directory with addon-package/addon.json.

Step 3 — Edit addon.json

Open addon-package/addon.json and fill in:

shortDescription (≤123 characters)
fullDescription (≤4000 characters)
examplePhrases (3–4 phrases, each ≤200 characters)
privacyAndCompliance.privacyPolicyUrl
privacyAndCompliance.termsOfUseUrl
mediaAssets (see addon.json schema reference below)
Step 4 — Deploy

alexa-ai deploy
The CLI uploads your package, builds it, and deploys to the development stage. On success, it returns your Add-on ID and version.

addon.json schema reference
The addon-package/addon.json file uses the following schema:

{
  "manifestVersion": "1.0",
  "storeListing": {
    "distributionCountries": ["US"],
    "locales": {
      "en-US": {
        "default": "DEFAULT",
        "name": {
          "value": "Travel",
          "spokenForm": { "format": "ipa", "value": " " }
        },
        "shortDescription": "Search and book flights, hotels, and vacation packages",
        "fullDescription": "Search and book flights, hotels, and vacation packages. Compare prices across airlines and hotel chains. Book vacation packages.",
        "examplePhrases": [
          "Search hotels in Brisbane",
          "Search for flights from Seattle to Brisbane",
          "Find vacation packages to Hawaii"
        ],
        "privacyAndCompliance": {
          "privacyPolicyUrl": "https://example.com/privacy",
          "termsOfUseUrl": "https://example.com/terms"
        },
        "mediaAssets": {
          "icons": {
            "light": [
              { "size": "72x72", "uri": "https://example.com/icon-72x72.png" },
              { "size": "64x64", "uri": "https://example.com/icon-64x64.png" },
              { "size": "88x88", "uri": "https://example.com/icon-88x88.png" },
              { "size": "126x126", "uri": "https://example.com/icon-126x126.png" },
              { "size": "180x180", "uri": "https://example.com/icon-180x180.png" },
              { "size": "241x241", "uri": "https://example.com/icon-241x241.png" }
            ],
            "dark": []
          },
          "carouselImages": [
            { "uri": "https://example.com/carousel-1.png", "altText": "Hotel search results", "size": "600x900" }
          ],
          "bannerImages": []
        }
      }
    }
  },
  "integrations": [
    {
      "type": "MCP",
      "config": {
        "endpoints": {
          "default": {
            "type": "HTTPS",
            "uri": "https://mcp.example.com"
          }
        }
      }
    }
  ]
}
All image URIs must use HTTPS and be PNG, JPG, JPEG, or WEBP format.

Field Constraints

Field	Type	Required?	Constraint
manifestVersion	String	Yes	Always "1.0"
storeListing.distributionCountries	Array	Yes	ISO country codes (for example, ["US"])
name.value	String	Yes	≤30 characters
name.spokenForm	Object	No	IPA pronunciation for voice invocation
shortDescription	String	Yes	≤123 characters
fullDescription	String	Yes	≤4000 characters
examplePhrases	Array	Yes	3–4 items, each ≤200 characters
privacyPolicyUrl	String	Yes	Valid HTTPS URL
termsOfUseUrl	String	Yes	Valid HTTPS URL
mediaAssets.icons.light	Array	Yes	All 6 sizes required: 72x72, 64x64, 88x88, 126x126, 180x180, 241x241
mediaAssets.icons.dark	Array	No	Same 6 sizes if provided
mediaAssets.carouselImages	Array	Yes	At least 1 image (600x900), altText ≤250 chars
mediaAssets.bannerImages	Array	No	1200x600, altText ≤250 chars
integrations[].type	String	Yes	"MCP" for MCP Toolkit add-ons
integrations[].config.endpoints.default.type	String	Yes	"HTTPS"
integrations[].config.endpoints.default.uri	String	Yes	Your MCP server endpoint URL
After onboarding
Once deployed, your add-on is available in the development stage. You can do the following:

Test your add-on using the web simulator or on a physical device (see Test Your MCP Add-ons).
Make changes to addon.json and redeploy with alexa-ai deploy.
Submit for certification when ready with alexa-ai submit.
If you modify tools, configurations, or other details in your MCP server, redeploy your add-on with alexa-ai deploy. Alexa+ refreshes tool information only on deployment.

The developer console shows your current add-ons.

Developer console showing multiple add-ons
