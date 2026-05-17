// ─────────────────────────────────────────
// LANGKAH 1: Turunan SIMBOLIK dengan Nerdamer
//
// nerdamer.diff(ekspresi, variabel)
// menghasilkan rumus turunan sebagai string.
//
// Contoh:
//   nerdamer.diff('x^2', 'x')  → '2*x'
//   nerdamer.diff('sin(x)', 'x') → 'cos(x)'
// ─────────────────────────────────────────
function turunanSimbolis(ekspresi) {
    var hasil = nerdamer.diff(ekspresi, "x");
    return hasil.toString(); // kembalikan sebagai string
}

// ─────────────────────────────────────────
// LANGKAH 2: Buat fungsi JS dari string
// (untuk menghitung nilai y di grafik)
//
// Nerdamer pakai notasi seperti "2*x",
// tapi new Function butuh "Math.sin(x)".
// Kita konversi dulu dengan nerdamer.buildFunction().
// ─────────────────────────────────────────
function buatFungsiJS(ekspresiNerdamer) {
    //console.log("ekspresi masuk:", ekspresiNerdamer); // ← tambah ini
    var jsExpr = ekspresiNerdamer
        .replace(/\^/g, "**")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/log\(/g, "Math.log(")
        .replace(/exp\(/g, "Math.exp(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/abs\(/g, "Math.abs(");

    return new Function("x", "return (" + jsExpr + ");");
}

// ─────────────────────────────────────────
// LANGKAH 3: Fungsi utama
// ─────────────────────────────────────────
function gambarGrafik() {
    var ekspresiRaw = document.getElementById("inputFungsi").value;
    var elError = document.getElementById("pesanError");
    var elHasil = document.getElementById("hasilTurunan");

    // Jika input kosong
    if (!ekspresiRaw.trim()) {
        elError.textContent = "Fungsi tidak boleh kosong!";
        return;
    }

    var ekspresiStandar;
    var ekspresDf;

    try {
        // PENTING: Kita minta Nerdamer 'merapikan' inputnya dulu.
        // Kalau user ngetik "2x^4", otomatis diubah Nerdamer jadi "2*x^4"
        // Kalau ngetik "4x^3 + 2x", otomatis diubah jadi "4*x^3 + 2*x"
        ekspresiStandar = nerdamer(ekspresiRaw).toString();
        
        // Cari turunannya pakai ekspresi yang sudah rapi
        ekspresDf = turunanSimbolis(ekspresiStandar);
        elError.textContent = "";
    } catch (e) {
        elError.textContent = "Fungsi tidak valid atau tidak didukung! Coba periksa penulisan variabelnya.";
        elHasil.style.display = "none";
        return;
    }

    // Tampilkan rumus turunan dalam bentuk box terminal
    elHasil.style.display = "block";
    elHasil.innerHTML =
        "<code style='color:#38bdf8'>f(x)  = " + ekspresiStandar + "</code><br>" +
        "<code style='color:#e2e8f0'>f'(x) = " + ekspresDf + "</code>";

    // Buat fungsi JS untuk menghitung nilai di grafik
    // (Pakai ekspresiStandar agar JS tidak error baca 2x)
    var f = buatFungsiJS(ekspresiStandar);
    var df = buatFungsiJS(ekspresDf);

    var nilaiX = [];
    for (var i = -5; i <= 5; i += 0.1) {
        nilaiX.push(parseFloat(i.toFixed(2)));
    }

    var nilaiY_f = nilaiX.map(function (x) {
        var v = f(x);
        return isFinite(v) ? v : null;
    });
    var nilaiY_df = nilaiX.map(function (x) {
        var v = df(x);
        return isFinite(v) ? v : null;
    });

    var traceF = {
        x: nilaiX,
        y: nilaiY_f,
        type: "scatter",
        mode: "lines",
        name: "f(x) Asli",
        line: { color: "#0284c7", width: 3 },
    };

    var traceDf = {
        x: nilaiX,
        y: nilaiY_df,
        type: "scatter",
        mode: "lines",
        name: "f'(x) Turunan",
        line: { color: "#ef4444", width: 2, dash: "dot" },
    };

    var layout = {
        margin: { t: 30, r: 30, l: 40, b: 40 },
        xaxis: { title: "Sumbu X", zerolinecolor: "#94a3b8", zerolinewidth: 2 },
        yaxis: { title: "Sumbu Y", zerolinecolor: "#94a3b8", zerolinewidth: 2 },
        plot_bgcolor: "#f8fafc",
        paper_bgcolor: "transparent",
        hovermode: "x unified",
        legend: { orientation: "h", y: -0.2 }
    };

    var config = { responsive: true, displayModeBar: false };

    Plotly.react("plot", [traceF, traceDf], layout, config);
}

// ─────────────────────────────────────────
// Gambar grafik awal saat halaman dibuka
// ─────────────────────────────────────────
gambarGrafik();
