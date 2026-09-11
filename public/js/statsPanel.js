import { peers, localStream, statsIntervalId, setStatsIntervalId } from './state.js';
import { getVideoEl } from './zoomPan.js';

// ======================================================
// STATS: RESOLUÇÃO / FPS / QUALIDADE / RECONEXÃO
// ======================================================

function setStatsText(id, width, height, fps) {
  const container = document.querySelector(`.video-stats[data-peer-id="${id}"]`);
  const label = document.querySelector(`.stats-text[data-peer-id="${id}"]`);

  if (!container || !label) {
    return;
  }

  if (!width || !height) {
    container.style.display = 'none';
    return;
  }

  const fpsText = fps ? ` · ${Math.round(fps)}fps` : '';

  label.textContent = `${width}x${height}${fpsText}`;
  container.style.display = 'flex';
}

function setQualityBadge(id, quality) {
  const dot = document.querySelector(`.quality-dot[data-peer-id="${id}"]`);

  if (!dot) {
    return;
  }

  dot.classList.remove('quality-good', 'quality-medium', 'quality-bad');

  const labels = {
    good: 'Conexão boa',
    medium: 'Conexão instável',
    bad: 'Conexão ruim'
  };

  if (quality) {
    dot.classList.add(`quality-${quality}`);
  }

  dot.title = labels[quality] || 'Qualidade desconhecida';
}

export function showReconnectBadge(id, show) {
  const badge = document.querySelector(`.reconnect-badge[data-peer-id="${id}"]`);

  if (!badge) {
    return;
  }

  badge.classList.toggle('show', show);
}

async function updatePeerQualityAndStats(id, pc) {
  try {
    const stats = await pc.getStats();
    let inboundVideo = null;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        inboundVideo = report;
      }
    });

    if (!inboundVideo) {
      setQualityBadge(id, null);
      setStatsText(id, null, null, null);
      return;
    }

    const packetsLost = inboundVideo.packetsLost || 0;
    const packetsReceived = inboundVideo.packetsReceived || 0;
    const totalPackets = packetsLost + packetsReceived;
    const lossRatio = totalPackets > 0 ? packetsLost / totalPackets : 0;

    let quality = 'good';

    if (lossRatio > 0.08) {
      quality = 'bad';
    } else if (lossRatio > 0.02) {
      quality = 'medium';
    }

    setQualityBadge(id, quality);

    setStatsText(id, inboundVideo.frameWidth, inboundVideo.frameHeight, inboundVideo.framesPerSecond);
  } catch (error) {
    // Ignora falhas pontuais na coleta de stats.
  }
}

function updateLocalStats() {
  if (!localStream) {
    setStatsText('local', null, null, null);
    return;
  }

  const track = localStream.getVideoTracks()[0];

  if (!track) {
    setStatsText('local', null, null, null);
    return;
  }

  const settings = track.getSettings();

  setStatsText('local', settings.width, settings.height, settings.frameRate);
}

export function startStatsLoop() {
  if (statsIntervalId) {
    return;
  }

  setStatsIntervalId(
    setInterval(() => {
      updateLocalStats();

      for (const [id, pc] of peers) {
        updatePeerQualityAndStats(id, pc);
      }
    }, 2000)
  );
}

export function stopStatsLoop() {
  if (statsIntervalId) {
    clearInterval(statsIntervalId);
    setStatsIntervalId(null);
  }
}
