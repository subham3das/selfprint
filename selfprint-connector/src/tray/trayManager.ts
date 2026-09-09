import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { isSocketConnected, initSocket } from '../websocket/socket';

export class TrayManager {
  private trayProcess: ChildProcess | null = null;
  private statusInterval: NodeJS.Timeout | null = null;
  private isEnabled = true;

  constructor() {
    // Check if running in headless/service mode via environment variable
    if (process.env.HEADLESS === 'true' || process.env.NO_TRAY === 'true') {
      this.isEnabled = false;
    }
  }

  /**
   * Starts the Windows System Tray companion process.
   */
  public start(): void {
    if (!this.isEnabled) {
      logger.info('System Tray is disabled via environment (Headless Mode).');
      return;
    }

    try {
      this.launchTrayProcess();
      this.startStatusUpdater();
    } catch (err) {
      logger.warn('Could not start System Tray companion (running headless):', err);
    }
  }

  private launchTrayProcess(): void {
    const logsDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // PowerShell script to instantiate System.Windows.Forms.NotifyIcon
    const psScript = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Icon = [System.Drawing.SystemIcons]::Application
$notify.Text = "SelfPrint Connector"
$notify.Visible = $true

$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

$headerItem = $contextMenu.Items.Add("SelfPrint Connector")
$headerItem.Enabled = $false
$headerItem.Font = New-Object System.Drawing.Font($headerItem.Font, [System.Drawing.FontStyle]::Bold)

$contextMenu.Items.Add("-") | Out-Null

$statusItem = $contextMenu.Items.Add("Status: Checking...")
$statusItem.Enabled = $false

$reconnectItem = $contextMenu.Items.Add("Reconnect")
$reconnectItem.add_Click({
    [Console]::WriteLine("ACTION:reconnect")
})

$logsItem = $contextMenu.Items.Add("Open Logs")
$logsItem.add_Click({
    [Console]::WriteLine("ACTION:open_logs")
})

$restartItem = $contextMenu.Items.Add("Restart")
$restartItem.add_Click({
    [Console]::WriteLine("ACTION:restart")
})

$exitItem = $contextMenu.Items.Add("Exit")
$exitItem.add_Click({
    [Console]::WriteLine("ACTION:exit")
    $notify.Visible = $false
    [System.Windows.Forms.Application]::Exit()
})

$notify.ContextMenuStrip = $contextMenu

# Background thread to read commands from stdin
$thread = [System.Threading.Thread]::new([System.Threading.ThreadStart]{
    try {
        while ($line = [Console]::ReadLine()) {
            if ($line -like "STATUS:*") {
                $st = $line.Substring(7)
                $statusItem.Text = "Status: $st"
                $notify.Text = "SelfPrint Connector ($st)"
            }
        }
    } catch {}
})
$thread.IsBackground = $true
$thread.Start()

[System.Windows.Forms.Application]::Run()
`;

    this.trayProcess = spawn('powershell', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', psScript], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true
    });

    this.trayProcess.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString('utf8').split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'ACTION:reconnect') {
          logger.info('[System Tray] Reconnect requested by user.');
          initSocket();
        } else if (trimmed === 'ACTION:open_logs') {
          logger.info('[System Tray] Opening logs directory...');
          spawn('explorer.exe', [logsDir], { detached: true, stdio: 'ignore' });
        } else if (trimmed === 'ACTION:restart') {
          logger.info('[System Tray] Restart requested by user.');
          process.exit(0);
        } else if (trimmed === 'ACTION:exit') {
          logger.info('[System Tray] Exit requested by user.');
          process.exit(0);
        }
      }
    });

    this.trayProcess.on('error', (err) => {
      logger.debug('System Tray process error (running headless):', err.message);
    });

    this.trayProcess.on('exit', () => {
      this.trayProcess = null;
    });
  }

  private startStatusUpdater(): void {
    if (this.statusInterval) clearInterval(this.statusInterval);

    const updateStatus = () => {
      if (this.trayProcess && this.trayProcess.stdin && !this.trayProcess.stdin.destroyed) {
        const status = isSocketConnected() ? 'Connected' : 'Disconnected';
        try {
          this.trayProcess.stdin.write(`STATUS:${status}\n`);
        } catch {
          // Ignore stream write error
        }
      }
    };

    updateStatus();
    this.statusInterval = setInterval(updateStatus, 3000);
  }

  public stop(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
    if (this.trayProcess) {
      try {
        this.trayProcess.kill();
      } catch {
        // Ignore kill errors
      }
      this.trayProcess = null;
    }
  }
}

export const trayManager = new TrayManager();
