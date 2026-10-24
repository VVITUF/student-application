// ==========================================
// FRONTEND LOGIC & CLIENT ORCHESTRATION
// ==========================================

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwIX5jqnxsYTwz3we0fwBvjkGHhdtQ5kkoaxISIO1tZj-AXW4JmIldF7o5xVUQVu4cs/exec";

let activeStudent = null;
let photoRawImg = null;
let signRawImg = null;
let compressedPhotoBase64 = null;
let compressedSignBase64 = null;
let combinedCardBase64 = null;

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
  if (d.Student_Name_SSC) document.getElementById("fieldNameSsc").value = d.Student_Name_SSC;
  if (d.Gender) document.getElementById("fieldGender").value = d.Gender;
  if (d.DOB) document.getElementById("fieldDob").value = d.DOB;
  if (d.Blood_Group) document.getElementById("fieldBloodGroup").value = d.Blood_Group;
  if (d.Category) document.getElementById("fieldCategory").value = d.Category;
  if (d.Caste) document.getElementById("fieldCaste").value = d.Caste;
  if (d.Student_Mobile) document.getElementById("fieldStudentMobile").value = d.Student_Mobile;
  if (d.Student_Email) document.getElementById("fieldStudentEmail").value = d.Student_Email;
  if (d.Student_Aadhaar) document.getElementById("fieldStudentAadhaar").value = d.Student_Aadhaar;
  if (d.APAAR_ID) document.getElementById("fieldApaarId").value = d.APAAR_ID;
  if (d.Identification_Mark_1) document.getElementById("fieldIdMark1").value = d.Identification_Mark_1;
  if (d.Identification_Mark_2) document.getElementById("fieldIdMark2").value = d.Identification_Mark_2;

  if (d.SSC_Regd_No) document.getElementById("fieldSscRegd").value = d.SSC_Regd_No;
  if (d.SSC_Marks) document.getElementById("fieldSscMarks").value = d.SSC_Marks;
  if (d.SSC_Percentage) document.getElementById("fieldSscPercent").value = d.SSC_Percentage;
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

  if (d.Co_Curricular) document.getElementById("fieldCoCurricular").value = d.Co_Curricular;
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
    if (d.Bus_Boarding_Point) document.getElementById("fieldBusStop").value = d.Bus_Boarding_Point;
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
    hostelGrp.style.display = "block";
    commuteGrp.style.display = "none";
    busGrp.style.display = "none";
  } else {
    hostelGrp.style.display = "none";
    commuteGrp.style.display = "block";
    handleCommuteChange();
  }
}

function handleCommuteChange() {
  const mode = document.getElementById("fieldCommuteMode").value;
  const busGrp = document.getElementById("busStopGroup");
  busGrp.style.display = mode === "College Bus" ? "block" : "none";
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
  const studentMobile = document.getElementById("fieldStudentMobile").value.trim();
  const fatherMobile = document.getElementById("fieldFatherMobile").value.trim();
  const motherMobile = document.getElementById("fieldMotherMobile").value.trim();

  const studentAadhaar = document.getElementById("fieldStudentAadhaar").value.trim();
  const fatherAadhaar = document.getElementById("fieldFatherAadhaar").value.trim();
  const motherAadhaar = document.getElementById("fieldMotherAadhaar").value.trim();

  // Validate 10-digit mobile numbers
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

  // Validate 12-digit identity numbers
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

  // Populate A4 Sheet
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
  
  // Render identity numbers in preview
  document.getElementById("pStudentAadhaar").innerText = document.getElementById("fieldStudentAadhaar").value.trim();
  document.getElementById("pIdMark1").innerText = document.getElementById("fieldIdMark1").value || "N/A";
  document.getElementById("pIdMark2").innerText = document.getElementById("fieldIdMark2").value || "N/A";

  document.getElementById("pSscRegd").innerText = document.getElementById("fieldSscRegd").value;
  document.getElementById("pSscMarks").innerText = `${document.getElementById("fieldSscMarks").value} (${document.getElementById("fieldSscPercent").value})`;
  document.getElementById("pInterRegd").innerText = document.getElementById("fieldInterRegd").value;
  document.getElementById("pInterMarks").innerText = `${document.getElementById("fieldInterMarks").value} (${document.getElementById("fieldInterPercent").value})`;

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
  document.getElementById("pLogisticsPoint").innerText = resStatus === "VVIT University Hostel" 
    ? `Hostel (${document.getElementById("fieldHostelSharing").value})`
    : `${document.getElementById("fieldCommuteMode").value} - ${document.getElementById("fieldBusStop").value || "Local Commute"}`;

  document.getElementById("pCoCurricular").innerText = document.getElementById("fieldCoCurricular").value || "None";
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
    caste: document.getElementById("fieldCaste").value.trim(),
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

    coCurricular: document.getElementById("fieldCoCurricular").value.trim(),
    nccNss: document.getElementById("fieldNccNss").value.trim(),
    residentialStatus: document.getElementById("fieldResidentialStatus").value.trim(),
    hostelSharing: document.getElementById("fieldHostelSharing").value.trim(),
    collegeTravelMode: document.getElementById("fieldCommuteMode").value.trim(),
    busBoardingPoint: document.getElementById("fieldBusStop").value.trim(),

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
      document.querySelector(".screen-notice").style.display = "none";
      document.querySelector(".preview-actions button:first-child").style.display = "none";

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
