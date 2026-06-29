// Fungsi untuk merapikan input user (otomatis mengubah '2x' menjadi '2*x')
function bersihkanInput(input) {
    return input.replace(/(\d)([a-zA-Z])/g, "$1*$2");
}

function turunanSimbolis(ekspresi) {
    ekspresi = nerdamer(`simplify(${ekspresi})`).toString();
    let hasil = nerdamer.diff(ekspresi, "x").toString();
    hasil = nerdamer(`simplify(${hasil})`).toString();
    return hasil;
}

function gambarGrafik() {
    var inputMentah = document.getElementById("inputFungsi").value;
    var ekspresi = bersihkanInput(inputMentah); // Bersihkan input dulu
    var elError = document.getElementById("pesanError");
    var elHasil = document.getElementById("hasilTurunan");

    var ekspresDf;
    var f, df;

    try {
        // Coba hitung turunan dan bangun fungsi kalkulasinya
        ekspresDf = turunanSimbolis(ekspresi);
        
        // Gunakan fitur native Nerdamer yang lebih aman dan optimal
        f = nerdamer(ekspresi).buildFunction();
        df = nerdamer(ekspresDf).buildFunction();
        
        // Bersihkan error message
        elError.textContent = "";
        elError.style.display = "none";
    } catch (e) {
        // Tangkap error jika fungsi tidak masuk akal
        elError.textContent = "Fungsi tidak valid! Pastikan format benar, contoh: x^2, sin(x), 4*x^3";
        elError.style.display = "block";
        elHasil.style.display = "none";
        return;
    }

    // --- Render LaTeX untuk f(x) dan f'(x) ---
    var latexF = nerdamer(ekspresi).toTeX();
    var latexDf = nerdamer(ekspresDf).toTeX();
    console.log(ekspresDf);

    elHasil.innerHTML =
        '<p>f(x) &nbsp;= <span id="render-f"></span></p>' +
        '<p>f\'(x) = <span id="render-df"></span></p>';
    
    // Tampilkan boks hasil
    elHasil.style.display = "block";

    katex.render(latexF, document.getElementById('render-f'), { throwOnError: false });
    katex.render(latexDf, document.getElementById('render-df'), { throwOnError: false });

    // --- Pembuatan Data Titik Grafik ---
    var nilaiX = [];
    var nilaiY_f = [];
    var nilaiY_df = [];
    
    // Ubah BATAS_Y menjadi lebih kecil agar grafik fokus ke lekukan utamanya
    var BATAS_Y = 30; 

    // Ubah step 0.1 menjadi 0.02 agar titiknya jauh lebih rapat dan mulus
    for (var i = -5; i <= 5; i += 0.02) {
        var x = parseFloat(i.toFixed(2));
        nilaiX.push(x);

        // Hitung f(x)
        var y1 = f(x);
        // Tambahkan validasi tipe data karena Nerdamer kadang mengembalikan objek kompleks untuk tangen
        if (typeof y1 === 'object') y1 = y1.multiplier; 
        
        if (isFinite(y1) && Math.abs(y1) < BATAS_Y) {
            nilaiY_f.push(y1);
        } else {
            nilaiY_f.push(null); // Putus garis di titik asimtot
        }

        // Hitung f'(x)
        var y2 = df(x);
        if (typeof y2 === 'object') y2 = y2.multiplier;

        if (isFinite(y2) && Math.abs(y2) < BATAS_Y) {
            nilaiY_df.push(y2);
        } else {
            nilaiY_df.push(null); // Putus garis di titik asimtot
        }
    }

    // --- Setup Plotly ---
    var traceF = {
        x: nilaiX,
        y: nilaiY_f,
        type: "scatter",
        mode: "lines",
        name: "f(x)",
        line: { color: "#0284c7", width: 2.5 },
    };

    var traceDf = {
        x: nilaiX,
        y: nilaiY_df,
        type: "scatter",
        mode: "lines",
        name: "f'(x)",
        line: { color: "#ef4444", width: 2.5, dash: "dot" },
    };

    var layout = {
        title: "Grafik f(x) dan Turunannya f'(x)",
        xaxis: { title: "Sumbu X", zeroline: true },
        yaxis: { title: "Sumbu Y", zeroline: true },
        margin: { t: 40, b: 40, l: 40, r: 40 },
        hovermode: "x unified" // Memudahkan user melihat nilai x yang sama
    };

    Plotly.react("plot", [traceF, traceDf], layout);
}

// Render grafik default saat web pertama kali dimuat
document.addEventListener("DOMContentLoaded", function() {
    gambarGrafik();
});