import kb from './data.json' with { type: 'json' };

const aturan = kb.aturan;
const semuaJika = aturan.flatMap(r => r.jika);
const semuaMaka = aturan.map(r => r.maka);
const faktaDasar = [...new Set(semuaJika.filter(f => !semuaMaka.includes(f)))];

let memori = new Set();
let alasan = {};
let indexTanya = 0;

console.log(kb.judul);
console.log("Jawab y/t.");

process.stdin.setEncoding('utf8');

function tanyaFakta() {
  if (indexTanya < faktaDasar.length) {
    let fakta = faktaDasar[indexTanya];
    process.stdout.write(`${indexTanya + 1}. Apakah ${fakta}? (y/t) > `);
  } else {
    process.stdin.pause();
    jalankanForwardChaining();
  }
}

process.stdin.on('data', (data) => {
  let jawaban = data.trim().toLowerCase();
  if (jawaban === 'y') {
    memori.add(faktaDasar[indexTanya]);
  }
  indexTanya++;
  tanyaFakta();
});

function jalankanForwardChaining() {
  const faktaAwalArr = Array.from(memori);
  console.log(`\nFakta awal: ${faktaAwalArr.length > 0 ? faktaAwalArr.join(', ') : '-'}\n`);

  let adaYangBaru = true;
  let siklus = 1;

  while (adaYangBaru) {
    adaYangBaru = false;
    for (let r of aturan) {
      if (!memori.has(r.maka)) {
        let cocok = false;
        let pemicu = [];

        if (r.mode === 'dan') {
          cocok = r.jika.every(kondisi => memori.has(kondisi));
          if (cocok) pemicu = r.jika;
        } else if (r.mode === 'atau') {
          pemicu = r.jika.filter(kondisi => memori.has(kondisi));
          cocok = pemicu.length > 0;
        }

        if (cocok) {
          memori.add(r.maka);
          alasan[r.maka] = { id: r.id, pemicu: pemicu };
          adaYangBaru = true;
          console.log(`Siklus ${siklus}: ${r.id} -> ${r.maka}`);
          siklus++;
        }
      }
    }
  }

  console.log(`Siklus ${siklus}: tidak ada aturan baru, berhenti\n`);

  let kesimpulanAkhir = [...memori].filter(m => semuaMaka.includes(m) && !semuaJika.includes(m));

  if (kesimpulanAkhir.length === 0) {
    console.log("Kesimpulan: tidak ada");
  } else {
    console.log(`Kesimpulan: ${kesimpulanAkhir.join(', ')}`);
    console.log("Alasan:");
    kesimpulanAkhir.forEach(k => cetakAlasan(k, "  "));
  }

  console.log(`\nCatatan: ${kb.batas}`);
}

function cetakAlasan(maka, indent) {
  if (alasan[maka]) {
    let riwayat = alasan[maka];
    console.log(`${indent}${maka}  <- ${riwayat.id} (${riwayat.pemicu.join(', ')})`);
    riwayat.pemicu.forEach(p => {
      if (alasan[p]) {
        cetakAlasan(p, indent + "  ");
      }
    });
  }
}

tanyaFakta();