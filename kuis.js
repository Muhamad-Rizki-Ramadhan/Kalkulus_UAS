const dataKuis = [
  {
    soal: "Jika f(x) = 4x³, maka turunan pertamanya f'(x) adalah...",
    opsi: ["12x²", "4x²", "12x", "x³"],
    jawabanBenar: 0
  },
  {
    soal: "Turunan dari fungsi konstanta f(x) = 15 adalah...",
    opsi: ["15x", "1", "0", "-15"],
    jawabanBenar: 2
  },
  {
    soal: "Turunan pertama dari f(x) = sin(x) adalah...",
    opsi: ["-cos(x)", "cos(x)", "-sin(x)", "sec²(x)"],
    jawabanBenar: 1
  }
];

let soalSaatIni = 0;
let skor = 0;

const elemenBadge = document.getElementById('soal-badge');
const elemenSoal = document.getElementById('teks-soal');
const wadahOpsi = document.getElementById('opsi-jawaban');
const pesanHasil = document.getElementById('pesan-hasil');
const btnLanjut = document.getElementById('btn-lanjut');

function acakSoal(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function muatSoal() {
  const data = dataKuis[soalSaatIni];
  elemenBadge.innerText = `Soal ${soalSaatIni + 1} dari ${dataKuis.length}`;
  elemenSoal.innerText = data.soal;
  
  wadahOpsi.innerHTML = '';
  pesanHasil.innerText = '';
  btnLanjut.style.display = 'none';

  data.opsi.forEach((pilihan, index) => {
    const tombol = document.createElement('button');
    tombol.classList.add('btn-opsi');
    tombol.innerText = pilihan;
    tombol.addEventListener('click', () => cekJawaban(index, tombol));
    wadahOpsi.appendChild(tombol);
  });
}

function cekJawaban(indexDipilih, tombolDipilih) {
  const benar = dataKuis[soalSaatIni].jawabanBenar;
  const semuaTombol = wadahOpsi.children;

  if (indexDipilih === benar) {
    tombolDipilih.classList.add('benar');
    pesanHasil.style.color = '#166534';
    skor++;
  } else {
    tombolDipilih.classList.add('salah');
    pesanHasil.style.color = '#991b1b';
    semuaTombol[benar].classList.add('benar');
  }

  for (let i = 0; i < semuaTombol.length; i++) {
    semuaTombol[i].disabled = true;
  }

  btnLanjut.style.display = 'block';
}

btnLanjut.addEventListener('click', () => {
  if (soalSaatIni >= dataKuis.length - 1 && btnLanjut.innerText.includes("Coba Ulang")) {
    soalSaatIni = 0;
    skor = 0;
    acakSoal(dataKuis); 
    btnLanjut.innerText = "Lanjut ke Soal Berikutnya"; 
    muatSoal();
    return;
  }

  soalSaatIni++;
  
  if (soalSaatIni < dataKuis.length) {
    muatSoal();
  } else {
    elemenBadge.innerText = "Kuis Selesai!";
  
    let nilaiAkhir = Math.round((skor / dataKuis.length) * 100);
    
    elemenSoal.innerHTML = `Jawaban Benar kamu : ${skor} / ${dataKuis.length} <br><br><span style="font-size: 1.8rem; color: #0284c7;">${nilaiAkhir}</span>`;
    
    if (skor === dataKuis.length) {
      pesanHasil.innerText = "🎉 Congrats! Kamu dapet nilai tertinggi yaitu 100";
      pesanHasil.style.color = '#166534'; 
    } else {
      pesanHasil.innerText = "Tetap semangat untuk meningkatkan nilai kamu";
      pesanHasil.style.color = '#0284c7'; 
    }
    
    wadahOpsi.innerHTML = '';
    btnLanjut.innerText = "Coba Ulang Kuis"; 
    btnLanjut.style.display = 'block'; 
  }
});

acakSoal(dataKuis);
muatSoal();