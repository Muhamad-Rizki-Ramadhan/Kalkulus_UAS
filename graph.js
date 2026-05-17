// [Turunan dengan Nerdamer]
// Menghasilkan ekspresi matematis simbolis supaya input.
//
function turunanSimbolis(ekspresi) {
    var hasil = nerdamer.diff(ekspresi, "x");
    return hasil.toString(); // kembalikan sebagai string
}

// [Pembuat fungsi JS dari string Nerdamer]
// Gunakan nerdamer.buildFunction() untuk konversi notasi Nerdamer menjadi notasi JavaScript.
//
function buatFungsiJS(ekspresiNerdamer) {
    var jsExpr = ekspresiNerdamer
        .replace(/\^/g, '**')
        .replace(/\be\b/g, 'Math.E')        // konstanta e
        .replace(/pi/g, 'Math.PI')           // konstanta pi
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(');

    return new Function('x', 'return (' + jsExpr + ');');
}

// Fungsi utama
//
function gambarGrafik() {
    var ekspresi = document.getElementById("inputFungsi").value;
    var elError = document.getElementById("pesanError");
    var elHasil = document.getElementById("hasilTurunan");

    // Hitung turunan simbolik, tangkap error jika gagal
    var ekspresDf;
    try {
        ekspresDf = turunanSimbolis(ekspresi);
        elError.textContent = "";
    } catch (e) {
        elError.textContent = "Fungsi tidak valid! Contoh: x^2, sin(x), x^3+2*x";
        elHasil.innerHTML = "";
        return;
    }

    // Tampilkan rumus turunan sebagai teks
    // Konversi ke LaTeX lewat Nerdamer
    var latexF = nerdamer(ekspresi).toTeX();
    var latexDf = nerdamer(ekspresDf).toTeX();

    // Render dengan KaTeX ke dalam elemen
    elHasil.innerHTML =
        '<p>f(x) &nbsp;= <span id="render-f"></span></p>' +
        '<p>f\'(x) = <span id="render-df"></span></p>';

    katex.render(latexF, document.getElementById('render-f'), { throwOnError: false });
    katex.render(latexDf, document.getElementById('render-df'), { throwOnError: false });

    // Buat fungsi JS untuk menghitung nilai di grafik
    var f = buatFungsiJS(ekspresi);
    var df = buatFungsiJS(ekspresDf);

    // Buat array titik x dari -5 sampai 5
    var nilaiX = [];
    for (var i = -5; i <= 5; i += 0.1) {
        nilaiX.push(parseFloat(i.toFixed(2)));
    }

    // Hitung nilai y
    var nilaiY_f = nilaiX.map(function (x) {
        var v = f(x);
        return isFinite(v) ? v : null;
    });
    var nilaiY_df = nilaiX.map(function (x) {
        var v = df(x);
        return isFinite(v) ? v : null;
    });

    // Buat trace Plotly
    var traceF = {
        x: nilaiX,
        y: nilaiY_f,
        type: "scatter",
        mode: "lines",
        name: "f(x) = " + ekspresi,
        line: { color: "blue", width: 2 },
    };

    var traceDf = {
        x: nilaiX,
        y: nilaiY_df,
        type: "scatter",
        mode: "lines",
        name: "f'(x) = " + ekspresDf,
        line: { color: "red", width: 2, dash: "dot" },
    };

    var layout = {
        title: "Grafik f(x) dan f'(x)",
        xaxis: { title: "x" },
        yaxis: { title: "y" },
    };

    Plotly.react("plot", [traceF, traceDf], layout);
}

gambarGrafik(); // Gambar grafik saat halaman dibuka
