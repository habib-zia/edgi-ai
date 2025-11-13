
type Client = {
  id: string;
  send: (data: string) => void;
};

class DeploymentBroadcaster {
  private clients: Map<string, Client> = new Map();
  private clientIdCounter = 0;

  addClient(send: (data: string) => void): string {
    const id = `client-${++this.clientIdCounter}-${Date.now()}`;
    this.clients.set(id, { id, send });
    return id;
  }

  removeClient(id: string): void {
    this.clients.delete(id);
  }

  broadcastDeployment(): void {
    const message = `data: ${JSON.stringify({ type: 'deployment', timestamp: Date.now() })}\n\n`;
    
    this.clients.forEach((client) => {
      try {
        client.send(message);
      } catch {
        this.removeClient(client.id);
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}
export const deploymentBroadcaster = new DeploymentBroadcaster();

