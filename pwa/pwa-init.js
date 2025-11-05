// PWA Initialization Script
// ثبت و مدیریت Service Worker

// بررسی پشتیبانی از Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
    setupPWAInstallPrompt();
    checkForUpdates();
  });
}

// ثبت Service Worker
async function registerServiceWorker() {
  try {
    // بررسی اینکه آیا در محیط مناسب هستیم
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      console.log('⚠️ Service Worker requires HTTPS or localhost');
      return;
    }

    const registration = await navigator.serviceWorker.register('/pwa/sw.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registered successfully:', registration.scope);

    // بررسی به‌روزرسانی
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🔄 Service Worker update found');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // نسخه جدید آماده است
          showUpdateNotification();
        }
      });
    });

    // مدیریت پیام‌های Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 Message from SW:', event.data);
    });

    // بررسی وضعیت آنلاین/آفلاین
    window.addEventListener('online', () => {
      console.log('🌐 Back online');
      showToast('اتصال اینترنت برقرار شد', 'success');
    });

    window.addEventListener('offline', () => {
      console.log('📵 Gone offline');
      showToast('در حالت آفلاین هستید', 'warning');
    });

  } catch (error) {
    console.warn('⚠️ Service Worker not available:', error.message);
  }
}

// نمایش نوتیفیکیشن برای به‌روزرسانی
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'pwa-update-notification';
  notification.innerHTML = `
    <div class="pwa-notification-content">
      <p>نسخه جدید ابزارستان آماده است!</p>
      <div class="pwa-notification-actions">
        <button onclick="updateServiceWorker()" class="btn btn-orange btn-sm">به‌روزرسانی</button>
        <button onclick="dismissUpdateNotification()" class="btn btn-ghost btn-sm">بعداً</button>
      </div>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
}

// به‌روزرسانی Service Worker
window.updateServiceWorker = function() {
  navigator.serviceWorker.getRegistration().then((registration) => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  });
};

// بستن نوتیفیکیشن
window.dismissUpdateNotification = function() {
  const notification = document.querySelector('.pwa-update-notification');
  if (notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }
};

// مدیریت نصب PWA
let deferredPrompt;

// تشخیص دستگاه
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

function setupPWAInstallPrompt() {
  // برای Android و مرورگرهای پشتیبانی‌کننده
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  // برای iOS - نمایش دستورالعمل نصب دستی
  if (isIOS() && !isInStandaloneMode()) {
    showInstallButton(true); // true = iOS mode
  }

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    showToast('ابزارستان با موفقیت نصب شد!', 'success');
    deferredPrompt = null;
    hideInstallButton();
  });
}

// نمایش نوتیفیکیشن نصب
function showInstallButton(isIOSDevice = false) {
  // نمایش دکمه در فوتر
  const footerButton = document.getElementById('installPWAFooter');
  if (footerButton) {
    footerButton.style.display = 'flex';
    footerButton.addEventListener('click', () => {
      if (isIOSDevice) {
        showIOSInstallInstructions();
      } else {
        installPWA();
      }
    });
  }
  
  // نمایش دکمه در منوی موبایل
  const mobileButton = document.getElementById('installPWAMobile');
  if (mobileButton) {
    mobileButton.style.display = 'flex';
    mobileButton.addEventListener('click', () => {
      if (isIOSDevice) {
        showIOSInstallInstructions();
      } else {
        installPWA();
      }
    });
  }
  
  // حذف سیستم تاخیر - نوتیفیکیشن در هر ریلود نمایش داده می‌شود
  // localStorage.removeItem('pwa-install-dismissed-time'); // پاک کردن تاخیر قدیمی
  
  // نمایش در تمام دستگاه‌ها (موبایل و دسکتاپ)
  // if (!isMobile()) {
  //   console.log('دستگاه موبایل نیست، نوتیفیکیشن نمایش داده نمی‌شود');
  //   return;
  // }
  
  // نمایش با تاخیر 3 ثانیه
  setTimeout(() => {
    const notification = document.createElement('div');
    notification.id = 'pwa-install-notification';
    notification.className = 'pwa-install-notification';
    
    let installButtonText = 'نصب';
    let installDescription = 'برای دسترسی سریع‌تر و استفاده آفلاین';
    
    if (isIOSDevice) {
      installButtonText = 'راهنما';
      installDescription = 'نحوه نصب روی صفحه اصلی';
    }
    
    notification.innerHTML = `
      <div class="pwa-install-content">
        <div class="pwa-install-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </div>
        <div class="pwa-install-text">
          <strong>نصب اپلیکیشن ابزارستان</strong>
          <p>${installDescription}</p>
        </div>
        <div class="pwa-install-actions">
          <button onclick="${isIOSDevice ? 'showIOSInstallInstructions()' : 'installPWA()'}" class="btn btn-red btn-sm">${installButtonText}</button>
          <button onclick="dismissInstallNotification()" class="btn btn-ghost btn-sm">بعداً</button>
        </div>
        <button onclick="dismissInstallNotification()" class="pwa-install-close" aria-label="بستن">×</button>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // بستن خودکار بعد از 20 ثانیه
    setTimeout(() => {
      dismissInstallNotification();
    }, 20000);
  }, 3000);
}

// مخفی کردن نوتیفیکیشن نصب
function hideInstallButton() {
  // پاک کردن تاخیر چون PWA نصب شد
  localStorage.removeItem('pwa-install-dismissed-time');
  
  const notification = document.getElementById('pwa-install-notification');
  if (notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }
  
  // مخفی کردن دکمه فوتر
  const footerButton = document.getElementById('installPWAFooter');
  if (footerButton) {
    footerButton.style.display = 'none';
  }
  
  // مخفی کردن دکمه موبایل
  const mobileButton = document.getElementById('installPWAMobile');
  if (mobileButton) {
    mobileButton.style.display = 'none';
  }
}

// بستن نوتیفیکیشن نصب
window.dismissInstallNotification = function() {
  const notification = document.getElementById('pwa-install-notification');
  if (notification) {
    // حذف ذخیره‌سازی تاخیر - نوتیفیکیشن در هر ریلود دوباره نمایش داده می‌شود
    // localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
    
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }
};

// نمایش دستورالعمل نصب برای iOS
function showIOSInstallInstructions() {
  const modal = document.createElement('div');
  modal.className = 'pwa-ios-modal';
  modal.innerHTML = `
    <div class="pwa-ios-modal-content">
      <button onclick="closeIOSModal()" class="pwa-ios-close">×</button>
      <h3>نصب ابزارستان روی iOS</h3>
      <div class="pwa-ios-steps">
        <div class="pwa-ios-step">
          <div class="pwa-ios-step-number">۱</div>
          <p>روی دکمه <strong>اشتراک‌گذاری</strong> (مربع با فلش) در پایین صفحه کلیک کنید</p>
        </div>
        <div class="pwa-ios-step">
          <div class="pwa-ios-step-number">۲</div>
          <p>گزینه <strong>"Add to Home Screen"</strong> را انتخاب کنید</p>
        </div>
        <div class="pwa-ios-step">
          <div class="pwa-ios-step-number">۳</div>
          <p>روی <strong>"Add"</strong> کلیک کنید تا اپلیکیشن نصب شود</p>
        </div>
      </div>
      <button onclick="closeIOSModal()" class="btn btn-red">متوجه شدم</button>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

window.showIOSInstallInstructions = showIOSInstallInstructions;

window.closeIOSModal = function() {
  const modal = document.querySelector('.pwa-ios-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
};

// نصب PWA
async function installPWA() {
  if (!deferredPrompt) {
    // اگر iOS است، راهنما را نمایش بده
    if (isIOS()) {
      showIOSInstallInstructions();
    } else {
      showToast('نصب در این مرورگر پشتیبانی نمی‌شود', 'warning');
    }
    return;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User response to install prompt: ${outcome}`);
  
  if (outcome === 'accepted') {
    showToast('در حال نصب...', 'info');
  }
  
  deferredPrompt = null;
  hideInstallButton();
}

window.installPWA = installPWA;

// بررسی به‌روزرسانی‌های دوره‌ای
function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    setInterval(() => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
        }
      });
    }, 60 * 60 * 1000); // هر 1 ساعت
  }
}

// نمایش Toast
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `pwa-toast pwa-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// مدیریت کش
window.clearPWACache = async function() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
      showToast('کش پاک شد', 'success');
    }
  }
};

// بررسی وضعیت نصب
function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

if (isPWAInstalled()) {
  console.log('✅ Running as PWA');
  document.documentElement.classList.add('pwa-installed');
} else {
  console.log('📱 Device:', isMobile() ? 'Mobile' : 'Desktop');
  console.log('🍎 iOS:', isIOS() ? 'Yes' : 'No');
}

// Export برای استفاده در سایر فایل‌ها
window.PWA = {
  install: installPWA,
  clearCache: window.clearPWACache,
  isInstalled: isPWAInstalled,
  showToast: showToast
};

console.log('🚀 PWA initialized');
