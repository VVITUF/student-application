// ==========================================
// FRONTEND LOGIC & CLIENT ORCHESTRATION
// ==========================================

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwIX5jqnxsYTwz3we0fwBvjkGHhdtQ5kkoaxISIO1tZj-AXW4JmIldF7o5xVUQVu4cs/exec";

// Master list of 124 College Bus Boarding Points
const BUS_STOPS = [
  "Amaravathi", "Pedaparimi", "Thulluru", "Namburu", "Chowdavaram", "Lal Puram",
  "Chilakaluripet (54KM)", "China Kakani", "Kaza", "Mangalagiri Bypass",
  "MGL Rajive Centre", "MGL Galigopuram", "MGL Bus Stand", "MGL Old Bus Stand",
  "MGL Anjaneya Swamy Temple", "Yarrabalem", "Nallapadu", "Perecharla",
  "Phirangipuram", "Nudurupadu", "Medikonduru", "Bhiminenivaripalem",
  "Visadala X Roads", "Kunchena Palli", "Halfpeta", "Kolakaluru", "Nandivelugu",
  "Kollipara", "Takkellapadu", "Tenali", "Kolluru (44KM)", "Revendrapadu",
  "Tummapudi", "Nuthakki", "Peda Vadlapudi", "Duggirala", "Etukuru",
  "Foundary centre -VJW", "Bhavanipuram -VJW", "Vijaya Takies (Eluru Road)-",
  "VJW Chuttugunta-VJW", "Veternary Hospital-VJW", "Benz Circle-VJW",
  "Varadhi-VJW", "Tadepalli", "Tadikonda", "Lam", "Peda Kakani", "Pedanandi Padu",
  "Prathipadu", "Pulladigunta", "Kantheru", "Narakoduru", "Yadlapadu",
  "Kantheru ‘X’ Road", "Uppalapadu", "Venkata Krishna Puram", "Cherukupalli",
  "Ibrahimpatnam", "Sattenapalli", "Penamaluru", "Narasaraopet", "SVN Colony-GNT",
  "Gujjangundla-GNT", "Potthuru-GNT", "SriRam Township-GNT",
  "Hanumaiah Circle/LIC Colony-GNT", "Stambalagaruvu-GNT", "RTO Ojce (Old)-GNT",
  "Pattabhipuram Petrol Bunk-GNT", "Syamala Nagar-GNT", "Recruitment Ojce-GNT",
  "Swamy Theatre-GNT", "Collector Ojce-GNT", "Nagarampalem-GNT",
  "Stall Girls High School-GNT", "Bommidala Kalyana Mandapam-GNT",
  "Navabharath Nagar-GNT", "Vidya Nagar 1st Line-GNT", "Saibaba Road-GNT",
  "Koritepadu Kollaform-GNT", "Gandhi Bomma-GNT", "Rajendra Nagar-GNT",
  "Brundavan Gardens-GNT", "Sitaramaiah High School-GNT", "Nayar Hotal -GNT",
  "Bakers Fun-GNT", "Lakshmipuram Milk Booth-GNT", "Union Bank-GNT",
  "Housing Board Colony(Janatha Bazar)-GNT", "Mahatma Gandhi College-GNT",
  "A T Agraharam-GNT", "Chuttugunta-GNT", "ITC-GNT", "Vijaya Lakshmi Theatre-GNT",
  "Venkateswara Swamy Temple(Gorantla)-GNT", "Nagaralu-GNT",
  "Medical College Hostel-GNT", "Rama Buildings-GNT", "Lodge Centre-GNT",
  "Sankar Vilas-GNT", "Naaz Centre-GNT", "Kothapet (Bhagathsing Bomma)-GNT",
  "Bose Bomma-GNT", "Old Club Road (Opp. Bus Stand)-", "GNT Market-GNT",
  "Old Bus Stand -GNT", "B. R. Stadium-GNT", "Mani Hotel Centre ( Old Guntur)",
  "Bus Stand-GNT", "Manipuram Gate-GNT", "Ammavari Temple -GNT", "Auto Nagar-GNT",
  "Peda Palakaluru", "Ponnur", "Chebrolu", "Budampadu", "Raveli Via Ponnekallu",
  "Sekuru Via Narakoduru", "Chiluvuru", "Koppuravuru", "Nunna", "Gannavaram",
  "Bapatla"
];

let activeStudent = null;
let photoRawImg = null;
let signRawImg = null;
let compressedPhotoBase64 = null;
let compressedSignBase64 = null;
let combinedCardBase64 = null;

// Populate Bus Stops & Setup Input Guards on DOM Load
document.addEventListener("DOMContentLoaded", function () {
  populateBusStopsDropdown();

  // Enforce whole numbers on Marks fields
  const sscMarksInput = document.getElementById("fieldSscMarks");
  const interMarksInput = document.getElementById("fieldInterMarks");

  if (sscMarksInput) {
    sscMarksInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    });
  }

  if (interMarksInput) {
    interMarksInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    });
  }
});

function populateBusStopsDropdown() {
  const busSelect = document.getElementById("fieldBusStop");
  if (!busSelect) return;

  busSelect.innerHTML = '<option value="">Select Boarding Point</option>';
  BUS_STOPS.forEach(stop => {
    const opt = document.createElement("option");
    opt.value = stop;
    opt.textContent = stop;
    busSelect.appendChild(opt);
  });
}

// ================= STAGE 1: AUTHENTICATION =================
async function handleAuthVerification() {
  const regd = document.getElementById("authRegdNo").value.trim().toUpperCase();
  const adm = document.getElementById("authAdmNo").value.trim().toUpperCase();
  const sec = document.getElementById("authSection").value.trim().toUpperCase();
  const alertEl = document.getElementById("authAlert");
  const btn = document.getElementById("authBtn");

  alertEl.style.display = "none";

  if (!regd || !adm || !sec) {
    alertEl.innerText = "Please enter Registration Number, Admission Number, and select Section.";
    alertEl.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.innerText = "Verifying...";

  try {
    const url = `${SCRIPT_URL}?action=lookup&regdNo=${encodeURIComponent(regd)}&admissionNo=${encodeURIComponent(adm)}&section=${encodeURIComponent(sec)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.status === "found") {
      activeStudent = data;

      // Update Welcome Header
      const welcomeBanner = document.getElementById("welcomeBanner");
      document.getElementById("welcomeNameText").innerText = `Welcome, ${data.officialName}`;
      welcomeBanner.style.display = "block";

      // Pre-fill verified credentials
      document.getElementById("fieldEnrollmentNo").value = data.regdNo;
      document.getElementById("fieldAdmissionNo").value = data.admissionNo;
      document.getElementById("fieldSection").value = data.section;
      if (data.officialName) {
        document.getElementById("fieldNameSsc").value = data.officialName;
      }

      // Populate previous fields if editing an existing record
      if (data.isExisting && data.previousData) {
        populateExistingForm(data.previousData);
      }

      // Transition views
      document.getElementById("authCard").style.display = "none";
      document.getElementById("formCard").style.display = "block";
    } else {
      alertEl.innerText = data.message || "No match found. Please verify your Regd No, Admission No, and Section.";
      alertEl.style.display = "block";
    }
  } catch (err) {
    alertEl.innerText = "Network / Verification error. Please check your connection.";
    alertEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.innerText = "Verify & Proceed";
  }
}

function populateExistingForm(d) {
  // Accommodates both updated and legacy header naming
  const sscName = d.Student_Name_SSC_CBSE_ICSE || d.Student_Name_SSC;
  if (sscName) document.getElementById("fieldNameSsc").value = sscName;

  if (d.Gender) document.getElementById("fieldGender").value = d.Gender;
  if (d.DOB) document.getElementById("fieldDob").value = d.DOB;
  if (d.Blood_Group) document.getElementById("fieldBloodGroup").value = d.Blood_Group;
  if (d.Category) document.getElementById("fieldCategory").value = d.Category;

  const subCaste = d.Sub_Caste || d.Caste;
  if (subCaste) document.getElementById("fieldCaste").value = subCaste;

  if (d.Student_Mobile) document.getElementById("fieldStudentMobile").value = d.Student_Mobile;
  if (d.Student_Email) document.getElementById("fieldStudentEmail").value = d.Student_Email;
  if (d.Student_Aadhaar) document.getElementById("fieldStudentAadhaar").value = d.Student_Aadhaar;
  if (d.APAAR_ID) document.getElementById("fieldApaarId").value = d.APAAR_ID;
  if (d.Identification_Mark_1) document.getElementById("fieldIdMark1").value = d.Identification_Mark_1;
  if (d.Identification_Mark_2) document.getElementById("fieldIdMark2").value = d.Identification_Mark_2;

  const sscRegd = d.SSC_CBSE_ICSE_Regd_No || d.SSC_Regd_No;
  if (sscRegd) document.getElementById("fieldSscRegd").value = sscRegd;

  const sscMarks = d.SSC_CBSE_ICSE_Marks || d.SSC_Marks;
  if (sscMarks) document.getElementById("fieldSscMarks").value = sscMarks;

  const sscPercent = d.SSC_CBSE_ICSE_Percentage || d.SSC_Percentage;
  if (sscPercent) document.getElementById("fieldSscPercent").value = sscPercent;

  if (d.Inter_Regd_No) document.getElementById("fieldInterRegd").value = d.Inter_Regd_No;
  if (d.Inter_Marks) document.getElementById("fieldInterMarks").value = d.Inter_Marks;
  if (d.Inter_Percentage) document.getElementById("fieldInterPercent").value = d.Inter_Percentage;

  if (d.Father_Name) document.getElementById("fieldFatherName").value = d.Father_Name;
  if (d.Father_Mobile) document.getElementById("fieldFatherMobile").value = d.Father_Mobile;
  if (d.Father_Occupation) document.getElementById("fieldFatherOcc").value = d.Father_Occupation;
  if (d.Father_Aadhaar) document.getElementById("fieldFatherAadhaar").value = d.Father_Aadhaar;
  if (d.Mother_Name) document.getElementById("fieldMotherName").value = d.Mother_Name;
  if (d.Mother_Mobile) document.getElementById("fieldMotherMobile").value = d.Mother_Mobile;
  if (d.Mother_Occupation) document.getElementById("fieldMotherOcc").value = d.Mother_Occupation;
  if (d.Mother_Aadhaar) document.getElementById("fieldMotherAadhaar").value = d.Mother_Aadhaar;

  if (d.Permanent_Address) document.getElementById("fieldPermAddress").value = d.Permanent_Address;
  if (d.Permanent_District) document.getElementById("fieldPermDistrict").value = d.Permanent_District;
  if (d.Permanent_State) document.getElementById("fieldPermState").value = d.Permanent_State;
  if (d.Permanent_Pincode) document.getElementById("fieldPermPincode").value = d.Permanent_Pincode;
  if (d.Current_Address) document.getElementById("fieldCurrAddress").value = d.Current_Address;
  if (d.Current_District) document.getElementById("fieldCurrDistrict").value = d.Current_District;
  if (d.Current_Pincode) document.getElementById("fieldCurrPincode").value = d.Current_Pincode;

  const coCurr = d.Extra_Curricular_Activities || d.Co_Curricular;
  if (coCurr) document.getElementById("fieldCoCurricular").value = coCurr;

  if (d.NCC_NSS) document.getElementById("fieldNccNss").value = d.NCC_NSS;
  if (d.Admission_Type) document.getElementById("fieldAdmissionType").value = d.Admission_Type;
  if (d.Rank_HT_No) document.getElementById("fieldRankHtNo").value = d.Rank_HT_No;
  if (d.Fee_Reimbursement) document.getElementById("fieldFeeReimb").value = d.Fee_Reimbursement;

  if (d.Residential_Status) {
    document.getElementById("fieldResidentialStatus").value = d.Residential_Status;
    handleResidenceChange();
    if (d.Hostel_Sharing) document.getElementById("fieldHostelSharing").value = d.Hostel_Sharing;
    if (d.College_Travel_Mode) {
      document.getElementById("fieldCommuteMode").value = d.College_Travel_Mode;
      handleCommuteChange();
    }
    if (d.Bus_Boarding_Point && d.Bus_Boarding_Point !== "NA") {
      document.getElementById("fieldBusStop").value = d.Bus_Boarding_Point;
    }
  }
}

// ================= ADDRESS & LOGISTICS CONTROLLERS =================
function handleAddressSync() {
  const isChecked = document.getElementById("syncAddressCheck").checked;
  if (isChecked) {
    document.getElementById("fieldCurrAddress").value = document.getElementById("fieldPermAddress").value;
    document.getElementById("fieldCurrDistrict").value = document.getElementById("fieldPermDistrict").value;
    document.getElementById("fieldCurrPincode").value = document.getElementById("fieldPermPincode").value;
  }
}

function handleResidenceChange() {
  const status = document.getElementById("fieldResidentialStatus").value;
  const hostelGrp = document.getElementById("hostelGroup");
  const commuteGrp = document.getElementById("commuteGroup");
  const busGrp = document.getElementById("busStopGroup");

  if (status === "VVIT University Hostel") {
    if (hostelGrp) hostelGrp.style.display = "block";
    if (commuteGrp) commuteGrp.style.display = "none";
    if (busGrp) busGrp.style.display = "none";
  } else {
    if (hostelGrp) hostelGrp.style.display = "none";
    if (commuteGrp) commuteGrp.style.display = "block";
    handleCommuteChange();
  }
}

function handleCommuteChange() {
  const mode = document.getElementById("fieldCommuteMode").value;
  const busGrp = document.getElementById("busStopGroup");
  const busSelect = document.getElementById("fieldBusStop");

  if (mode === "College Bus") {
    if (busGrp) busGrp.style.display = "block";
    if (busSelect) {
      busSelect.required = true;
      if (busSelect.value === "NA") busSelect.value = "";
    }
  } else {
    if (busGrp) busGrp.style.display = "none";
    if (busSelect) {
      busSelect.required = false;
      busSelect.value = "NA";
    }
  }
}

// ================= CANVAS 30 KB IMAGE COMPRESSION & MERGING =================
function getExactByteSize(dataUrl) {
  const base64 = dataUrl.indexOf(",") > -1 ? dataUrl.split(",")[1] : dataUrl;
  try {
    return atob(base64).length;
  } catch(e) {
    return Math.round(base64.length * 3 / 4);
  }
}

function getKbSize(dataUrl) {
  return (getExactByteSize(dataUrl) / 1024).toFixed(1);
}

function compressProportional(img, maxDim, quality) {
  const canvas = document.createElement("canvas");
  const scale = Math.min(maxDim / Math.max(img.width, img.height), 1);
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", quality);
}

function processSelectedImage(event, type) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      if (type === "photo") {
        photoRawImg = img;
        compressedPhotoBase64 = compressProportional(img, 500, 0.74);
        const thumb = document.getElementById("photoThumb");
        thumb.src = compressedPhotoBase64;
        thumb.style.display = "block";
        document.getElementById("photoSizeTag").innerText = `Ready • ${getKbSize(compressedPhotoBase64)} KB`;
      } else {
        signRawImg = img;
        compressedSignBase64 = compressProportional(img, 450, 0.70);
        const thumb = document.getElementById("signThumb");
        thumb.src = compressedSignBase64;
        thumb.style.display = "block";
        document.getElementById("signSizeTag").innerText = `Ready • ${getKbSize(compressedSignBase64)} KB`;
      }

      if (photoRawImg && signRawImg) {
        synthesizeCompositeCard();
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function synthesizeCompositeCard() {
  const totalW = 410;
  const totalH = 527;
  const photoH = 415;
  const signH = 112;

  const canvas = document.createElement("canvas");
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, totalW, totalH);

  // Draw Photo
  const pScale = Math.max(totalW / photoRawImg.width, photoH / photoRawImg.height);
  const drawW = photoRawImg.width * pScale;
  const drawH = photoRawImg.height * pScale;
  const drawX = (totalW - drawW) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, totalW, photoH);
  ctx.clip();
  ctx.drawImage(photoRawImg, drawX, 0, drawW, drawH);
  ctx.restore();

  // Draw Divider
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, photoH);
  ctx.lineTo(totalW, photoH);
  ctx.stroke();

  // Draw Signature
  const maxSignW = totalW - 40;
  const maxSignH = signH - 18;
  const sScale = Math.min(maxSignW / signRawImg.width, maxSignH / signRawImg.height);
  const sW = signRawImg.width * sScale;
  const sH = signRawImg.height * sScale;
  const sX = (totalW - sW) / 2;
  const sY = photoH + (signH - sH) / 2;

  ctx.drawImage(signRawImg, sX, sY, sW, sH);

  // Outer Border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(1, 1, totalW - 2, totalH - 2);

  // Dynamic 31-34 KB Compression Loop
  const MAX_BYTES = 34816;
  const MIN_BYTES = 31744;
  let quality = 0.88;

  combinedCardBase64 = canvas.toDataURL("image/jpeg", quality);
  let bytes = getExactByteSize(combinedCardBase64);

  while (bytes > MAX_BYTES && quality > 0.40) {
    quality -= 0.01;
    combinedCardBase64 = canvas.toDataURL("image/jpeg", quality);
    bytes = getExactByteSize(combinedCardBase64);
  }

  while (bytes < MIN_BYTES && quality < 0.96) {
    const nextUrl = canvas.toDataURL("image/jpeg", quality + 0.01);
    const nextBytes = getExactByteSize(nextUrl);
    if (nextBytes <= MAX_BYTES) {
      quality += 0.01;
      combinedCardBase64 = nextUrl;
      bytes = nextBytes;
    } else {
      break;
    }
  }

  const thumb = document.getElementById("combinedThumb");
  thumb.src = combinedCardBase64;
  thumb.style.display = "block";
  document.getElementById("combinedSizeTag").innerText = `Passport-Size Card: ${getKbSize(combinedCardBase64)} KB (31–34 KB)`;
}

// ================= STAGE 3: VALIDATION & A4 PREVIEW =================
function validateIdentityInputs() {
  const subCaste = document.getElementById("fieldCaste").value.trim();
  const commuteMode = document.getElementById("fieldCommuteMode").value;
  const busStop = document.getElementById("fieldBusStop").value;
  const coCurricular = document.getElementById("fieldCoCurricular").value;
  const nccNss = document.getElementById("fieldNccNss").value;

  const sscMarks = document.getElementById("fieldSscMarks").value.trim();
  const interMarks = document.getElementById("fieldInterMarks").value.trim();

  // Validate Sub-Caste
  if (!subCaste) {
    alert("Error: Sub-Caste is mandatory. Please enter your sub-caste.");
    document.getElementById("fieldCaste").focus();
    return false;
  }

  // Validate Whole Numbers for Marks
  if (!/^\d+$/.test(sscMarks)) {
    alert("Error: SSC/CBSE/ICSE Marks must be a whole number.");
    document.getElementById("fieldSscMarks").focus();
    return false;
  }
  if (!/^\d+$/.test(interMarks)) {
    alert("Error: Inter / Diploma Marks must be a whole number.");
    document.getElementById("fieldInterMarks").focus();
    return false;
  }

  // Validate Mandatory Commute & Logistics
  if (!commuteMode) {
    alert("Error: College Commute Mode is mandatory.");
    document.getElementById("fieldCommuteMode").focus();
    return false;
  }
  if (commuteMode === "College Bus" && (!busStop || busStop === "NA")) {
    alert("Error: Please select your Bus Boarding Point / Stop.");
    document.getElementById("fieldBusStop").focus();
    return false;
  }

  // Validate Dropdowns
  if (!coCurricular) {
    alert("Error: Please select an option for Extra curricular Activities.");
    document.getElementById("fieldCoCurricular").focus();
    return false;
  }
  if (!nccNss) {
    alert("Error: Please select an option for NCC / NSS Participation.");
    document.getElementById("fieldNccNss").focus();
    return false;
  }

  // Validate Mobile Numbers (10 Digits)
  const studentMobile = document.getElementById("fieldStudentMobile").value.trim();
  const fatherMobile = document.getElementById("fieldFatherMobile").value.trim();
  const motherMobile = document.getElementById("fieldMotherMobile").value.trim();

  if (!/^\d{10}$/.test(studentMobile)) {
    alert("Error: Student Mobile Number must be exactly 10 numeric digits.");
    document.getElementById("fieldStudentMobile").focus();
    return false;
  }
  if (!/^\d{10}$/.test(fatherMobile)) {
    alert("Error: Father's Mobile Number must be exactly 10 numeric digits.");
    document.getElementById("fieldFatherMobile").focus();
    return false;
  }
  if (motherMobile && !/^\d{10}$/.test(motherMobile)) {
    alert("Error: Mother's Mobile Number must be exactly 10 numeric digits.");
    document.getElementById("fieldMotherMobile").focus();
    return false;
  }

  // Validate 12-Digit Government ID Numbers
  const studentAadhaar = document.getElementById("fieldStudentAadhaar").value.trim();
  const fatherAadhaar = document.getElementById("fieldFatherAadhaar").value.trim();
  const motherAadhaar = document.getElementById("fieldMotherAadhaar").value.trim();

  if (!/^\d{12}$/.test(studentAadhaar)) {
    alert("Error: Student Aadhaar Number must be exactly 12 numeric digits.");
    document.getElementById("fieldStudentAadhaar").focus();
    return false;
  }
  if (!/^\d{12}$/.test(fatherAadhaar)) {
    alert("Error: Father's Aadhaar Number must be exactly 12 numeric digits.");
    document.getElementById("fieldFatherAadhaar").focus();
    return false;
  }
  if (!/^\d{12}$/.test(motherAadhaar)) {
    alert("Error: Mother's Aadhaar Number must be exactly 12 numeric digits.");
    document.getElementById("fieldMotherAadhaar").focus();
    return false;
  }

  return true;
}

function generateAndShowA4Preview() {
  if (!validateIdentityInputs()) {
    return;
  }

  if (!compressedPhotoBase64 || !compressedSignBase64 || !combinedCardBase64) {
    alert("Please upload both your Passport Photo and Signature before previewing.");
    return;
  }

  // Populate A4 Preview Sheet
  document.getElementById("pEnrollmentNo").innerText = document.getElementById("fieldEnrollmentNo").value;
  document.getElementById("pAdmissionNo").innerText = document.getElementById("fieldAdmissionNo").value;
  document.getElementById("pProgramme").innerText = document.getElementById("fieldProgramme").value;
  document.getElementById("pSection").innerText = document.getElementById("fieldSection").value;
  document.getElementById("pAdmissionType").innerText = document.getElementById("fieldAdmissionType").value;
  document.getElementById("pRankHtNo").innerText = document.getElementById("fieldRankHtNo").value || "N/A";
  document.getElementById("pFeeReimb").innerText = document.getElementById("fieldFeeReimb").value;
  document.getElementById("pApaarId").innerText = document.getElementById("fieldApaarId").value || "N/A";

  document.getElementById("pNameSsc").innerText = document.getElementById("fieldNameSsc").value;
  document.getElementById("pGender").innerText = document.getElementById("fieldGender").value;
  document.getElementById("pDob").innerText = document.getElementById("fieldDob").value;
  document.getElementById("pBloodGroup").innerText = document.getElementById("fieldBloodGroup").value;
  document.getElementById("pStudentMobile").innerText = document.getElementById("fieldStudentMobile").value;
  document.getElementById("pStudentEmail").innerText = document.getElementById("fieldStudentEmail").value;
  document.getElementById("pCategoryCaste").innerText = `${document.getElementById("fieldCategory").value} (${document.getElementById("fieldCaste").value || "N/A"})`;

  document.getElementById("pStudentAadhaar").innerText = document.getElementById("fieldStudentAadhaar").value.trim();
  document.getElementById("pIdMark1").innerText = document.getElementById("fieldIdMark1").value || "N/A";
  document.getElementById("pIdMark2").innerText = document.getElementById("fieldIdMark2").value || "N/A";

  document.getElementById("pSscRegd").innerText = document.getElementById("fieldSscRegd").value;
  document.getElementById("pSscMarks").innerText = `${document.getElementById("fieldSscMarks").value} (${document.getElementById("fieldSscPercent").value}%)`;
  document.getElementById("pInterRegd").innerText = document.getElementById("fieldInterRegd").value;
  document.getElementById("pInterMarks").innerText = `${document.getElementById("fieldInterMarks").value} (${document.getElementById("fieldInterPercent").value}%)`;

  document.getElementById("pFatherName").innerText = document.getElementById("fieldFatherName").value;
  document.getElementById("pFatherMobile").innerText = document.getElementById("fieldFatherMobile").value;
  document.getElementById("pFatherOcc").innerText = document.getElementById("fieldFatherOcc").value || "N/A";
  document.getElementById("pFatherAadhaar").innerText = document.getElementById("fieldFatherAadhaar").value.trim();

  document.getElementById("pMotherName").innerText = document.getElementById("fieldMotherName").value;
  document.getElementById("pMotherMobile").innerText = document.getElementById("fieldMotherMobile").value || "N/A";
  document.getElementById("pMotherOcc").innerText = document.getElementById("fieldMotherOcc").value || "N/A";
  document.getElementById("pMotherAadhaar").innerText = document.getElementById("fieldMotherAadhaar").value.trim();

  document.getElementById("pPermAddress").innerText = `${document.getElementById("fieldPermAddress").value}, Dist: ${document.getElementById("fieldPermDistrict").value}, ${document.getElementById("fieldPermState").value} - ${document.getElementById("fieldPermPincode").value}`;
  document.getElementById("pCurrAddress").innerText = `${document.getElementById("fieldCurrAddress").value}, Dist: ${document.getElementById("fieldCurrDistrict").value} - ${document.getElementById("fieldCurrPincode").value}`;

  const resStatus = document.getElementById("fieldResidentialStatus").value;
  document.getElementById("pResStatus").innerText = resStatus;

  const commuteMode = document.getElementById("fieldCommuteMode").value;
  const busStop = document.getElementById("fieldBusStop").value;
  document.getElementById("pLogisticsPoint").innerText = resStatus === "VVIT University Hostel"
    ? `Hostel (${document.getElementById("fieldHostelSharing").value})`
    : `${commuteMode} - ${commuteMode === "College Bus" ? busStop : "NA"}`;

  document.getElementById("pCoCurricular").innerText = document.getElementById("fieldCoCurricular").value || "Not interested";
  document.getElementById("pNccNss").innerText = document.getElementById("fieldNccNss").value;

  document.getElementById("pCombinedCardImg").src = combinedCardBase64;

  document.getElementById("formCard").style.display = "none";
  document.getElementById("previewCard").style.display = "block";
  window.scrollTo(0, 0);
}

function closePreviewToEdit() {
  document.getElementById("previewCard").style.display = "none";
  document.getElementById("formCard").style.display = "block";
}

// ================= STAGE 4: CLOUD SUBMISSION & PERSISTENCE =================
async function submitApplicationToCloud() {
  const submitBtn = document.getElementById("finalSubmitBtn");
  const statusEl = document.getElementById("submissionStatus");
  const postActions = document.getElementById("postSubmitActions");

  submitBtn.disabled = true;
  statusEl.style.display = "block";
  statusEl.style.color = "#2563eb";
  statusEl.innerText = "Submitting application and generating university records...";

  const commuteMode = document.getElementById("fieldCommuteMode").value.trim();
  const boardingStop = commuteMode === "College Bus" ? document.getElementById("fieldBusStop").value.trim() : "NA";

  const payload = {
    enrollmentNo: document.getElementById("fieldEnrollmentNo").value.trim(),
    admissionNo: document.getElementById("fieldAdmissionNo").value.trim(),
    programmeAdmitted: document.getElementById("fieldProgramme").value.trim(),
    programmeSection: document.getElementById("fieldSection").value.trim(),
    admissionType: document.getElementById("fieldAdmissionType").value.trim(),
    rankHtNo: document.getElementById("fieldRankHtNo").value.trim(),
    feeReimbursement: document.getElementById("fieldFeeReimb").value.trim(),
    apaarId: document.getElementById("fieldApaarId").value.trim(),

    studentNameSsc: document.getElementById("fieldNameSsc").value.trim(),
    gender: document.getElementById("fieldGender").value.trim(),
    dob: document.getElementById("fieldDob").value.trim(),
    bloodGroup: document.getElementById("fieldBloodGroup").value.trim(),
    category: document.getElementById("fieldCategory").value.trim(),
    caste: document.getElementById("fieldCaste").value.trim(), // Sub-Caste
    studentMobile: document.getElementById("fieldStudentMobile").value.trim(),
    studentEmail: document.getElementById("fieldStudentEmail").value.trim(),
    studentAadhaar: document.getElementById("fieldStudentAadhaar").value.trim(),
    identificationMark1: document.getElementById("fieldIdMark1").value.trim(),
    identificationMark2: document.getElementById("fieldIdMark2").value.trim(),

    sscRegdNo: document.getElementById("fieldSscRegd").value.trim(),
    sscMarks: document.getElementById("fieldSscMarks").value.trim(),
    sscPercentage: document.getElementById("fieldSscPercent").value.trim(),
    interRegdNo: document.getElementById("fieldInterRegd").value.trim(),
    interMarks: document.getElementById("fieldInterMarks").value.trim(),
    interPercentage: document.getElementById("fieldInterPercent").value.trim(),

    fatherName: document.getElementById("fieldFatherName").value.trim(),
    fatherMobile: document.getElementById("fieldFatherMobile").value.trim(),
    fatherOccupation: document.getElementById("fieldFatherOcc").value.trim(),
    fatherAadhaar: document.getElementById("fieldFatherAadhaar").value.trim(),
    motherName: document.getElementById("fieldMotherName").value.trim(),
    motherMobile: document.getElementById("fieldMotherMobile").value.trim(),
    motherOccupation: document.getElementById("fieldMotherOcc").value.trim(),
    motherAadhaar: document.getElementById("fieldMotherAadhaar").value.trim(),

    permanentAddress: document.getElementById("fieldPermAddress").value.trim(),
    permanentDistrict: document.getElementById("fieldPermDistrict").value.trim(),
    permanentState: document.getElementById("fieldPermState").value.trim(),
    permanentPincode: document.getElementById("fieldPermPincode").value.trim(),
    currentAddress: document.getElementById("fieldCurrAddress").value.trim(),
    currentDistrict: document.getElementById("fieldCurrDistrict").value.trim(),
    currentPincode: document.getElementById("fieldCurrPincode").value.trim(),

    coCurricular: document.getElementById("fieldCoCurricular").value.trim(), // Clubs / Sports / Not interested
    nccNss: document.getElementById("fieldNccNss").value.trim(),             // None / NCC / NSS
    residentialStatus: document.getElementById("fieldResidentialStatus").value.trim(),
    hostelSharing: document.getElementById("fieldHostelSharing") ? document.getElementById("fieldHostelSharing").value.trim() : "",
    collegeTravelMode: commuteMode,
    busBoardingPoint: boardingStop,

    photo: compressedPhotoBase64,
    signature: compressedSignBase64,
    combined: combinedCardBase64
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result && result.status === "success") {
      statusEl.style.color = "#16a34a";
      statusEl.innerHTML = `✓ Application Saved & PDF Backup Created for ${result.regdNo}!`;
      submitBtn.style.display = "none";
      if (document.querySelector(".screen-notice")) {
        document.querySelector(".screen-notice").style.display = "none";
      }
      const editBtn = document.querySelector(".preview-actions button:first-child");
      if (editBtn) editBtn.style.display = "none";

      postActions.style.display = "flex";

      // Trigger instant browser print dialog
      window.print();
    } else {
      throw new Error(result ? result.message : "Submission rejected");
    }
  } catch (err) {
    statusEl.style.color = "#dc2626";
    statusEl.innerText = `Submission failed: ${err.message}`;
    submitBtn.disabled = false;
  }
}
