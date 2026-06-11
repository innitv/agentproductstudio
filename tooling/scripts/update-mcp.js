import fs from 'fs';

const figmaApiKey = process.env.FIGMA_API_KEY;
const lazywebMcpToken = process.env.LAZYWEB_MCP_TOKEN;

if (!figmaApiKey) {
  throw new Error('FIGMA_API_KEY is required');
}

if (!lazywebMcpToken) {
  throw new Error('LAZYWEB_MCP_TOKEN is required');
}

// Update global config
const globalPath = 'C:/Users/mrfra/.gemini/config/mcp_config.json';
const globalConfig = {
  mcpServers: {
    'figma-dev-mode-mcp-server': {
      serverUrl: 'http://127.0.0.1:3845/mcp'
    },
    figma: {
      command: 'npx',
      args: ['-y', 'figma-developer-mcp', '--stdio'],
      env: {
        FIGMA_API_KEY: figmaApiKey
      }
    }
  }
};
fs.writeFileSync(globalPath, JSON.stringify(globalConfig, null, 2), 'utf8');
console.log('✅ Global config updated!');

// Update workspace config - remove figma and figmaDesktop completely
const workspacePath = 'C:/Users/mrfra/.gemini/antigravity-ide/mcp_config.json';
const workspaceConfig = {
  mcpServers: {
    lazyweb: {
      serverUrl: 'https://www.lazyweb.com/mcp',
      headers: {
        'Authorization': `Bearer ${lazywebMcpToken}`,
        'Accept': 'application/json, text/event-stream'
      },
      disabled: false
    }
  }
};
fs.writeFileSync(workspacePath, JSON.stringify(workspaceConfig, null, 2), 'utf8');
console.log('✅ Workspace config updated!');

