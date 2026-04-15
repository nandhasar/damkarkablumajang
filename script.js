const kecamatanList = [
  "Candipuro", "Gucialit", "Jatiroto", "Kedungjajang", "Klakah", "Kunir",
  "Lumajang", "Padang", "Pasirian", "Pasrujambe", "Pronojiwo", "Randuagung",
  "Ranuyoso", "Rowokangkung", "Senduro", "Sukodono", "Sumbersuko", "Tekung",
  "Tempeh", "Tempursari", "Yosowilangun"
];

const bulanLabels = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const monitoringData = [
  { kecamatan: "Candipuro", bulan: 1, pemadaman: 4, penyelamatan: 6, rescueType: "Ular" },
  { kecamatan: "Candipuro", bulan: 2, pemadaman: 3, penyelamatan: 5, rescueType: "Tawon" },
  { kecamatan: "Candipuro", bulan: 3, pemadaman: 2, penyelamatan: 4, rescueType: "Biawak" },
  { kecamatan: "Gucialit", bulan: 1, pemadaman: 1, penyelamatan: 3, rescueType: "Hewan Lain" },
  { kecamatan: "Gucialit", bulan: 2, pemadaman: 2, penyelamatan: 2, rescueType: "Ular" },
  { kecamatan: "Jatiroto", bulan: 1, pemadaman: 5, penyelamatan: 1, rescueType: "Tawon" },
  { kecamatan: "Kedungjajang", bulan: 4, pemadaman: 2, penyelamatan: 3, rescueType: "Ular" },
  { kecamatan: "Klakah", bulan: 5, pemadaman: 4, penyelamatan: 2, rescueType: "Biawak" },
  { kecamatan: "Kunir", bulan: 6, pemadaman: 3, penyelamatan: 4, rescueType: "Hewan Lain" },
  { kecamatan: "Lumajang", bulan: 1, pemadaman: 7, penyelamatan: 5, rescueType: "Ular" },
  { kecamatan: "Lumajang", bulan: 2, pemadaman: 6, penyelamatan: 4, rescueType: "Tawon" },
  { kecamatan: "Pasirian", bulan: 7, pemadaman: 2, penyelamatan: 6, rescueType: "Biawak" },
  { kecamatan: "Pronojiwo", bulan: 8, pemadaman: 1, penyelamatan: 2, rescueType: "Ular" },
  { kecamatan: "Randuagung", bulan: 9, pemadaman: 3, penyelamatan: 2, rescueType: "Tawon" },
  { kecamatan: "Senduro", bulan: 10, pemadaman: 2, penyelamatan: 4, rescueType: "Hewan Lain" },
  { kecamatan: "Sukodono", bulan: 11, pemadaman: 5, penyelamatan: 3, rescueType: "Ular" },
  { kecamatan: "Tempeh", bulan: 12, pemadaman: 4, penyelamatan: 4, rescueType: "Biawak" },
  { kecamatan: "Yosowilangun", bulan: 3, pemadaman: 3, penyelamatan: 5, rescueType: "Tawon" }
];

const kecamatanFilter = document.getElementById("kecamatanFilter");
const bulanFilter = document.getElementById("bulanFilter");
const summaryTable = document.getElementById("summaryTable");

const modal = document.getElementById("popupModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

let chartPemadaman, chartPenyelamatan, chartRescueType, chartKecamatan;

function openPopup(html) {
  modalBody.innerHTML = html;
  modal.classList.add("active");
}

function closePopup() {
  modal.classList.remove("active");
}

closeModal.addEventListener("click", closePopup);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closePopup();
});

function initKecamatanOptions() {
  kecamatanList.forEach(kec => {
    const opt = document.createElement("option");
    opt.value = kec;
    opt.textContent = kec;
    kecamatanFilter.appendChild(opt);
  });
}

function getFilteredData() {
  const selectedKecamatan = kecamatanFilter.value;
  const selectedBulan = bulanFilter.value;

  return monitoringData.filter(item => {
    const matchKecamatan = selectedKecamatan === "Semua" || item.kecamatan === selectedKecamatan;
    const matchBulan = selectedBulan === "Semua" || String(item.bulan) === selectedBulan;
    return matchKecamatan && matchBulan;
  });
}

function sumByKey(data, key) {
  return data.reduce((acc, item) => acc + (item[key] || 0), 0);
}

function getDominantTypeFromItems(items) {
  const counts = {};
  items.forEach(item => {
    counts[item.rescueType] = (counts[item.rescueType] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "-";
}

function getMostActiveKecamatan(items) {
  const grouped = {};
  kecamatanList.forEach(kec => grouped[kec] = 0);

  items.forEach(item => {
    grouped[item.kecamatan] += item.pemadaman + item.penyelamatan;
  });

  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  return sorted[0] || ["-", 0];
}

function renderSummaryTable(data) {
  const grouped = {};

  kecamatanList.forEach(kec => {
    grouped[kec] = {
      pemadaman: 0,
      penyelamatan: 0,
      rescueTypeCounts: {}
    };
  });

  data.forEach(item => {
    grouped[item.kecamatan].pemadaman += item.pemadaman;
    grouped[item.kecamatan].penyelamatan += item.penyelamatan;
    grouped[item.kecamatan].rescueTypeCounts[item.rescueType] =
      (grouped[item.kecamatan].rescueTypeCounts[item.rescueType] || 0) + 1;
  });

  summaryTable.innerHTML = "";

  kecamatanList.forEach(kec => {
    const res = grouped[kec];
    const dominant = Object.entries(res.rescueTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="kec-link" data-kecamatan="${kec}">${kec}</span></td>
      <td>${res.pemadaman}</td>
      <td>${res.penyelamatan}</td>
      <td>${dominant}</td>
    `;
    summaryTable.appendChild(row);
  });

  document.querySelectorAll(".kec-link").forEach(el => {
    el.addEventListener("click", () => {
      const kecamatan = el.dataset.kecamatan;
      showKecamatanDetail(kecamatan);
    });
  });
}

function createBarChart(canvasId, labels, data, label, color, horizontal = false) {
  return new Chart(document.getElementById(canvasId), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: color,
        borderRadius: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? "y" : "x",
      plugins: {
        legend: {
          labels: { color: "#334155" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#475569" },
          grid: { color: "rgba(15,23,42,0.06)" }
        },
        y: {
          ticks: { color: "#475569" },
          grid: { color: "rgba(15,23,42,0.06)" }
        }
      }
    }
  });
}

function renderCharts(data) {
  if (chartPemadaman) chartPemadaman.destroy();
  if (chartPenyelamatan) chartPenyelamatan.destroy();
  if (chartRescueType) chartRescueType.destroy();
  if (chartKecamatan) chartKecamatan.destroy();

  const pemadamanPerBulan = Array(12).fill(0);
  const penyelamatanPerBulan = Array(12).fill(0);

  data.forEach(item => {
    pemadamanPerBulan[item.bulan - 1] += item.pemadaman;
    penyelamatanPerBulan[item.bulan - 1] += item.penyelamatan;
  });

  const rescueCounts = {
    "Ular": 0,
    "Tawon": 0,
    "Biawak": 0,
    "Hewan Lain": 0
  };

  data.forEach(item => {
    if (rescueCounts[item.rescueType] !== undefined) {
      rescueCounts[item.rescueType]++;
    } else {
      rescueCounts["Hewan Lain"]++;
    }
  });

  const kecamatanCounts = {};
  kecamatanList.forEach(kec => kecamatanCounts[kec] = 0);
  data.forEach(item => {
    kecamatanCounts[item.kecamatan] += item.pemadaman + item.penyelamatan;
  });

  const topKecamatan = Object.entries(kecamatanCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  chartPemadaman = createBarChart(
    "chartPemadaman",
    bulanLabels,
    pemadamanPerBulan,
    "Pemadaman",
    "rgba(239, 68, 68, 0.82)"
  );

  chartPenyelamatan = createBarChart(
    "chartPenyelamatan",
    bulanLabels,
    penyelamatanPerBulan,
    "Penyelamatan",
    "rgba(16, 185, 129, 0.82)"
  );

  chartRescueType = new Chart(document.getElementById("chartRescueType"), {
    type: "doughnut",
    data: {
      labels: Object.keys(rescueCounts),
      datasets: [{
        data: Object.values(rescueCounts),
        backgroundColor: ["#2563eb", "#f59e0b", "#10b981", "#ef4444"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#334155", padding: 18 }
        }
      }
    }
  });

  chartKecamatan = createBarChart(
    "chartKecamatan",
    topKecamatan.map(i => i[0]),
    topKecamatan.map(i => i[1]),
    "Total Kejadian",
    "rgba(37, 99, 235, 0.82)",
    true
  );
}

function getPopupStatsText(type, filtered) {
  const totalPemadaman = sumByKey(filtered, "pemadaman");
  const totalPenyelamatan = sumByKey(filtered, "penyelamatan");
  const dominantType = getDominantTypeFromItems(filtered);
  const [activeKec, activeTotal] = getMostActiveKecamatan(filtered);

  if (type === "pemadaman") {
    return {
      title: "Detail Lengkap Pemadaman",
      html: `
        <p><strong>Total Pemadaman:</strong> ${totalPemadaman}</p>
        <p><strong>Kecamatan paling aktif:</strong> ${activeKec} (${activeTotal} kejadian)</p>
        <p><strong>Kondisi dominan:</strong> Monitoring pemadaman berdasarkan filter yang dipilih.</p>
        <div class="detail-grid">
          <div class="detail-item">
            <strong>Total Kecamatan Terlibat</strong>
            <span>${new Set(filtered.map(x => x.kecamatan)).size}</span>
          </div>
          <div class="detail-item">
            <strong>Periode Terpilih</strong>
            <span>${bulanFilter.value === "Semua" ? "Semua Bulan" : bulanLabels[Number(bulanFilter.value) - 1]}</span>
          </div>
          <div class="detail-item">
            <strong>Kejadian Tertinggi</strong>
            <span>${Math.max(...filtered.map(x => x.pemadaman), 0)}</span>
          </div>
          <div class="detail-item">
            <strong>Rata-rata</strong>
            <span>${filtered.length ? (totalPemadaman / filtered.length).toFixed(1) : "0"}</span>
          </div>
        </div>
      `
    };
  }

  return {
    title: "Detail Lengkap Penyelamatan",
    html: `
      <p><strong>Total Penyelamatan:</strong> ${totalPenyelamatan}</p>
      <p><strong>Jenis paling sering:</strong> ${dominantType}</p>
      <p><strong>Kecamatan paling aktif:</strong> ${activeKec} (${activeTotal} kejadian)</p>
      <div class="detail-grid">
        <div class="detail-item">
          <strong>Ular</strong>
          <span>${filtered.filter(x => x.rescueType === "Ular").length}</span>
        </div>
        <div class="detail-item">
          <strong>Tawon</strong>
          <span>${filtered.filter(x => x.rescueType === "Tawon").length}</span>
        </div>
        <div class="detail-item">
          <strong>Biawak</strong>
          <span>${filtered.filter(x => x.rescueType === "Biawak").length}</span>
        </div>
        <div class="detail-item">
          <strong>Hewan Lain</strong>
          <span>${filtered.filter(x => x.rescueType === "Hewan Lain").length}</span>
        </div>
      </div>
    `
  };
}

function openDetailPopup(type) {
  const filtered = getFilteredData();
  const popup = getPopupStatsText(type, filtered);

  openPopup(`
    <h3>${popup.title}</h3>
    ${popup.html}
    <div class="modal-footer">
      <button class="btn-close" id="btnModalClose">Tutup</button>
    </div>
  `);

  setTimeout(() => {
    const btn = document.getElementById("btnModalClose");
    if (btn) btn.addEventListener("click", closePopup);
  }, 0);
}

function showKecamatanDetail(kecamatan) {
  const filtered = getFilteredData().filter(item => item.kecamatan === kecamatan);
  const totalPemadaman = sumByKey(filtered, "pemadaman");
  const totalPenyelamatan = sumByKey(filtered, "penyelamatan");
  const dominantType = getDominantTypeFromItems(filtered);

  const byMonth = bulanLabels.map((bulan, idx) => {
    const items = filtered.filter(x => x.bulan === idx + 1);
    const p = sumByKey(items, "pemadaman");
    const s = sumByKey(items, "penyelamatan");
    return { bulan, p, s };
  }).filter(x => x.p > 0 || x.s > 0);

  const monthHtml = byMonth.length
    ? byMonth.map(x => `<li>${x.bulan}: Pemadaman ${x.p}, Penyelamatan ${x.s}</li>`).join("")
    : "<li>Tidak ada data pada filter ini.</li>";

  openPopup(`
    <h3>Detail Kecamatan: ${kecamatan}</h3>
    <p><strong>Total Pemadaman:</strong> ${totalPemadaman}</p>
    <p><strong>Total Penyelamatan:</strong> ${totalPenyelamatan}</p>
    <p><strong>Jenis Dominan:</strong> ${dominantType}</p>

    <div class="detail-grid">
      <div class="detail-item">
        <strong>Jumlah Data</strong>
        <span>${filtered.length}</span>
      </div>
      <div class="detail-item">
        <strong>Dominan Bulan</strong>
        <span>${bulanFilter.value === "Semua" ? "Semua" : bulanLabels[Number(bulanFilter.value) - 1]}</span>
      </div>
    </div>

    <p style="margin-top:16px;"><strong>Rincian per bulan:</strong></p>
    <ul style="padding-left:18px; color:#334155; line-height:1.8;">
      ${monthHtml}
    </ul>

    <div class="modal-footer">
      <button class="btn-close" id="btnModalClose">Tutup</button>
    </div>
  `);

  setTimeout(() => {
    const btn = document.getElementById("btnModalClose");
    if (btn) btn.addEventListener("click", closePopup);
  }, 0);
}

function updateDashboard() {
  const filtered = getFilteredData();

  const totalPemadaman = sumByKey(filtered, "pemadaman");
  const totalPenyelamatan = sumByKey(filtered, "penyelamatan");

  document.getElementById("totalPemadaman").textContent = totalPemadaman;
  document.getElementById("totalPenyelamatan").textContent = totalPenyelamatan;
  document.getElementById("heroPemadaman").textContent = totalPemadaman;
  document.getElementById("heroPenyelamatan").textContent = totalPenyelamatan;
  document.getElementById("totalKecamatan").textContent = kecamatanList.length;

  const selectedBulan = bulanFilter.value;
  document.getElementById("dominantMonth").textContent =
    selectedBulan === "Semua" ? "Semua Bulan" : bulanLabels[Number(selectedBulan) - 1];

  renderCharts(filtered);
  renderSummaryTable(filtered);
}

document.getElementById("btnReset").addEventListener("click", () => {
  kecamatanFilter.value = "Semua";
  bulanFilter.value = "Semua";
  updateDashboard();
});

document.getElementById("btnScrollTable").addEventListener("click", () => {
  document.getElementById("ringkasanSection").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("cardPemadaman").addEventListener("click", () => {
  openDetailPopup("pemadaman");
});

document.getElementById("cardPenyelamatan").addEventListener("click", () => {
  openDetailPopup("penyelamatan");
});

initKecamatanOptions();
updateDashboard();

kecamatanFilter.addEventListener("change", updateDashboard);
bulanFilter.addEventListener("change", updateDashboard);