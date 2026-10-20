Alexa+ MCP Toolkit Overview
The Model Context Protocol (MCP) is an open standard that lets AI assistants discover and use external tools and services. With the Alexa+ MCP Toolkit, you can connect your MCP server to Alexa+, giving customers access to your capabilities through voice and visual interactions on Alexa-enabled devices.

To get started, see Create an MCP Add-on.

 Note: The MCP Toolkit is available in the United States.
Overview
You can bring your existing MCP server built for other AI hosts, or build a new MCP server that exposes your service's capabilities. Alexa+ acts as the MCP client. You return standard MCP responses, and Alexa+ handles natural language understanding, response generation, and user interface (UI) rendering. Alexa+ for Builders supports the 2025-11-25 version of the MCP specification.

Alexa+ also supports the MCP Apps extension, enabling you to render interactive UIs for MCP tools directly in the conversation view. This is useful when text-only responses fall short or when data is too complex for native views. Examples include layered map information, multi-step flows, games, immersive learning experiences, or dashboards. Rendering these views inline keeps users engaged within a single, trusted interaction point. You can onboard your existing MCP Apps and use a webview provided by Alexa+ to deliver rich visuals.

How it all connects
To make your MCP server available to Alexa+ customers, you create an Alexa+ MCP add-on. This add-on acts as a bridge between your MCP server and Alexa+, handling tool discovery and protocol translation so that Alexa+ can seamlessly understand and invoke your capabilities.

Your MCP server defines the tools, resources, and prompts you want to expose. You deploy and configure your Alexa+ add-on using the add-on Agent Skill (agentic onboarding experience) or directly with the Alexa AI CLI. On the Alexa+ side, an add-on registry and discovery layer detects your registered capabilities. The Alexa+ AI reasoning determines when and how to invoke them based on customer intent. The orchestrator coordinates between discovery, reasoning, and the customer to deliver a natural and intelligent experience.

At runtime, when a customer makes a request intended for your service, Alexa+ routes the request through your add-on to your MCP server using streamable HTTP. It invokes the appropriate tools and returns the result back to the customer. If you modify tools, configurations, or other MCP server details, redeploy your add-on with alexa-ai deploy. Your new tools and other changes take effect after redeployment.

Architecture components

Component	Role
MCP Server	Your service: defines and exposes tools, resources, and prompts over streamable HTTP.
Alexa+ MCP Add-on	The bridge you deploy: registers your capabilities with Alexa+ and handles protocol translation.
Add-on Registry	Alexa+ discovery layer that detects and indexes your registered tools.
Alexa+ AI Reasoning	Determines when and how to invoke your tools based on customer intent.
Orchestrator	Coordinates discovery, reasoning, and customer interaction to deliver the final experience.
