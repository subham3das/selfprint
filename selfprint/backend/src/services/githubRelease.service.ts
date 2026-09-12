import { env } from '../config/environment';
import { logger } from '../utils/logger';

export interface ReleaseAssetInfo {
  version: string;
  downloadUrl: string;
  fileName: string;
  sizeBytes: number;
  sizeMB: string;
  publishedAt: string;
  releaseName: string;
}

class GitHubReleaseService {
  private cachedRelease: ReleaseAssetInfo | null = null;
  private cacheExpiresAt = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

  /**
   * Fetches latest GitHub release information with 5-minute memory caching.
   * Finds the Windows installer asset ("SelfPrint Connector-Setup.exe").
   */
  public async getLatestRelease(forceRefresh = false): Promise<ReleaseAssetInfo> {
    const now = Date.now();

    // 1. Return fresh cache if available
    if (!forceRefresh && this.cachedRelease && now < this.cacheExpiresAt) {
      return this.cachedRelease;
    }

    const owner = env.GITHUB.OWNER || 'subham3das';
    const repo = env.GITHUB.REPO || 'selfprint';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

    try {
      logger.info(`[GitHubRelease] Fetching latest release from ${apiUrl}...`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'SelfPrint-Backend/1.0',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`GitHub API returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        tag_name?: string;
        name?: string;
        published_at?: string;
        assets?: Array<{
          name: string;
          browser_download_url: string;
          size: number;
          content_type: string;
        }>;
      };

      if (!data.assets || !Array.isArray(data.assets) || data.assets.length === 0) {
        throw new Error('Latest release contains no downloadable assets.');
      }

      // Priority asset search: exact "SelfPrint Connector Setup.exe" / "SelfPrint Connector-Setup.exe" -> normalized setup exe -> any .exe
      const targetAsset =
        data.assets.find((a) => a.name === 'SelfPrint Connector Setup.exe' || a.name === 'SelfPrint Connector-Setup.exe') ||
        data.assets.find((a) => a.name.replace(/[\s._-]+/g, '').toLowerCase() === 'selfprintconnectorsetup.exe') ||
        data.assets.find((a) => a.name.endsWith('.exe') && a.name.toLowerCase().includes('setup')) ||
        data.assets.find((a) => a.name.endsWith('.exe'));

      if (!targetAsset || !targetAsset.browser_download_url) {
        throw new Error('Could not find Windows installer asset (SelfPrint Connector-Setup.exe) in latest release.');
      }

      const sizeBytes = targetAsset.size || 0;
      const sizeMB = sizeBytes > 0 ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB` : '85 MB';

      const releaseInfo: ReleaseAssetInfo = {
        version: data.tag_name || data.name || 'v1.0.0',
        downloadUrl: targetAsset.browser_download_url,
        fileName: targetAsset.name,
        sizeBytes,
        sizeMB,
        publishedAt: data.published_at || new Date().toISOString(),
        releaseName: data.name || data.tag_name || 'SelfPrint Connector'
      };

      // Store in 5-minute memory cache
      this.cachedRelease = releaseInfo;
      this.cacheExpiresAt = now + this.CACHE_TTL_MS;

      logger.info(`[GitHubRelease] Cached latest release: ${releaseInfo.version} (${releaseInfo.fileName}) -> ${releaseInfo.downloadUrl}`);
      return releaseInfo;
    } catch (err: any) {
      logger.error(`[GitHubRelease] Failed to query GitHub releases: ${err.message}`);

      // Graceful fallback: if we have any cached release (even expired), serve it during GitHub downtime
      if (this.cachedRelease) {
        logger.warn('[GitHubRelease] Serving stale cached release info as fallback.');
        return this.cachedRelease;
      }

      throw err;
    }
  }

  /**
   * Helper to retrieve cached release synchronously if available
   */
  public getCachedRelease(): ReleaseAssetInfo | null {
    return this.cachedRelease;
  }
}

export const githubReleaseService = new GitHubReleaseService();
export default githubReleaseService;
