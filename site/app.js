// Fetch the most recent GitHub release for joogiebear/ecosuite_builder
// and update the download buttons + version labels in place.
//
// Fallback: the buttons ship with href pointing at
// https://github.com/.../releases/latest (GitHub auto-redirects to the
// newest tag), so if the API call fails the download still works.

const REPO = 'joogiebear/ecosuite_builder';
const API = `https://api.github.com/repos/${REPO}/releases/latest`;

const fmtSize = (bytes) => {
  if (!Number.isFinite(bytes)) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${mb.toFixed(0)} MB` : `${mb.toFixed(1)} MB`;
};

const pickZipAsset = (assets) => {
  if (!Array.isArray(assets) || assets.length === 0) return null;
  return (
    assets.find((a) => /\.zip$/i.test(a.name)) ??
    assets.find((a) => /\.exe$/i.test(a.name)) ??
    assets[0]
  );
};

const setAllText = (selector, value) => {
  document.querySelectorAll(selector).forEach((el) => {
    el.textContent = value;
  });
};

async function hydrateLatestRelease() {
  try {
    const res = await fetch(API, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const data = await res.json();

    const tag = data.tag_name ?? data.name ?? '';
    const asset = pickZipAsset(data.assets);

    if (tag) {
      setAllText('#versionLabel, .versionLabel', tag);
      const footer = document.getElementById('footerVersion');
      if (footer) footer.textContent = `EcoSuite Builder · ${tag}`;
    }

    if (asset) {
      const downloadButtons = document.querySelectorAll(
        '#downloadBtn, #downloadBtnAlt'
      );
      downloadButtons.forEach((el) => {
        el.setAttribute('href', asset.browser_download_url);
      });

      const size = fmtSize(asset.size);
      if (size) setAllText('#sizeLabel', size);
    }

    const note = document.getElementById('releaseNote');
    if (note && data.published_at) {
      const published = new Date(data.published_at);
      const when = published.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      note.textContent = `Latest release · ${tag} · published ${when}. The button links straight to the build asset on GitHub.`;
    }
  } catch (err) {
    const note = document.getElementById('releaseNote');
    if (note) {
      note.textContent =
        'Could not reach GitHub just now. The button will take you to the latest release page.';
    }
    // Buttons already point at /releases/latest — nothing else to do.
    console.warn('[ecosuite-builder site] release fetch failed:', err);
  }
}

document.addEventListener('DOMContentLoaded', hydrateLatestRelease);
