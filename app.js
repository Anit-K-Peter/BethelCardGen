(function () {

  const form = document.getElementById('templateForm');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const submitBtn = document.getElementById('submitBtn');
  const userNameInput = document.getElementById('userName');
  const singleNameFields = document.getElementById('singleNameFields');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const extraFields = document.getElementById('extraFields');
  const husbandNameInput = document.getElementById('husbandName');
  const wifeNameInput = document.getElementById('wifeName');

  const templates = {
    birthday: { url: 'Template/Birthday_Template.png' },
    wedding: { url: 'Template/Wedding_Template.png' }
  };

  const templateRadios = document.querySelectorAll('input[name="template"]');
  const templateCards = document.querySelectorAll('.template-card');
  const previewImg = document.getElementById('previewImg');
  const currentTemplateImage = new Image();
  const previewCanvas = document.createElement('canvas');
  const previewCtx = previewCanvas.getContext('2d');
  const fontSelect = document.getElementById('fontSelect');
  const fontSizeRange = document.getElementById('fontSizeRange');
  const mobileStepper = document.getElementById('mobileStepper');
  const stepEdit = document.getElementById('stepEdit');
  const stepPreview = document.getElementById('stepPreview');
  const stepDownload = document.getElementById('stepDownload');
  const leftPane = document.getElementById('leftPane');
  const rightPane = document.getElementById('rightPane');
  const mobileActions = document.getElementById('mobileActions');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  function updateSelectionUI(selectedValue) {
    templateCards.forEach(card => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio && radio.value === selectedValue) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  }

  function drawBase(image) {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  }

  function updatePreview() {
    const selected = document.querySelector('input[name="template"]:checked');
    if (!selected) {
      if (previewImg) previewImg.removeAttribute('src');
      return;
    }
    const value = selected.value;
    if (!currentTemplateImage.complete || currentTemplateImage.naturalWidth === 0) {
      return;
    }
    drawBase(currentTemplateImage);
    if (value === 'birthday') {
      const nm = userNameInput.value.trim();
      if (nm) {
        const size = getAdaptiveFontSize(nm);
        applyTextStyle(size);
        ctx.fillText(nm, 400, 851.6);
      }
    } else if (value === 'wedding') {
      const h = husbandNameInput.value.trim();
      const w = wifeNameInput.value.trim();
      if (h) {
        const sizeH = getAdaptiveFontSize(h);
        applyTextStyle(sizeH);
        ctx.fillText(h, 353.9, 765.1);
      }
      if (w) {
        const sizeW = getAdaptiveFontSize(w);
        applyTextStyle(sizeW);
        ctx.fillText(w, 353.9, 898.3);
      }
    }
    if (previewImg) {
      const isNarrow = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
      const isMobileCover = document.body.classList.contains('mobile-cover');
      if (isNarrow && isMobileCover) {
        // Scale image to cover the viewport while preserving 16:9
        const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        // Base canvas is 1920x1080; compute cover scale
        const scaleCover = Math.max(vw / canvas.width, vh / canvas.height);
        const targetW = Math.max(1, Math.round(canvas.width * scaleCover));
        const targetH = Math.max(1, Math.round(canvas.height * scaleCover));
        previewCanvas.width = targetW;
        previewCanvas.height = targetH;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.drawImage(canvas, 0, 0, targetW, targetH);
        previewImg.src = previewCanvas.toDataURL('image/png');
        // Center via CSS object-fit: cover; image will crop; no offset needed
      } else {
        const scale = isNarrow ? 0.26 : 0.4;
        const targetW = Math.max(1, Math.round(canvas.width * scale));
        const targetH = Math.max(1, Math.round(canvas.height * scale));
        previewCanvas.width = targetW;
        previewCanvas.height = targetH;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.drawImage(canvas, 0, 0, targetW, targetH);
        previewImg.src = previewCanvas.toDataURL('image/png');
      }
    }
  }

  currentTemplateImage.onload = function () { updatePreview(); };

  function setActiveStep(step) {
    [stepEdit, stepPreview, stepDownload].forEach(s => s && s.classList.remove('active'));
    if (step) step.classList.add('active');
  }

  function updateMobileTabsVisibility() {
    const isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
    if (mobileStepper) mobileStepper.style.display = isMobile ? 'flex' : 'none';
    if (mobileActions) mobileActions.style.display = isMobile ? 'flex' : 'none';
    if (!isMobile) {
      leftPane.classList.remove('pane-hidden');
      rightPane.classList.remove('pane-hidden');
      setActiveStep(stepEdit);
      if (downloadBtn) downloadBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'inline-block';
    }
  }
  updateMobileTabsVisibility();
  window.addEventListener('resize', () => { updateMobileTabsVisibility(); updatePreview(); });

  function goToEdit() {
    setActiveStep(stepEdit);
    leftPane.classList.remove('pane-hidden');
    rightPane.classList.add('pane-hidden');
    if (downloadBtn) downloadBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'inline-block';
    document.body.classList.remove('mobile-cover');
    document.documentElement.classList.remove('mobile-cover');
  }
  function goToPreview() {
    setActiveStep(stepPreview);
    rightPane.classList.remove('pane-hidden');
    leftPane.classList.add('pane-hidden');
    if (downloadBtn) downloadBtn.style.display = 'inline-block';
    if (nextBtn) nextBtn.style.display = 'none';
    if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
      document.body.classList.add('mobile-cover');
      document.documentElement.classList.add('mobile-cover');
    }
    updatePreview();
  }

  if (stepEdit) stepEdit.addEventListener('click', goToEdit);
  if (stepPreview) stepPreview.addEventListener('click', goToPreview);
  if (backBtn) backBtn.addEventListener('click', goToEdit);
  if (nextBtn) nextBtn.addEventListener('click', goToPreview);

  templateRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updateSelectionUI(radio.value);
      if (radio.value === 'wedding') {
        extraFields.style.display = 'flex';
        if (singleNameFields) singleNameFields.style.display = 'none';
        userNameInput.required = false;
        husbandNameInput.required = true;
        wifeNameInput.required = true;
      } else {
        extraFields.style.display = 'none';
        if (singleNameFields) singleNameFields.style.display = 'block';
        userNameInput.required = true;
        husbandNameInput.required = false;
        wifeNameInput.required = false;
      }
      currentTemplateImage.src = templates[radio.value].url;
      updatePreview();
    });
  });

  userNameInput.addEventListener('input', updatePreview);
  husbandNameInput.addEventListener('input', updatePreview);
  wifeNameInput.addEventListener('input', updatePreview);
  if (fontSelect) fontSelect.addEventListener('change', updatePreview);
  if (fontSizeRange) fontSizeRange.addEventListener('input', updatePreview);

  // Initialize default visible fields state on first load
  (function initFieldsVisibility() {
    const selected = document.querySelector('input[name="template"]:checked');
    if (selected && selected.value === 'wedding') {
      extraFields.style.display = 'flex';
      if (singleNameFields) singleNameFields.style.display = 'none';
    } else {
      extraFields.style.display = 'none';
      if (singleNameFields) singleNameFields.style.display = 'block';
    }
  })();

  function sanitizeFileName(s) {
    return s.trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  }

  function getAdaptiveFontSize(text) {
    const base = parseInt(fontSizeRange ? fontSizeRange.value : '50', 10) || 50; // default size used previously
    if (!text) return base;
    const maxChars = 22;
    if (text.length <= maxChars) return base;
    const scaled = Math.floor(base * (maxChars / text.length));
    return Math.max(28, scaled); // keep it readable
  }

  function applyTextStyle(sizePx) {
    const family = fontSelect ? fontSelect.value : 'Alice';
    const fontFamily = family.includes(' ') ? `'${family}'` : family;
    ctx.fillStyle = 'black';
    ctx.font = `bold ${sizePx}px ${fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
  }

  function drawTextOnImage(image, options) {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    if (options.template === 'birthday') {
      const size = getAdaptiveFontSize(options.name);
      applyTextStyle(size);
      ctx.fillText(options.name, 400, 851.6);
    } else if (options.template === 'wedding') {
      const sizeH = getAdaptiveFontSize(options.husband);
      const sizeW = getAdaptiveFontSize(options.wife);
      applyTextStyle(sizeH);
      ctx.fillText(options.husband, 353.9, 765.1);
      applyTextStyle(sizeW);
      ctx.fillText(options.wife, 353.9, 898.3);
    }
  }

  function downloadImage(dataURL, filename) {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const selectedTemplateInput = form.querySelector('input[name="template"]:checked');
    if (!selectedTemplateInput) {
      alert('Please select a template.');
      return;
    }

    const selectedTemplate = selectedTemplateInput.value;
    let imageTextOptions = { template: selectedTemplate };

    if (selectedTemplate === 'birthday') {
      const userName = userNameInput.value.trim();
      if (!userName) {
        alert('Please enter your name.');
        return;
      }
      imageTextOptions.name = userName;
    } else {
      const husband = husbandNameInput.value.trim();
      const wife = wifeNameInput.value.trim();
      if (!husband || !wife) {
        alert('Please enter both names.');
        return;
      }
      imageTextOptions.husband = husband;
      imageTextOptions.wife = wife;
    }

    submitBtn.disabled = true;
    loadingOverlay.style.display = 'flex';

    const img = new Image();
    img.onload = function () {
      setTimeout(() => {
        try {
          drawTextOnImage(img, imageTextOptions);
          const baseName = selectedTemplate === 'birthday'
            ? sanitizeFileName(imageTextOptions.name)
            : sanitizeFileName(imageTextOptions.husband + '_' + imageTextOptions.wife);
          const dateStr = new Date().toISOString().split('T')[0];
          const filename = `${selectedTemplate}_${baseName}_${dateStr}.png`;
          const dataURL = canvas.toDataURL('image/png');
          downloadImage(dataURL, filename);
          alert('Your personalized template is ready for download!');
        } catch (err) {
          alert('Error generating image: ' + err.message);
        } finally {
          loadingOverlay.style.display = 'none';
          submitBtn.disabled = false;
        }
      }, 1000);
    };

    img.onerror = function () {
      alert('Failed to load the selected template image.');
      loadingOverlay.style.display = 'none';
      submitBtn.disabled = false;
    };

    img.src = templates[selectedTemplate].url;
  });

})();


