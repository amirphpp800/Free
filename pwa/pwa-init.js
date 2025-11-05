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
    console.error('❌ Service Worker registration failed:', error);
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

function setupPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    showToast('ابزارستان با موفقیت نصب شد!', 'success');
    deferredPrompt = null;
    hideInstallButton();
  });
}

// نمایش نوتیفیکیشن نصب
function showInstallButton() {
  // بررسی اینکه قبلاً نمایش داده شده یا نه
  const hasSeenNotification = localStorage.getItem('pwa-install-notification-shown');
  
  if (hasSeenNotification === 'true') {
    console.log('نوتیفیکیشن نصب قبلاً نمایش داده شده است');
    return;
  }
  
  // نمایش با تاخیر 3 ثانیه
  setTimeout(() => {
    const notification = document.createElement('div');
    notification.id = 'pwa-install-notification';
    notification.className = 'pwa-install-notification';
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
          <p>برای دسترسی سریع‌تر و استفاده آفلاین</p>
        </div>
        <div class="pwa-install-actions">
          <button onclick="installPWA()" class="btn btn-red btn-sm">نصب</button>
          <button onclick="dismissInstallNotification()" class="btn btn-ghost btn-sm">بعداً</button>
        </div>
        <button onclick="dismissInstallNotification()" class="pwa-install-close" aria-label="بستن">×</button>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // ذخیره اینکه نوتیفیکیشن نمایش داده شده
    localStorage.setItem('pwa-install-notification-shown', 'true');
    
    // بستن خودکار بعد از 15 ثانیه
    setTimeout(() => {
      dismissInstallNotification();
    }, 15000);
  }, 3000);
}

// مخفی کردن نوتیفیکیشن نصب
function hideInstallButton() {
  dismissInstallNotification();
}

// بستن نوتیفیکیشن نصب
window.dismissInstallNotification = function() {
  const notification = document.getElementById('pwa-install-notification');
  if (notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }
};

// نصب PWA
async function installPWA() {
  if (!deferredPrompt) {
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
}

// Export برای استفاده در سایر فایل‌ها
window.PWA = {
  install: installPWA,
  clearCache: window.clearPWACache,
  isInstalled: isPWAInstalled,
  showToast: showToast
};

console.log('🚀 PWA initialized');
