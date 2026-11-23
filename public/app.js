let currentPick = null;
let locationChecked = false;
let productChecked = false;
async function loadNextPick() {
  const res = await fetch("/api/picks/next");
  currentPick = await res.json();
  const card = document.getElementById("pick-card");
  if (!currentPick) {
    card.innerHTML = "<h2>作業完了</h2>";
    return;
  }
  card.innerHTML = `
  <h2>${currentPick.location}</h2>
  <p>${currentPick.product}</p>
  <p>${currentPick.qty}個</p>
  `;
}

function speakCurrentPick() {
  if (!currentPick) return;
  const text = `
  ${currentPick.location}
  へ移動してください。
  ${currentPick.product}
  を
  ${currentPick.qty}
  個ピッキングしてください。
  `;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  speechSynthesis.speak(utterance);
}

async function completePick() {
  if (!locationChecked || !productChecked) {
    alert("棚と商品を確認してください");
    return;
  }
  if (!currentPick) return;
  const res = await fetch(`/api/picks/${currentPick.id}/complete`, {
    method: "POST",
  });
  console.log(res.status);
  await loadNextPick();
  locationChecked = false;
}

async function checkLocation() {
  const checkDigit = document.getElementById("check-digit").value;
  const res = await fetch("/api/check-location", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: currentPick.id,
      checkDigit,
    }),
  });
  const result = await res.json();
  if (!result.success) {
    alert("棚が違います");
    return;
  }
  locationChecked = true;
  alert("棚確認OK");
}

async function voiceCheckLocation() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.start();
  recognition.onresult = async (event) => {
    const spokenText = event.results[0][0].transcript;
    const normalizedText = spokenText.replace(/\D/g, "");
    document.getElementById("voice-result").textContent =
      `認証結果: ${normalizedText}`;
    await verifyCheckDigit(normalizedText);
  };
}

async function verifyCheckDigit(checkDigit) {
  const res = await fetch("/api/check-location", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: currentPick.id,
      checkDigit,
    }),
  });
  const result = await res.json();
  if (!result.success) {
    alert("棚が違います");
    return;
  }
  locationChecked = true;
  alert("棚確認OK");
  speakPickInstruction();
}

function speakPickInstruction() {
  const text = `
  ${currentPick.product}
  を
  ${currentPick.qty}
  個
  ピッキングしてください
  `;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  speechSynthesis.speak(utterance);
}

function checkBarcode() {
  const barcode = document.getElementById("barcode-input").value;
  verifyBarcode(barcode);
}

function verifyBarcode(barcode) {
  if (barcode !== currentPick.barcode) {
    alert("商品が違います");
    return;
  }
  productChecked = true;
  alert("商品確認OK");
}

async function startBarcodeScan() {
  const html5QrCode = new Html5Qrcode("reader");
  await html5QrCode.start(
    {
      facingMode: "environment",
    },
    {
      fps: 10,
      qrbox: 250,
    },
    (decodedText) => {
      document.getElementById("scan-result").textContent = decodedText;
      verifyBarcode(decodedText);
      html5QrCode.stop();
    },
  );
}

document
  .getElementById("speak-btn")
  .addEventListener("click", speakCurrentPick);
document.getElementById("complete-btn").addEventListener("click", completePick);
document.getElementById("check-btn").addEventListener("click", checkLocation);
document
  .getElementById("voice-check-btn")
  .addEventListener("click", voiceCheckLocation);
document
  .getElementById("barcode-check-btn")
  .addEventListener("click", checkBarcode);
document
  .getElementById("start-scan-btn")
  .addEventListener("click", startBarcodeScan);
loadNextPick();
